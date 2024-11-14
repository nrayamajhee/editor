use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};

pub type JsonRes<T> = Result<Json<T>, AppError>;

#[allow(dead_code)]
pub type Res<T> = Result<T, AppError>;

pub struct AppError(pub anyhow::Error);

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        (StatusCode::INTERNAL_SERVER_ERROR, format!("{}", self.0)).into_response()
    }
}

impl<E> From<E> for AppError
where
    E: Into<anyhow::Error>,
{
    fn from(err: E) -> Self {
        Self(err.into())
    }
}
