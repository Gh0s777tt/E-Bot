-- Etap J (eko 2.0) — giełda: pozycje akcji graczy.
-- shares = liczba akcji, invested = łączny koszt zakupu (do liczenia zysku/straty).
create table if not exists economy_stocks (
  guild_id text    not null,
  user_id  text    not null,
  symbol   text    not null,
  shares   integer not null default 0,
  invested bigint  not null default 0,
  primary key (guild_id, user_id, symbol)
);
alter table economy_stocks enable row level security;
