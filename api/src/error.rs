use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};

pub type JsonRes<T> = Result<Json<T>, AppError>;

#[allow(dead_code)]
pub type Res<T> = Result<T, AppError>;

pub enum AppError {
    WithStatus(StatusCode, anyhow::Error),
    Internal(anyhow::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        match self {
            AppError::WithStatus(status, error) => (status, error.to_string()).into_response(),
            AppError::Internal(error) => {
                (StatusCode::INTERNAL_SERVER_ERROR, error.to_string()).into_response()
            }
        }
    }
}

impl<E> From<E> for AppError
where
    E: Into<anyhow::Error>,
{
    fn from(err: E) -> Self {
        Self::Internal(err.into())
    }
}
