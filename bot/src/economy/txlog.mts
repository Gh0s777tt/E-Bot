// Log transakcji ekonomii → tabela 'economy_tx'. BEZPIECZNY: brak chmury/tabeli = no-op (catch).
// Panel czyta ostatnie wpisy i pokazuje historię + wykres salda na karcie profilu.
//
// SQL do utworzenia w Supabase (jednorazowo):
//   create table if not exists economy_tx (
//     id          bigint generated always as identity primary key,
//     guild_id    text        not null,
//     user_id     text        not null,
//     delta       bigint      not null,
//     reason      text        not null,
//     created_at  timestamptz not null default now()
//   );
//   create index if not exists economy_tx_user_idx on economy_tx (user_id, created_at desc);
import { cloudInsert, hasCloud } from '../lib/cloud.mts';

export function logTx(guildId: string, userId: string, delta: number, reason: string): void {
  if (!hasCloud() || !delta) return;
  void cloudInsert('economy_tx', [
    {
      guild_id: guildId,
      user_id: userId,
      delta: Math.round(delta),
      reason,
      created_at: new Date().toISOString(),
    },
  ]).catch(() => {
    /* brak tabeli / błąd → po cichu pomiń (historia jest opcjonalna) */
  });
}
