use crate::{clerk::get_user, error::JsonRes, AppState};
use axum::{
    extract::{Path, State},
    Extension, Json,
};
use chrono::{DateTime, Utc};
use clerk_rs::validators::authorizer::ClerkJwt;
use serde::{self, Deserialize, Serialize};
use sqlx::{query, query_as};
use ts_rs::TS;
use uuid::Uuid;

#[derive(TS)]
#[ts(export)]
#[derive(Serialize, Deserialize)]
pub struct Note {
    id: Uuid,
    author_id: Uuid,
    title: String,
    content: String,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(TS)]
#[ts(export)]
#[derive(Deserialize)]
pub struct UpdateNote {
    content: Option<String>,
    title: Option<String>,
}

#[derive(TS)]
#[ts(export)]
#[derive(Deserialize)]
pub struct NewNote {
    title: String,
    content: String,
}

pub async fn get(Path(id): Path<Uuid>, State(app): State<AppState>) -> JsonRes<Note> {
    let note = query_as!(Note, "select * from note where id = $1", id)
        .fetch_one(&app.db)
        .await?;
    Ok(Json(note))
}

pub async fn update(
    Path(id): Path<Uuid>,
    State(app): State<AppState>,
    Json(doc): Json<UpdateNote>,
) -> JsonRes<Note> {
    if doc.content.is_some() {
        query!(
            "update note set content = $1 where id = $2",
            doc.content,
            id
        )
        .execute(&app.db)
        .await?;
    }
    if doc.title.is_some() {
        query_as!(
            Note,
            "update note set title = $1 where id = $2",
            doc.title,
            id
        )
        .execute(&app.db)
        .await?;
    }
    let note = query_as!(Note, "select * from note where id = $1", id)
        .fetch_one(&app.db)
        .await?;
    Ok(Json(note))
}

#[axum::debug_handler]
pub async fn create(
    State(app): State<AppState>,
    Extension(jwt): Extension<ClerkJwt>,
    Json(doc): Json<NewNote>,
) -> JsonRes<Note> {
    let user = get_user(&app.db, &jwt.sub).await?;
    let note = query_as!(
        Note,
        "insert into note (title, content, author_id) values ($1, $2, $3) returning *",
        doc.title,
        doc.content,
        user.id
    )
    .fetch_one(&app.db)
    .await?;
    Ok(Json(note))
}

pub async fn delete(
    Path(id): Path<Uuid>,
    State(app): State<AppState>,
    Extension(jwt): Extension<ClerkJwt>,
) -> JsonRes<Note> {
    let user = get_user(&app.db, &jwt.sub).await?;
    let note = query_as!(
        Note,
        "delete from note where id = $1 and author_id = $2  returning *",
        id,
        user.id
    )
    .fetch_one(&app.db)
    .await?;
    Ok(Json(note))
}

pub async fn get_all(
    State(app): State<AppState>,
    Extension(jwt): Extension<ClerkJwt>,
) -> JsonRes<Vec<Note>> {
    let user = get_user(&app.db, &jwt.sub).await?;
    let notes = query_as!(Note, "select * from note where author_id = $1", user.id)
        .fetch_all(&app.db)
        .await?;
    Ok(Json(notes))
}
