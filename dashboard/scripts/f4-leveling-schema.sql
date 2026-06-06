-- E-BOT · Faza 7 / F4 — prestiż w levelingu (dokłada kolumnę do istniejącej tabeli).
-- Uruchom w Supabase → SQL Editor (jednorazowo).
alter table user_levels add column if not exists prestige int not null default 0;
