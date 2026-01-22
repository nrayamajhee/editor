use axum::extract::Path;
use axum::Extension;
use axum::{
    extract::{Multipart, State},
    response::IntoResponse,
    Json,
};
use chrono::{DateTime, Utc};
use clerk_rs::validators::authorizer::ClerkJwt;
use serde::{Deserialize, Serialize};
use sqlx::query_as;
use ts_rs::TS;
use uuid::Uuid;

use crate::clerk::get_user;
use crate::{
    error::{AppError, JsonRes},
    AppState,
};

#[derive(TS)]
#[ts(export)]
#[derive(Deserialize, Serialize)]
pub struct Photo {
    pub name: String,
    pub caption: String,
    pub author_id: Uuid,
    pub size_b: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

pub async fn upload(
    State(app): State<AppState>,
    Extension(jwt): Extension<ClerkJwt>,
    mut multipart: Multipart,
) -> JsonRes<Photo> {
    let file = multipart.next_field().await?.unwrap();
    let name = file.file_name().unwrap().to_owned();
    let content_type = file.content_type().unwrap();
    let user = get_user(&app.db, &jwt.sub).await?;
    if content_type.contains("image") {
        let bytes = file.bytes().await?;
        let size_b = bytes.len() as i64;
        let body = aws_sdk_s3::primitives::ByteStream::from(bytes);
        let caption = "";
        app.s3
            .put_object()
            .bucket("editor")
            .key(name.clone())
            .body(body)
            .send()
            .await?;
        let photo = query_as!(
            Photo,
            "insert into photo (name, caption, author_id, size_b) values ($1, $2, $3, $4) returning *",
            name,
            caption,
            user.id,
            size_b
        )
        .fetch_one(&app.db)
        .await?;
        Ok(Json(photo))
    } else {
        Err(anyhow::Error::msg("Only image format is supported").into())
    }
}

pub async fn get_all(
    State(app): State<AppState>,
    Extension(jwt): Extension<ClerkJwt>,
) -> JsonRes<Vec<Photo>> {
    let user = get_user(&app.db, &jwt.sub).await?;
    let photos = query_as!(Photo, "select * from photo where author_id = $1", user.id)
        .fetch_all(&app.db)
        .await?;
    Ok(Json(photos))
}

#[allow(dead_code)]
pub async fn delete(
    Path(id): Path<String>,
    State(app): State<AppState>,
    Extension(jwt): Extension<ClerkJwt>,
) -> JsonRes<Photo> {
    let user = get_user(&app.db, &jwt.sub).await?;
    let document = query_as!(
        Photo,
        "delete from photo where name = $1 and author_id = $2 returning *",
        id,
        user.id
    )
    .fetch_one(&app.db)
    .await?;
    Ok(Json(document))
}

#[allow(dead_code)]
pub async fn get(Path(id): Path<String>, State(app): State<AppState>) -> JsonRes<Photo> {
    let document = query_as!(Photo, "select * from photo where name = $1", id)
        .fetch_one(&app.db)
        .await?;
    Ok(Json(document))
}

pub async fn view(
    Path(name): Path<String>,
    State(app): State<AppState>,
    Extension(jwt): Extension<ClerkJwt>,
) -> Result<impl IntoResponse, AppError> {
    let user = get_user(&app.db, &jwt.sub).await?;

    // Verify ownership
    let _photo = query_as!(
        Photo,
        "select * from photo where name = $1 and author_id = $2",
        name,
        user.id
    )
    .fetch_one(&app.db)
    .await?;

    let object = app
        .s3
        .get_object()
        .bucket("editor")
        .key(name)
        .send()
        .await
        .map_err(|e| anyhow::Error::new(e))?;

    let bytes = object
        .body
        .collect()
        .await
        .map_err(|e| anyhow::Error::new(e))?
        .into_bytes();

    let body = axum::body::Body::from(bytes);

    let mut headers = axum::http::HeaderMap::new();
    if let Some(content_type) = object.content_type {
        headers.insert(
            axum::http::header::CONTENT_TYPE,
            content_type.parse().unwrap(),
        );
    }
    if let Some(content_length) = object.content_length {
        headers.insert(
            axum::http::header::CONTENT_LENGTH,
            content_length.to_string().parse().unwrap(),
        );
    }
    headers.insert(
        axum::http::header::CACHE_CONTROL,
        "private, max-age=2592000".parse().unwrap(),
    );

    Ok((headers, body))
}
