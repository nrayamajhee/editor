use crate::error::{JsonRes, Res};
use axum::{
    extract::{Query, State},
    Json,
};
use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::AppState;

#[derive(TS, Deserialize, Serialize, PartialEq)]
pub enum TemperatureUnit {
    C,
    F,
}

#[derive(Deserialize)]
pub struct Q {
    pub lat: String,
    pub long: String,
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
}

#[derive(TS)]
#[ts(export)]
#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Weather {
    pub current: CurrentWeather,
    pub location: LocationResponse,
}

#[derive(Clone, PartialEq, Hash, Eq)]
pub struct WeatherHash {
    pub lat: String,
    pub long: String,
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

pub async fn get(State(app): State<AppState>, Query(query): Query<Q>) -> JsonRes<Weather> {
    let id = WeatherHash {
        lat: query.lat.to_owned(),
        long: query.long.to_owned(),
    };
    let weather = {
        let cache = app.weather_cache.lock().unwrap();
        cache.get(&id).map(|w| {
            if (Utc::now()
                - DateTime::parse_from_rfc3339(&w.current.time)
                    .unwrap()
                    .to_utc())
                < Duration::try_minutes(10).unwrap()
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
                "https://api.open-meteo.com/v1/forecast?latitude={}&longitude={}&current=temperature_2m,wind_speed_10m,weather_code&temperature_unit={}",
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
