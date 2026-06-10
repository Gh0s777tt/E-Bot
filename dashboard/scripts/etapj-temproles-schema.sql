-- Etap J (eko 2.0) — role czasowe ze sklepu.
-- 1) Kolumna duration_days w sklepie: po ilu dniach bot zdejmie nadaną rolę (null/0 = na stałe).
alter table economy_shop add column if not exists duration_days integer;

-- 2) Tabela aktywnych ról czasowych — poller bota zdejmuje role z expires_at <= now().
create table if not exists temp_roles (
  id         uuid        not null default gen_random_uuid(),
  guild_id   text        not null,
  user_id    text        not null,
  role_id    text        not null,
  expires_at timestamptz not null,
  primary key (id)
);
create index if not exists temp_roles_expires_idx on temp_roles (expires_at);
alter table temp_roles enable row level security;
