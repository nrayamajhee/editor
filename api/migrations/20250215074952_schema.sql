create or replace function update_modified_row()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

CREATE EXTENSION IF NOT EXISTS pgcrypto;

create table users (
    id UUID default gen_random_uuid() primary key not null,
    clerk_id text unique not null,
    username text unique not null,
    email text not null,
    first_name text not null,
    last_name text not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table note (
    id UUID default gen_random_uuid() primary key not null,
    title text not null,
    content text not null,
    author_id UUID not null references users(id),
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

create trigger update_note_updated_at
  before update on note 
  for each row execute function update_modified_row();

create table photo (
    name text not null primary key,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

create trigger update_photo_updated_at
  before update on photo
  for each row execute function update_modified_row();

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

create trigger update_weather_updated_at
  before update on weather
  for each row execute function update_modified_row();
