mod document;

use anyhow::Result;
use axum::{
    http::{
        header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE},
        HeaderValue, Method, StatusCode,
    },
    response::{IntoResponse, Response as AxumRes},
    routing::get,
    Json, Router,
};
use clerk_rs::{clerk::Clerk, ClerkConfiguration};
use dotenv::dotenv;
use serde::Serialize;
use sqlx::{postgres::PgPoolOptions, PgPool};
use tower_http::cors::CorsLayer;

use clerk_rs::validators::{axum::ClerkLayer, jwks::MemoryCacheJwksProvider};

#[derive(Clone)]
struct AppState {
    db: PgPool,
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
    let clerk = Clerk::new(config);
    let app = Router::new()
        .route("/", get(root))
        .route("/documents", get(document::get_all).post(document::create))
        .route("/document/:slug", get(document::get).post(document::update))
        .layer(ClerkLayer::new(
            MemoryCacheJwksProvider::new(clerk),
            None,
            true,
        ))
        .layer(
            CorsLayer::new()
                .allow_origin(env_var!("APP_URL").parse::<HeaderValue>()?)
                .allow_headers([AUTHORIZATION, ACCEPT, CONTENT_TYPE])
                .allow_methods([Method::GET, Method::POST]),
        )
        .with_state(AppState { db });
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await?;
    axum::serve(listener, app).await?;
    Ok(())
}

async fn root() -> &'static str {
    "Hello, World!"
}

pub enum Response<T: Serialize> {
    Success(T),
    Error(String),
}

impl<T: Serialize> IntoResponse for Response<T> {
    fn into_response(self) -> AxumRes {
        match self {
            Response::Success(json) => (StatusCode::OK, Json(json)).into_response(),
            Response::Error(error) => (StatusCode::INTERNAL_SERVER_ERROR, error).into_response(),
        }
    }
}
