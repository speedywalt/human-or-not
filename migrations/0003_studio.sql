create table if not exists passes (
  user_id text primary key,
  expires_at timestamptz not null
);

create table if not exists studio_images (
  prompt_index integer primary key,
  image text not null,
  created_at timestamptz not null default now()
);
