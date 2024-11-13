CREATE EXTENSION IF NOT EXISTS pgcrypto;
create table picture (
    id UUID default gen_random_uuid() primary key not null,
    name text not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);
