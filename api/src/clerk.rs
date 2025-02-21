use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    Json,
};
use base64::prelude::*;
use chrono::{DateTime, Utc};
use hmac::Hmac;
use hmac::Mac;
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use sqlx::query_as;
use uuid::Uuid;

type HmacSha256 = Hmac<Sha256>;

use crate::{
    error::{AppError, JsonRes},
    AppState,
};

#[derive(Deserialize)]
struct Email {
    email_address: String,
}

#[derive(Deserialize)]
struct ClerkUser {
    id: String,
    username: String,
    email_addresses: Vec<Email>,
    first_name: String,
    last_name: String,
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
    username: String,
    email: String,
    first_name: String,
    last_name: String,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct WebhookResponse {
    webhook_type: String,
    webhook_status: String,
}

fn verify_signature(header: &HeaderMap, body: &String) -> Result<(), AppError> {
    let svix_headers = {
        let svix_id = header.get("svix-id");
        let svix_timestamp = header.get("svix-timestamp");
        let svix_signature = header.get("svix-signature");
        if svix_id.is_none() || svix_timestamp.is_none() || svix_signature.is_none() {
            Err("No header".to_string())
        } else {
            Ok((
                svix_id.unwrap().to_owned(),
                svix_timestamp.unwrap().to_owned(),
                svix_signature.unwrap().to_owned(),
            ))
        }
    };
    if svix_headers.is_err() {
        return Err(AppError::WithStatus(
            StatusCode::BAD_REQUEST,
            anyhow::Error::msg("SVIX headers missing!".to_string()),
        ));
    }
    let svix_secret =
        BASE64_STANDARD.decode(env_var!("SVIX_SECRET").split("_").collect::<Vec<&str>>()[1])?;
    let (svix_id, svix_timestamp, svix_signature) = svix_headers.unwrap();
    let svix_signature = svix_signature.to_str()?.split(",").collect::<Vec<&str>>()[1];
    let mac = {
        let mut mac = HmacSha256::new_from_slice(&svix_secret)?;
        mac.update(
            format!(
                "{}.{}.{}",
                svix_id.to_str()?,
                svix_timestamp.to_str()?,
                body
            )
            .as_bytes(),
        );
        let mac = mac.finalize().into_bytes();
        BASE64_STANDARD.encode(mac)
    };
    if mac != svix_signature {
        return Err(AppError::WithStatus(
            StatusCode::BAD_REQUEST,
            anyhow::Error::msg("Invalid signature!".to_string()),
        ));
    }
    Ok(())
}

pub async fn post_webhook(
    header: HeaderMap,
    State(app): State<AppState>,
    body: String,
) -> JsonRes<WebhookResponse> {
    let signature_verify = verify_signature(&header, &body);
    if let Err(e) = signature_verify {
        return Err(e);
    }
    let webhook: ClerkWebhook = serde_json::from_str(&body)?;
    let allow_webhook = webhook.webhook_type == "user.created";
    if allow_webhook {
        let ClerkUser {
            id,
            first_name,
            last_name,
            username,
            email_addresses,
            created_at,
            updated_at,
        } = webhook.data;
        query_as!(
            User,
            "insert into users (
            clerk_id,
            email,
            username,
            first_name,
            last_name,
            created_at,
            updated_at
        ) values ($1, $2, $3, $4, $5, $6, $7)",
            id,
            email_addresses[0].email_address,
            username,
            first_name,
            last_name,
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
        Err(AppError::WithStatus(
            StatusCode::BAD_REQUEST,
            anyhow::Error::msg("Webhook is misconfigured".to_string()),
        ))
    }
}
