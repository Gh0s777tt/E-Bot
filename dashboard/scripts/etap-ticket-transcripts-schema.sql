-- Transkrypty ticketów na web (roadmapa sek.4: „Tickety: transkrypty także na web").
-- Bot przy zamknięciu ticketu zapisuje pełny HTML transkryptu do tej kolumny, a panel renderuje
-- go pod /api/tickets/transcript?channel=<channel_id>.
--
-- GRACEFUL: dopóki nie uruchomisz tego SQL-a, bot po prostu NIE zapisuje transkryptu (update cicho
-- pada), a wszystko inne (kanał logów z plikiem HTML, DM do użytkownika, zamknięcie) działa bez zmian.
-- Po uruchomieniu — nowe zamknięte tickety będą miały transkrypt widoczny w panelu.

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS transcript_html TEXT;
