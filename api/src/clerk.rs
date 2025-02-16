use axum::{extract::State, Json};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::query_as;
use uuid::Uuid;

use crate::{error::JsonRes, AppState};

#[derive(Deserialize)]
struct ClerkUser {
    id: String,
    first_name: String,
    last_name: String,
    username: String,
    created_at: i64,
    updated_at: i64,
}

#[derive(Deserialize)]
pub struct ClerkWebhook {
    #[serde(alias = "type")]
    webhook_type: String,
    data: ClerkUser,
}

#[derive(Deserialize, Serialize)]
struct User {
    id: Uuid,
    clerk_id: String,
    first_name: String,
    last_name: String,
    username: String,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct WebhookResponse {
    webhook_type: String,
    webhook_status: String,
}

#[axum::debug_handler]
pub async fn post_webhook(
    State(app): State<AppState>,
    Json(webhook): Json<ClerkWebhook>,
) -> JsonRes<WebhookResponse> {
    if webhook.webhook_type == "user.created" {
        let ClerkUser {
            id,
            first_name,
            last_name,
            username,
            created_at,
            updated_at,
        } = webhook.data;
        query_as!(
            User,
            "insert into users (
            clerk_id,
            first_name,
            last_name,
            username,
            created_at,
            updated_at
        ) values ($1, $2, $3, $4, $5, $6)",
            id,
            first_name,
            last_name,
            username,
            DateTime::from_timestamp_millis(created_at),
            DateTime::from_timestamp_millis(updated_at),
        )
        .execute(&app.db)
        .await?;
        Ok(Json(WebhookResponse {
            webhook_type: webhook.webhook_type,
            webhook_status: "User created!".to_owned(),
        }))
    } else {
        Err(anyhow::Error::msg("Only image format is supported").into())
    }
}
