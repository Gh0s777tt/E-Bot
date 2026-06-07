-- Rozbudowa N — link Twitch↔Discord (do roli za subskrypcję).
create table if not exists twitch_links (
  discord_id   text primary key,
  twitch_login text not null,
  created_at   timestamptz not null default now()
);
create index if not exists twitch_links_login on twitch_links (twitch_login);
alter table twitch_links enable row level security;
