mod document;
mod error;
use anyhow::Result;
use axum::{
    extract::{Multipart, Query, State},
    http::{
        header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE},
        HeaderValue, Method,
    },
    routing::{get, post},
    Json, Router,
};
use chrono::{DateTime, Duration, Utc};
use clerk_rs::validators::{axum::ClerkLayer, jwks::MemoryCacheJwksProvider};
use clerk_rs::{clerk::Clerk, ClerkConfiguration};
use dotenv::dotenv;
use error::{JsonRes, Res};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use sqlx::{postgres::PgPoolOptions, PgPool};
use std::{
    collections::HashMap,
    io::prelude::*,
    sync::{Arc, Mutex},
};
use std::{fs::File, path::PathBuf};
use tower_http::{cors::CorsLayer, services::ServeDir};
use ts_rs::TS;

#[derive(Clone)]
struct AppState {
    db: PgPool,
    reqwest: Client,
    weather_cache: Arc<Mutex<HashMap<WeatherHash, Weather>>>,
}

macro_rules! env_var {
    ($l: expr) => {{
        let val = std::env::var(String::from($l)).expect(&$l);
        val
    }};
}

async fn upload(State(_): State<AppState>, mut multipart: Multipart) -> Res<()> {
    let file = multipart.next_field().await?.unwrap();
    let name = file.file_name().unwrap().to_owned();
    let path = format!("/assets/{}", name);
    let bytes = file.bytes().await?;
    let mut file = File::create(path.clone())?;
    file.write(&bytes[..])?;
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
    let weather_cache = Arc::new(Mutex::new(HashMap::new()));
    let reqwest = Client::new();
    let app = Router::new()
        .route("/documents", get(document::get_all).post(document::create))
        .route("/document/:id", get(document::get).post(document::update))
        .route("/upload", post(upload))
        .route("/weather", get(weather))
        .layer(ClerkLayer::new(
            MemoryCacheJwksProvider::new(clerk),
            None,
            true,
        ))
        .nest_service("/assets", ServeDir::new("/assets"))
        .route("/", get(root))
        .layer(
            CorsLayer::new()
                .allow_origin(env_var!("APP_URL").parse::<HeaderValue>()?)
                .allow_headers([AUTHORIZATION, ACCEPT, CONTENT_TYPE])
                .allow_methods([Method::GET, Method::POST]),
        )
        .with_state(AppState {
            db,
            reqwest,
            weather_cache,
        });
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
#[derive(Deserialize, Serialize, Clone, Debug)]
struct CurrentWeather {
    time: i64,
    temperature_2m: f64,
    wind_speed_10m: f64,
    weather_code: i32,
}

#[derive(TS)]
#[ts(export)]
#[derive(Deserialize, Serialize, Clone, Debug)]
struct Weather {
    current: CurrentWeather,
    location: LocationResponse,
}

#[derive(Clone, PartialEq, Hash, Eq)]
struct WeatherHash {
    lat: String,
    long: String,
}

#[derive(Deserialize)]
struct WeatherResponse {
    current: CurrentWeather,
}

#[derive(TS)]
#[ts(export)]
#[derive(Deserialize, Serialize, Clone, Debug)]
struct Address {
    city: Option<String>,
    county: Option<String>,
}

#[derive(TS)]
#[ts(export)]
#[derive(Deserialize, Serialize, Clone, Debug)]
struct LocationResponse {
    display_name: String,
    address: Address,
}

#[axum::debug_handler]
async fn weather(State(app): State<AppState>, Query(query): Query<Q>) -> JsonRes<Weather> {
    let id = WeatherHash {
        lat: query.lat.to_owned(),
        long: query.long.to_owned(),
    };
    let weather = {
        let cache = app.weather_cache.lock().unwrap();
        cache.get(&id).map(|w| {
            if (Utc::now()
                - DateTime::from_timestamp(w.current.time, 0)
                    .unwrap()
                    .to_utc())
                < Duration::try_hours(10).unwrap()
            {
                Some(w.to_owned())
            } else {
                None
            }
        })
    };
    if let Some(weather) = weather {
        Ok(Json(weather.unwrap()))
    } else {
        let res = app
        .reqwest
        .get(format!(
                "https://api.open-meteo.com/v1/forecast?latitude={}&longitude={}&current=temperature_2m,wind_speed_10m,weather_code&temperature_unit={}&timeformat=unixtime",
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
            .json::<WeatherResponse>().await?;
        let current = res.current;
        let location = app
            .reqwest
            .get(format!(
                "https://us1.locationiq.com/v1/reverse?key={}&lat={}&lon={}&format=json",
                env_var!("LOC_TOKEN"),
                query.lat,
                query.long,
            ))
            .send()
            .await?
            .json::<LocationResponse>()
            .await?;
        let weather = Weather { current, location };
        {
            let mut cache = app.weather_cache.lock().unwrap();
            cache.insert(id, weather.clone());
        }
        Ok(Json(weather))
    }
}
