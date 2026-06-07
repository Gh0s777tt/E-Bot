-- 🛡️ Audit log zmian konfiguracji panelu (kto/co/kiedy/IP)
create table if not exists settings_audit (
  id         uuid primary key default gen_random_uuid(),
  uid        text,
  uname      text,
  area       text not null,
  detail     text,
  ip         text,
  created_at timestamptz not null default now()
);
create index if not exists settings_audit_recent on settings_audit (created_at desc);
alter table settings_audit enable row level security;
