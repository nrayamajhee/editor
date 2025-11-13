create table transaction (
    id UUID default gen_random_uuid() primary key not null,
    user_id UUID not null references users(id),
    date timestamp with time zone not null,
    account_type text not null,
    account_name text not null,
    account_number text,
    institution_name text not null,
    name text not null,
    amount decimal(15, 2) not null,
    description text not null,
    category text not null,
    transaction_tags text[],
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

create trigger update_transaction_updated_at
  before update on transaction
  for each row execute function update_modified_row();
