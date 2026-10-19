alter table drawings add column if not exists final boolean not null default false;

update drawings
set final = true
where created_at < now() - interval '45 minutes';

delete from drawings where final = false;

delete from drawings where final = false;
