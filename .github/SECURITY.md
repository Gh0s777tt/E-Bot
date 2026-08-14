# 🔐 Polityka bezpieczeństwa — E‑BOT

<!-- Audyt 2026-08 (medium): po migracji GitLab-first ta polityka reklamowała CodeQL, Dependabota
     i GitHub secret scanning oraz kierowała zgłoszenia w „GitHub → Security" — nic z tego już nie
     działa (GitHub = mirror tylko-do-odczytu, .github/workflows/ usunięte). Tabela niżej opisuje
     kontrole, które realnie istnieją: .gitlab-ci.yml (SAST + Secret Detection) i renovate.json. -->

## Ochrona repozytorium

To repozytorium jest **prywatne i proprietarne** (patrz [`LICENSE`](../LICENSE)). Źródłem prawdy jest **GitLab** (`gitlab.com/Gh0s777tt/e-bot`); GitHub to **mirror tylko‑do‑odczytu**. Stosujemy:

| Warstwa | Mechanizm |
|:--|:--|
| 🔒 Dostęp | Repo prywatne — tylko właściciel/zaproszeni (GitLab + mirror GitHub) |
| 🌿 Integralność historii | Branch protection na `main` w GitLabie (blokada force‑push i usunięcia) |
| 🕵️ Skan kodu | **GitLab SAST** (szablon `Security/SAST.gitlab-ci.yml` w `.gitlab-ci.yml`) — na MR i `main` |
| 🔑 Sekrety | **GitLab Secret Detection** (szablon `Security/Secret-Detection.gitlab-ci.yml`) — na MR i `main` |
| 📦 Zależności | **Renovate** (`renovate.json` — `vulnerabilityAlerts`, cotygodniowe MR) + `pnpm audit` w CI (job `audit:deps`, informacyjny) |
| 🧪 Lokalnie | Snyk (zależności) + GitGuardian (sekrety) — patrz `docs/SECRETS.md` |

> Joby SAST/Secret Detection z szablonów GitLaba są `allow_failure` (raportują w pipeline, nie blokują) — szczegóły i uzasadnienie: [`docs/MAINTENANCE.md`](../docs/MAINTENANCE.md) §3.

## Zasady dot. sekretów

- Sekrety **wyłącznie** w `.env` / `dashboard/.env.local` (oba **gitignored**) lub w **Vercel env** / zmiennych CI GitLaba (masked).
- W repo: tylko `.env.example` z pustymi kluczami.
- Każdy commit przechodzi skan (`git grep` przed pushem + Secret Detection w GitLab CI).
- Plan rotacji kluczy: `docs/SECRETS.md`.

## Zgłaszanie podatności

Nie otwieraj publicznego issue dla podatności. Zgłoś przez **GitLab → Issues → poufne issue (Confidential)** na `gitlab.com/Gh0s777tt/e-bot` albo skontaktuj się bezpośrednio z właścicielem (@Gh0s777tt).

> ⚠️ Zakładka **GitHub → Security nie jest monitorowana** — GitHub to mirror tylko‑do‑odczytu bez workflowów. Zgłoszenie tam złożone to martwy kanał.

> Czas reakcji: best‑effort. To projekt prywatny E-Forge.
