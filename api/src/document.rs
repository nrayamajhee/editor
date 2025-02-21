use crate::{error::JsonRes, AppState};
use axum::{
    extract::{Path, State},
    Extension, Json,
};
use chrono::{DateTime, Utc};
use clerk_rs::validators::authorizer::ClerkJwt;
use serde::{self, Deserialize, Serialize};
use sqlx::{query, query_as};
use ts_rs::TS;
use uuid::Uuid;

#[derive(TS)]
#[ts(export)]
#[derive(Serialize, Deserialize)]
pub struct Document {
    id: Uuid,
    author_id: Uuid,
    title: String,
    content: String,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(TS)]
#[ts(export)]
#[derive(Deserialize)]
pub struct UpdateDocument {
    content: Option<String>,
    title: Option<String>,
}

#[derive(TS)]
#[ts(export)]
#[derive(Deserialize)]
pub struct NewDocument {
    title: String,
    content: String,
}

pub async fn get(Path(id): Path<Uuid>, State(app): State<AppState>) -> JsonRes<Document> {
    let document = query_as!(Document, "select * from document where id = $1", id)
        .fetch_one(&app.db)
        .await?;
    Ok(Json(document))
}

pub async fn update(
    Path(id): Path<Uuid>,
    State(app): State<AppState>,
    Json(doc): Json<UpdateDocument>,
) -> JsonRes<Document> {
    if doc.content.is_some() {
        query!(
            "update document set content = $1 where id = $2",
            doc.content,
            id
        )
        .execute(&app.db)
        .await?;
    }
    if doc.title.is_some() {
        query_as!(
            Document,
            "update document set title = $1 where id = $2",
            doc.title,
            id
        )
        .execute(&app.db)
        .await?;
    }
    let document = query_as!(Document, "select * from document where id = $1", id)
        .fetch_one(&app.db)
        .await?;
    Ok(Json(document))
}

#[derive(Deserialize, Serialize)]
struct User {
    pub user_id: String,
}

#[derive(Deserialize, Serialize, Debug)]
struct UserId {
    pub id: Uuid,
}

#[axum::debug_handler]
pub async fn create(
    State(app): State<AppState>,
    Extension(jwt): Extension<ClerkJwt>,
    Json(doc): Json<NewDocument>,
) -> JsonRes<Document> {
    tracing::debug!("JWT {:?}", &jwt.sub);
    let user = query_as!(UserId, "select id from users where clerk_id = $1", jwt.sub)
        .fetch_one(&app.db)
        .await?;
    tracing::debug!("USER {:?}", &user);
    let document = query_as!(
        Document,
        "insert into document (title, content, author_id) values ($1, $2, $3) returning *",
        doc.title,
        doc.content,
        user.id
    )
    .fetch_one(&app.db)
    .await?;
    Ok(Json(document))
}

pub async fn delete(Path(id): Path<Uuid>, State(app): State<AppState>) -> JsonRes<Document> {
    let document = query_as!(
        Document,
        "delete from document where id = $1 returning *",
        id
    )
    .fetch_one(&app.db)
    .await?;
    Ok(Json(document))
}

pub async fn get_all(State(app): State<AppState>) -> JsonRes<Vec<Document>> {
    let documents = query_as!(Document, "select * from document")
        .fetch_all(&app.db)
        .await?;
    Ok(Json(documents))
}
