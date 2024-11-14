use std::fs::File;
use std::io::prelude::*;

use axum::{
    extract::{Multipart, State},
    Json,
};
use chrono::{DateTime, Utc};
use serde::Deserialize;
use sqlx::query_as;
use ts_rs::TS;
use uuid::Uuid;

use crate::{
    error::{JsonRes, Res},
    AppState,
};

pub async fn upload(State(_): State<AppState>, mut multipart: Multipart) -> Res<()> {
    let file = multipart.next_field().await?.unwrap();
    let name = file.file_name().unwrap().to_owned();
    let path = format!("/assets/{}", name);
    let bytes = file.bytes().await?;
    let mut file = File::create(path.clone())?;
    file.write(&bytes[..])?;
    Ok(())
}

#[derive(TS)]
#[ts(export)]
#[derive(Deserialize)]
pub struct NewPicture {
    name: String,
}

#[derive(TS)]
#[ts(export)]
#[derive(Deserialize)]
pub struct Picture {
    id: Uuid,
    name: String,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

pub async fn create(State(app): State<AppState>, Json(pic): Json<NewPicture>) -> JsonRes<Picture> {
    let picture = query_as!(
        Picture,
        "insert into picture (name) values ($1) returning *",
        pic.name
    )
    .fetch_one(&app.db)
    .await?;
    Ok(Json(picture))
}
