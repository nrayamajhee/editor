use crate::{AppState, Response};
use anyhow::Result;
use axum::{
    extract::{Path, State},
    Json,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::query_as;
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
    content: String,
}

#[derive(TS)]
#[ts(export)]
#[derive(Deserialize)]
pub struct NewDocument {
    title: String,
    content: String,
}

pub async fn get(
    Path(id): Path<Uuid>,
    State(AppState { db }): State<AppState>,
) -> Response<Document> {
    let document_query = query_as!(Document, "select * from document where id = $1", id)
        .fetch_one(&db)
        .await;
    match document_query {
        Ok(document) => Response::Success(document),
        Err(err) => Response::Error(err.to_string()),
    }
}

#[axum::debug_handler]
pub async fn update(
    Path(id): Path<Uuid>,
    State(AppState { db }): State<AppState>,
    Json(doc): Json<UpdateDocument>,
) -> Response<Document> {
    let document_query: Result<_, sqlx::Error> = try {
        query_as!(
            Document,
            "update document set content = $1 where id = $2",
            doc.content,
            id
        )
        .execute(&db)
        .await?;
        query_as!(Document, "select * from document where id = $1", id)
            .fetch_one(&db)
            .await?
    };
    match document_query {
        Ok(document) => Response::Success(document),
        Err(err) => Response::Error(err.to_string()),
    }
}

pub async fn create(
    State(AppState { db }): State<AppState>,
    Json(doc): Json<NewDocument>,
) -> Response<Document> {
    let document_query = query_as!(
        Document,
        "insert into document (title, content) values ($1, $2) returning *",
        doc.title,
        doc.content,
    )
    .fetch_one(&db)
    .await;
    match document_query {
        Ok(document) => Response::Success(document),
        Err(err) => Response::Error(err.to_string()),
    }
}

pub async fn get_all(State(AppState { db }): State<AppState>) -> Response<Vec<Document>> {
    let query = query_as!(Document, "select * from document")
        .fetch_all(&db)
        .await;
    match query {
        Ok(documents) => Response::Success(documents),
        Err(err) => Response::Error(err.to_string()),
    }
}
