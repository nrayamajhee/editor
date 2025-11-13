use crate::{clerk::get_user, error::JsonRes, AppState};
use axum::{
    extract::{Multipart, Path, State},
    Extension, Json,
};
use chrono::{DateTime, Utc};
use clerk_rs::validators::authorizer::ClerkJwt;
use serde::{self, Deserialize, Serialize};
use sqlx::query_as;
use sqlx::types::BigDecimal;
use std::str::FromStr;
use uuid::Uuid;

// #[derive(TS)]
// #[ts(export)]
#[derive(Serialize, Deserialize)]
pub struct Transaction {
    id: Uuid,
    user_id: Uuid,
    date: DateTime<Utc>,
    account_type: String,
    account_name: String,
    account_number: Option<String>,
    institution_name: String,
    name: String,
    // #[ts(type = "number")]
    amount: BigDecimal,
    description: String,
    category: String,
    transaction_tags: Option<Vec<String>>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

// #[derive(TS)]
// #[ts(export)]
#[derive(Deserialize)]
pub struct NewTransaction {
    date: DateTime<Utc>,
    account_type: String,
    account_name: String,
    account_number: Option<String>,
    institution_name: String,
    name: String,
    // #[ts(type = "number")]
    amount: BigDecimal,
    description: String,
    category: String,
    transaction_tags: Option<Vec<String>>,
}

pub async fn get(Path(id): Path<Uuid>, State(app): State<AppState>) -> JsonRes<Transaction> {
    let transaction = query_as!(Transaction, "select * from transaction where id = $1", id)
        .fetch_one(&app.db)
        .await?;
    Ok(Json(transaction))
}

#[axum::debug_handler]
pub async fn create(
    State(app): State<AppState>,
    Extension(jwt): Extension<ClerkJwt>,
    Json(doc): Json<NewTransaction>,
) -> JsonRes<Transaction> {
    let user = get_user(&app.db, &jwt.sub).await?;
    let transaction = query_as!(
        Transaction,
        r#"insert into transaction (
            user_id, date, account_type, account_name, account_number,
            institution_name, name, amount, description, category, transaction_tags
        ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        returning *"#,
        user.id,
        doc.date,
        doc.account_type,
        doc.account_name,
        doc.account_number,
        doc.institution_name,
        doc.name,
        doc.amount,
        doc.description,
        doc.category,
        doc.transaction_tags.as_deref(),
    )
    .fetch_one(&app.db)
    .await?;
    Ok(Json(transaction))
}

pub async fn get_all(
    State(app): State<AppState>,
    Extension(jwt): Extension<ClerkJwt>,
) -> JsonRes<Vec<Transaction>> {
    let user = get_user(&app.db, &jwt.sub).await?;
    let transactions = query_as!(
        Transaction,
        "select * from transaction where user_id = $1",
        user.id
    )
    .fetch_all(&app.db)
    .await?;
    Ok(Json(transactions))
}

#[derive(Deserialize)]
struct CsvTransactionRecord {
    date: String,
    account_type: String,
    account_name: String,
    account_number: Option<String>,
    institution_name: String,
    name: String,
    amount: String,
    description: String,
    category: String,
    transaction_tags: Option<String>,
}

#[derive(Serialize)]
pub struct UploadResult {
    success: usize,
    failed: usize,
    errors: Vec<String>,
}

#[axum::debug_handler]
pub async fn upload_csv(
    State(app): State<AppState>,
    Extension(jwt): Extension<ClerkJwt>,
    mut multipart: Multipart,
) -> JsonRes<UploadResult> {
    let user = get_user(&app.db, &jwt.sub).await?;

    let mut success_count = 0;
    let mut failed_count = 0;
    let mut errors = Vec::new();

    while let Some(field) = multipart.next_field().await? {
        let name = field.name().unwrap_or("").to_string();

        if name == "file" {
            let data = field.bytes().await?;
            let mut rdr = csv::Reader::from_reader(data.as_ref());

            for (index, result) in rdr.deserialize::<CsvTransactionRecord>().enumerate() {
                let row_num = index + 2; // +2 because CSV is 1-indexed and has header

                match result {
                    Ok(record) => {
                        match parse_and_insert_transaction(&app, &user.id, record).await {
                            Ok(_) => success_count += 1,
                            Err(e) => {
                                failed_count += 1;
                                errors.push(format!("Row {}: {}", row_num, e));
                            }
                        }
                    }
                    Err(e) => {
                        failed_count += 1;
                        errors.push(format!("Row {}: CSV parse error - {}", row_num, e));
                    }
                }
            }
        }
    }

    Ok(Json(UploadResult {
        success: success_count,
        failed: failed_count,
        errors,
    }))
}

async fn parse_and_insert_transaction(
    app: &AppState,
    user_id: &Uuid,
    record: CsvTransactionRecord,
) -> Result<Transaction, anyhow::Error> {
    // Parse date
    let date = DateTime::parse_from_rfc3339(&record.date)
        .map(|dt| dt.with_timezone(&Utc))
        .or_else(|_| {
            chrono::NaiveDateTime::parse_from_str(&record.date, "%Y-%m-%d %H:%M:%S")
                .map(|ndt| ndt.and_utc())
        })
        .or_else(|_| {
            chrono::NaiveDate::parse_from_str(&record.date, "%Y-%m-%d")
                .map(|nd| nd.and_hms_opt(0, 0, 0).unwrap().and_utc())
        })?;

    // Parse amount
    let amount = BigDecimal::from_str(&record.amount)?;

    // Parse transaction_tags
    let transaction_tags = record.transaction_tags.map(|tags| {
        tags.split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect::<Vec<String>>()
    });

    // Insert into database
    let transaction = query_as!(
        Transaction,
        r#"insert into transaction (
            user_id, date, account_type, account_name, account_number,
            institution_name, name, amount, description, category, transaction_tags
        ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        returning *"#,
        user_id,
        date,
        record.account_type,
        record.account_name,
        record.account_number,
        record.institution_name,
        record.name,
        amount,
        record.description,
        record.category,
        transaction_tags.as_deref(),
    )
    .fetch_one(&app.db)
    .await?;

    Ok(transaction)
}
