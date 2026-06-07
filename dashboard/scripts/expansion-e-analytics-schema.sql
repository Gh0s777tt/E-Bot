-- Rozbudowa E — analityka: minuty voice w activity_daily.
alter table activity_daily add column if not exists voice_minutes integer not null default 0;
