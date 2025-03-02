alter table photo
  add caption text not null,
  add author_id UUID not null references users(id),
  add size_b bigint not null;
