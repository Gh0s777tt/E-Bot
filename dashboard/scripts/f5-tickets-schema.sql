-- E-BOT · Faza 7 / F5 — ocena obsługi ticketu (kolumna do istniejącej tabeli).
-- Uruchom w Supabase → SQL Editor (jednorazowo).
alter table tickets add column if not exists rating int;
