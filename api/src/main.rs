macro_rules! env_var {
    ($l: expr) => {{
        let val = std::env::var(String::from($l)).expect($l);
        val
    }};
}

mod clerk;
mod document;
mod error;
mod picture;
mod weather;

use anyhow::Result;
use aws_config::{BehaviorVersion, Region};
use axum::{
    extract::{MatchedPath, Request},
    http::{
        header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE},
        HeaderValue, Method,
    },
    routing::{get, post},
    Router,
};
use clerk_rs::validators::{axum::ClerkLayer, jwks::MemoryCacheJwksProvider};
use clerk_rs::{clerk::Clerk, ClerkConfiguration};
use dotenv::dotenv;
use reqwest::Client;
use serde::Deserialize;
use sqlx::{postgres::PgPoolOptions, PgPool};
use std::path::PathBuf;
use tower_http::{
    cors::{AllowOrigin, CorsLayer},
    services::ServeDir,
    trace::TraceLayer,
};
use tracing::info_span;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[derive(Clone)]
struct AppState {
    db: PgPool,
    reqwest: Client,
    s3: aws_sdk_s3::Client,
    clerk: Clerk,
}

#[derive(Deserialize)]
pub struct F {
    pub name: String,
    pub path: PathBuf,
}

#[tokio::main]
async fn main() -> Result<()> {
    dotenv().ok();
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| {
                format!(
                    "{}=debug,tower_http=debug,axum::rejection=trace",
                    env!("CARGO_CRATE_NAME")
                )
                .into()
            }),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();
    let db = PgPoolOptions::new()
        .max_connections(5)
        .connect(&env_var!("DATABASE_URL"))
        .await?;
    let config = ClerkConfiguration::new(None, None, Some(env_var!("CLERK_SECRET")), None);
    let clerk = Clerk::new(config);
    let reqwest = Client::new();
    let config = aws_config::load_defaults(BehaviorVersion::latest())
        .await
        .into_builder()
        .endpoint_url(env_var!("S3_URL"))
        .region(Region::new("auto"))
        .credentials_provider(aws_sdk_s3::config::SharedCredentialsProvider::new(
            aws_sdk_s3::config::Credentials::new(
                env_var!("R2_ACCESS_KEY_ID"),
                env_var!("R2_ACCESS_KEY_SECRET"),
                None,
                None,
                "r2",
            ),
        ))
        .build();
    let s3 = aws_sdk_s3::Client::new(&config);
    let allow_origin = env_var!("ALLOW_ORIGIN")
        .parse::<String>()?
        .split(",")
        .map(|s| s.trim().parse::<HeaderValue>().unwrap())
        .collect::<Vec<_>>();
    let allow_origin = AllowOrigin::list(allow_origin.into_iter());
    let app = Router::new()
        .route("/documents", get(document::get_all).post(document::create))
        .route(
            "/document/:id",
            get(document::get)
                .post(document::update)
                .delete(document::delete),
        )
        .route("/weather", get(weather::get))
        .route("/pictures", get(picture::get_all).post(picture::upload))
        .layer(ClerkLayer::new(
            MemoryCacheJwksProvider::new(clerk.clone()),
            None,
            true,
        ))
        .route("/clerk-webhook", post(clerk::post_webhook))
        .nest_service("/assets", ServeDir::new("/assets"))
        .route("/", get(root))
        .layer(
            CorsLayer::new()
                .allow_origin(allow_origin)
                .allow_headers([AUTHORIZATION, ACCEPT, CONTENT_TYPE])
                .allow_methods([Method::GET, Method::POST, Method::DELETE, Method::OPTIONS]),
        )
        .layer(
            TraceLayer::new_for_http().make_span_with(|request: &Request<_>| {
                let matched_path = request
                    .extensions()
                    .get::<MatchedPath>()
                    .map(MatchedPath::as_str);

                info_span!(
                    "http_request",
                    method = ?request.method(),
                    matched_path,
                    some_other_field = tracing::field::Empty,
                )
            }),
        )
        .with_state(AppState {
            db,
            reqwest,
            s3,
            clerk,
        });
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await?;
    axum::serve(listener, app).await?;
    Ok(())
}

async fn root() -> &'static str {
    "Hello!"
}
