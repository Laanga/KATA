BEGIN;
ALTER TABLE public.media_items DROP CONSTRAINT media_external_identity;
ALTER TABLE public.media_items ADD CONSTRAINT media_external_identity CHECK (
  (provider IS NULL AND external_id IS NULL) OR
  (provider IS NOT NULL AND external_id IS NOT NULL AND provider IN ('tmdb','igdb','rawg','google-books','openlibrary') AND length(external_id) BETWEEN 1 AND 200)
);
-- Preserve any historical data for inspection; these constraints apply to future writes.
ALTER TABLE public.media_items ADD CONSTRAINT media_valid_status_for_type CHECK (
  (type='BOOK' AND status IN ('WANT_TO_READ','READING','COMPLETED','DROPPED')) OR
  (type='GAME' AND status IN ('WANT_TO_PLAY','PLAYING','COMPLETED','DROPPED')) OR
  (type IN ('MOVIE','SERIES') AND status IN ('WANT_TO_WATCH','WATCHING','COMPLETED','DROPPED'))
) NOT VALID;
ALTER TABLE public.media_items ADD CONSTRAINT media_title_nonempty CHECK(length(trim(title)) BETWEEN 1 AND 200) NOT VALID;
ALTER TABLE public.collections ADD CONSTRAINT collection_name_nonempty CHECK(length(trim(name)) BETWEEN 1 AND 100) NOT VALID;
COMMIT;
