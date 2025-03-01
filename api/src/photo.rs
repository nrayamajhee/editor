use axum::extract::Path;
use axum::{
    extract::{Multipart, State},
    Json,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::query_as;
use ts_rs::TS;

use crate::{error::JsonRes, AppState};

#[derive(TS)]
#[ts(export)]
#[derive(Deserialize, Serialize)]
pub struct Photo {
    pub name: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

pub async fn upload(State(app): State<AppState>, mut multipart: Multipart) -> JsonRes<Photo> {
    let file = multipart.next_field().await?.unwrap();
    let name = file.file_name().unwrap().to_owned();
    let content_type = file.content_type().unwrap();
    if content_type.contains("image") {
        let body = aws_sdk_s3::primitives::ByteStream::from(file.bytes().await?);
        app.s3
            .put_object()
            .bucket("editor")
            .key(name.clone())
            .acl(aws_sdk_s3::types::ObjectCannedAcl::PublicRead)
            .body(body)
            .send()
            .await?;
        let photo = query_as!(
            Photo,
            "insert into photo (name) values ($1) returning *",
            name,
        )
        .fetch_one(&app.db)
        .await?;
        Ok(Json(photo))
    } else {
        Err(anyhow::Error::msg("Only image format is supported").into())
    }
}

pub async fn get_all(State(app): State<AppState>) -> JsonRes<Vec<Photo>> {
    let photos = query_as!(Photo, "select * from photo")
        .fetch_all(&app.db)
        .await?;
    Ok(Json(photos))
}

#[allow(dead_code)]
pub async fn delete(Path(id): Path<String>, State(app): State<AppState>) -> JsonRes<Photo> {
    let document = query_as!(Photo, "delete from photo where name = $1 returning *", id)
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
