use crate::{error::JsonRes, AppState};
use axum::{
    extract::{Path, State},
    Json,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{query, query_as};
use ts_rs::TS;
use uuid::Uuid;

#[derive(TS)]
#[ts(export)]
#[derive(Serialize, Deserialize)]
pub struct Document {
    id: Uuid,
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
        .await
        .unwrap();
    }
    if doc.title.is_some() {
        query_as!(
            Document,
            "update document set title = $1 where id = $2",
            doc.title,
            id
        )
        .execute(&app.db)
        .await
        .unwrap();
    }
    let document = query_as!(Document, "select * from document where id = $1", id)
        .fetch_one(&app.db)
        .await?;
    Ok(Json(document))
}

pub async fn create(
    State(app): State<AppState>,
    Json(doc): Json<NewDocument>,
) -> JsonRes<Document> {
    let document = query_as!(
        Document,
        "insert into document (title, content) values ($1, $2) returning *",
        doc.title,
        doc.content,
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
