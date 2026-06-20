-- ai_usage → scoping per-serwer (Audyt #2 — domknięcie rezyduum F5).
-- Dodaje guild_id i przebudowuje PK na (guild_id, user_id, day), żeby zużycie AI było liczone
-- i czytane PER-SERWER: panel /stats (getAiUsageToday/getAiUsageSeries) nie agreguje już cudzych
-- serwerów, a dzienny limit działa per-serwer-per-użytkownik. Bot zapisuje guild_id (lib/ai.mts).
-- Idempotentne (można odpalić wielokrotnie). Stare wiersze dostają guild_id='' (nieznany serwer/DM)
-- — nie pokażą się żadnemu tenantowi (panel fail-closed: pusty guild_id ⇒ pusto).
alter table ai_usage add column if not exists guild_id text;
update ai_usage set guild_id = '' where guild_id is null;
alter table ai_usage alter column guild_id set not null;
alter table ai_usage alter column guild_id set default '';
-- Przebuduj PK: (user_id, day) → (guild_id, user_id, day). Nazwa PK Postgresa = <tabela>_pkey,
-- więc drop-if-exists + add jest idempotentne (ponowny przebieg zdejmie i odtworzy ten sam PK).
alter table ai_usage drop constraint if exists ai_usage_pkey;
alter table ai_usage add primary key (guild_id, user_id, day);
create index if not exists ai_usage_guild_day on ai_usage (guild_id, day);
