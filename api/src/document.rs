use crate::{AppState, Response};
use anyhow::Result;
use axum::{
    extract::{Path, State},
    Json,
};
use serde::{Deserialize, Serialize};
use sqlx::query_as;
use ts_rs::TS;

#[derive(TS)]
#[ts(export)]
#[derive(Serialize, Deserialize)]
pub struct Document {
    slug: String,
    title: String,
    content: String,
}

#[derive(TS)]
#[ts(export)]
#[derive(Deserialize)]
pub struct UpdateDocument {
    content: String,
}

pub async fn get(
    Path(slug): Path<String>,
    State(AppState { db, auth: _ }): State<AppState>,
) -> Response<Document> {
    let document_query = query_as!(Document, "select * from document where slug = $1", slug)
        .fetch_one(&db)
        .await;
    match document_query {
        Ok(document) => Response::Success(document),
        Err(err) => Response::Error(err.to_string()),
    }
}

#[axum::debug_handler]
pub async fn update(
    Path(slug): Path<String>,
    State(AppState { db, auth: _ }): State<AppState>,
    Json(doc): Json<UpdateDocument>,
) -> Response<Document> {
    let document_query: Result<_, sqlx::Error> = try {
        query_as!(
            Document,
            "update document set content = $1 where slug = $2",
            doc.content,
            slug
        )
        .execute(&db)
        .await?;
        query_as!(Document, "select * from document where slug = $1", slug)
            .fetch_one(&db)
            .await?
    };
    match document_query {
        Ok(document) => Response::Success(document),
        Err(err) => Response::Error(err.to_string()),
    }
}

pub async fn create(
    State(AppState { db, auth: _ }): State<AppState>,
    Json(doc): Json<Document>,
) -> Response<Document> {
    let document_query = query_as!(
        Document,
        "insert into document (slug, title, content) values ($1, $2, $3)",
        doc.slug,
        doc.title,
        doc.content,
    )
    .execute(&db)
    .await;
    match document_query {
        Ok(_) => Response::Success(doc),
        Err(err) => Response::Error(err.to_string()),
    }
}

pub async fn get_all(State(AppState { db, auth }): State<AppState>) -> Response<Vec<Document>> {
    let query = query_as!(Document, "select * from document")
        .fetch_all(&db)
        .await;
    match query {
        Ok(documents) => Response::Success(documents),
        Err(err) => Response::Error(err.to_string()),
    }
}
