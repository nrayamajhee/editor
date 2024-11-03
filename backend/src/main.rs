use std::sync::Arc;

use anyhow::Result;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use clerk_rs::{clerk::Clerk, ClerkConfiguration};
use dotenv::dotenv;
use serde::{Deserialize, Serialize};
use sqlx::{postgres::PgPoolOptions, PgPool};

#[derive(Clone)]
struct AppState {
    db: PgPool,
    auth: Arc<Clerk>,
}

macro_rules! env_var {
    ($l: expr) => {{
        let val = std::env::var(String::from($l)).expect(&$l);
        val
    }};
}

#[tokio::main]
async fn main() -> Result<()> {
    dotenv().ok();
    tracing_subscriber::fmt::init();
    let db = PgPoolOptions::new()
        .max_connections(5)
        .connect(&std::env::var("DATABASE_URL")?)
        .await?;
    let config = ClerkConfiguration::new(None, None, Some(env_var!("CLERK_SECRET")), None);
    let auth = Arc::new(Clerk::new(config));
    let app = Router::new()
        .route("/", get(root))
        .route("/document/:slug", get(document))
        .with_state(AppState { db, auth });
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await?;
    axum::serve(listener, app).await?;
    Ok(())
}

async fn root() -> &'static str {
    "Hello, World!"
}

#[derive(Serialize, Deserialize, Debug)]
struct Document {
    slug: String,
    title: String,
    content: String,
}

enum AppResponse<T: Serialize> {
    Success((StatusCode, Json<T>)),
    Error((StatusCode, String)),
}

impl<T: Serialize> IntoResponse for AppResponse<T> {
    fn into_response(self) -> Response {
        match self {
            AppResponse::Success((code, json)) => (code, json).into_response(),
            AppResponse::Error((code, json)) => (code, json).into_response(),
        }
    }
}

async fn document(
    Path(slug): Path<String>,
    State(AppState { db, auth }): State<AppState>,
) -> AppResponse<Document> {
    let document_query = sqlx::query_as!(Document, "select * from document where slug = $1", slug)
        .fetch_one(&db)
        .await;
    match document_query {
        Ok(document) => AppResponse::Success((StatusCode::OK, Json(document))),
        Err(err) => AppResponse::Error((StatusCode::INTERNAL_SERVER_ERROR, err.to_string())),
    }
}
