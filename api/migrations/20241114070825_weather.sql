CREATE EXTENSION IF NOT EXISTS pgcrypto;
create table weather (
    id text primary key not null,
    location text not null,
    temperature_2m double precision not null,
    wind_speed_10m double precision not null,
    relative_humidity_2m double precision not null,
    apparent_temperature double precision not null,
    precipitation_probability double precision not null,
    weather_code integer not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);
