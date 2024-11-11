mod document;
mod error;
use anyhow::Result;
use axum::{
    extract::{Multipart, Query, State},
    http::{
        header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE},
        HeaderValue, Method,
    },
    response::Response,
    routing::{get, post},
    Json, Router,
};
use clerk_rs::validators::{axum::ClerkLayer, jwks::MemoryCacheJwksProvider};
use clerk_rs::{clerk::Clerk, ClerkConfiguration};
use dotenv::dotenv;
use error::{AppError, JsonRes, Res};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use sqlx::{postgres::PgPoolOptions, PgPool};
use std::{collections::HashMap, path::PathBuf};
use tower_http::cors::CorsLayer;
use ts_rs::TS;
use utapi_rs::UtApi;

#[derive(Clone)]
struct AppState {
    db: PgPool,
    utapi: UtApi,
    reqwest: Client,
}

macro_rules! env_var {
    ($l: expr) => {{
        let val = std::env::var(String::from($l)).expect(&$l);
        val
    }};
}

async fn upload(State(state): State<AppState>, mut multipart: Multipart) -> Result<(), AppError> {
    let file = multipart.next_field().await.unwrap().unwrap();
    // let body = state.utapi.get_usage_info().await.unwrap();
    // let name = file.name().unwrap();
    // state
    //     .utapi
    //     .upload_files(vec![FileObj { name, path }], None, true)
    //     .await
    //     .unwrap();
    Ok(())
}

#[derive(Deserialize)]
pub struct F {
    pub name: String,
    pub path: PathBuf,
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
    let utapi = UtApi::new(Some(env_var!("UP_TOKEN")));
    let reqwest = Client::new();
    let app = Router::new()
        .route("/documents", get(document::get_all).post(document::create))
        .route("/document/:id", get(document::get).post(document::update))
        .route("/upload", post(upload))
        .layer(ClerkLayer::new(
            MemoryCacheJwksProvider::new(clerk),
            None,
            true,
        ))
        // .route("/upload", get(list_files).post(upload_files))
        .route("/weather", get(weather))
        .route("/", get(root))
        .layer(
            CorsLayer::new()
                .allow_origin(env_var!("APP_URL").parse::<HeaderValue>()?)
                .allow_headers([AUTHORIZATION, ACCEPT, CONTENT_TYPE])
                .allow_methods([Method::GET, Method::POST]),
        )
        .with_state(AppState { db, utapi, reqwest });
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await?;
    axum::serve(listener, app).await?;
    Ok(())
}

async fn root() -> &'static str {
    "Hello"
}

#[derive(TS, Deserialize, Serialize, PartialEq)]
enum TemperatureUnit {
    C,
    F,
}

#[derive(Deserialize)]
struct Q {
    lat: String,
    long: String,
    unit: TemperatureUnit,
}

#[derive(TS)]
#[ts(export)]
#[derive(Deserialize, Serialize)]
struct CurrentWeather {
    time: String,
    temperature_2m: f64,
    wind_speed_10m: f64,
}

#[derive(Deserialize)]
struct WeatherResponse {
    current: CurrentWeather,
}

#[axum::debug_handler]
async fn weather(State(app): State<AppState>, Query(query): Query<Q>) -> JsonRes<CurrentWeather> {
    let res = app
        .reqwest
        .get(format!(
                "https://api.open-meteo.com/v1/forecast?latitude={}&longitude={}&current=temperature_2m,wind_speed_10m&temperature_unit={}",
            query.lat,
            query.long,
            if query.unit == TemperatureUnit::C  {
              "celsius"
            } else {
              "fahrenheit"
            }
        ))
        .send()
        .await?
        .json::<WeatherResponse>()
        .await?;
    Ok(Json(res.current))
}
