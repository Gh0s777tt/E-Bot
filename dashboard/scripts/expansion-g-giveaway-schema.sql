-- Rozbudowa G — giveaway++: wymagania wejścia + bonus-losy.
alter table giveaways add column if not exists req_role_id text;
alter table giveaways add column if not exists req_level integer default 0;
alter table giveaways add column if not exists req_invites integer default 0;
alter table giveaways add column if not exists bonus_role_id text;
alter table giveaways add column if not exists bonus_weight integer default 1;
alter table giveaway_entries add column if not exists weight integer default 1;
