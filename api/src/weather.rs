use crate::error::JsonRes;
use axum::{
    extract::{Query, State},
    Json,
};
use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{query, query_as};
use ts_rs::TS;

use crate::AppState;

#[derive(TS, Deserialize, Serialize, PartialEq)]
pub enum TemperatureUnit {
    C,
    F,
}

#[derive(Deserialize)]
pub struct WeatherQuery {
    pub lat: f64,
    pub lon: f64,
    pub unit: TemperatureUnit,
}

#[derive(TS)]
#[ts(export)]
#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct CurrentWeather {
    pub time: String,
    pub temperature_2m: f64,
    pub wind_speed_10m: f64,
    pub weather_code: i32,
    pub relative_humidity_2m: f64,
    pub apparent_temperature: f64,
    pub precipitation_probability: f64,
}

#[derive(Deserialize)]
struct WeatherResponse {
    current: CurrentWeather,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
struct Address {
    city: Option<String>,
    county: Option<String>,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
struct LocationResponse {
    address: Address,
}

#[derive(TS)]
#[ts(export)]
#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Weather {
    pub id: String,
    pub location: String,
    pub temperature_2m: f64,
    pub wind_speed_10m: f64,
    pub weather_code: i32,
    pub relative_humidity_2m: f64,
    pub apparent_temperature: f64,
    pub precipitation_probability: f64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(TS)]
#[ts(export)]
#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct NewWeather {
    pub lat: f64,
    pub lon: f64,
}

pub async fn get(
    State(app): State<AppState>,
    Query(query): Query<WeatherQuery>,
) -> JsonRes<Weather> {
    let id = format!("({:.2},{:.2})", query.lat, query.lon);
    query!("delete from weather where created_at < (now() - INTERVAL '1 min')")
        .execute(&app.db)
        .await?;
    let weather = query_as!(Weather, "select * from weather where id = $1", id)
        .fetch_optional(&app.db)
        .await?;
    let weather = weather
        .map(|w| {
            if (Utc::now() - w.created_at) < Duration::try_minutes(1).unwrap() {
                Some(w)
            } else {
                None
            }
        })
        .unwrap_or(None);
    if let Some(weather) = weather {
        Ok(Json(weather))
    } else {
        let res = app
        .reqwest
        .get(format!(
                "https://api.open-meteo.com/v1/forecast?latitude={}&longitude={}&current=temperature_2m,wind_speed_10m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code&temperature_unit=celsius",
            query.lat,
            query.lon,
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
                query.lon,
            ))
            .send()
            .await?
            .json::<LocationResponse>()
            .await?;
        let location = location.address.city.unwrap_or(
            location
                .address
                .county
                .unwrap_or("unknown location".to_owned()),
        );
        let mut weather = query_as!(
            Weather,
            "insert into weather (
               id,
               location,
               temperature_2m,
               wind_speed_10m,
               weather_code,
               relative_humidity_2m,
               apparent_temperature,
               precipitation_probability
            ) values ($1, $2, $3, $4, $5, $6, $7, $8) returning *",
            id,
            location,
            current.temperature_2m,
            current.wind_speed_10m,
            current.weather_code,
            current.relative_humidity_2m,
            current.apparent_temperature,
            current.precipitation_probability
        )
        .fetch_one(&app.db)
        .await?;
        if query.unit == TemperatureUnit::F {
            weather.temperature_2m = weather.temperature_2m * (9. / 5.) + 32.;
        }
        Ok(Json(weather))
    }
}
