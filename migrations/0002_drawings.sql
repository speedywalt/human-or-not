create table if not exists drawings (
  id serial primary key,
  prompt_index integer not null,
  image text not null,
  created_at timestamptz not null default now()
);

create index if not exists drawings_prompt_idx on drawings (prompt_index);
