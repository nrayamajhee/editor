CREATE EXTENSION IF NOT EXISTS pgcrypto;
create table document (
    id UUID default gen_random_uuid() primary key not null,
    title text not null,
    content text not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);
