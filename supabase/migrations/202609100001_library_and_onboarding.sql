-- Apply after supabase-schema.sql. Additive columns preserve existing records.
BEGIN;
ALTER TABLE public.media_items ADD COLUMN IF NOT EXISTS provider text;
ALTER TABLE public.media_items ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE public.media_items ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE public.media_items ADD CONSTRAINT media_external_identity CHECK (
  (provider IS NULL AND external_id IS NULL) OR
  (provider IN ('tmdb', 'igdb', 'rawg', 'google-books', 'openlibrary') AND length(external_id) BETWEEN 1 AND 200)
);
DROP INDEX IF EXISTS public.idx_media_items_unique_per_user;
CREATE UNIQUE INDEX media_external_unique ON public.media_items(user_id, type, provider, external_id)
  WHERE external_id IS NOT NULL;
CREATE UNIQUE INDEX media_legacy_unique ON public.media_items(user_id, type, lower(trim(title)))
  WHERE external_id IS NULL;
-- Existing completion dates cannot be inferred reliably from updated_at.
CREATE OR REPLACE FUNCTION public.track_media_completion() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'COMPLETED' THEN NEW.completed_at := coalesce(NEW.completed_at, now());
    ELSE NEW.completed_at := NULL; END IF;
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.completed_at := CASE WHEN NEW.status = 'COMPLETED' THEN now() ELSE NULL END;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER media_completion BEFORE INSERT OR UPDATE ON public.media_items
FOR EACH ROW EXECUTE FUNCTION public.track_media_completion();

CREATE TABLE public.user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_status text NOT NULL DEFAULT 'pending' CHECK (onboarding_status IN ('pending','in_progress','completed','skipped')),
  onboarding_version integer NOT NULL DEFAULT 1 CHECK (onboarding_version > 0),
  onboarding_step integer NOT NULL DEFAULT 1 CHECK (onboarding_step BETWEEN 1 AND 3),
  preferred_type text CHECK (preferred_type IN ('BOOK','MOVIE','SERIES','GAME')),
  first_item_id uuid REFERENCES public.media_items(id) ON DELETE SET NULL,
  finished_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY preferences_select ON public.user_preferences FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY preferences_insert ON public.user_preferences FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY preferences_update ON public.user_preferences FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
GRANT SELECT, INSERT, UPDATE ON public.user_preferences TO authenticated;
-- All accounts that predate this migration opt in voluntarily, even empty ones.
INSERT INTO public.user_preferences(user_id, onboarding_status, finished_at)
SELECT id, 'skipped', now() FROM auth.users ON CONFLICT (user_id) DO NOTHING;
CREATE TRIGGER preferences_updated BEFORE UPDATE ON public.user_preferences
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Both functions use the caller's permissions and RLS. Any error rolls back the
-- whole operation; no partial deletion/import is committed.
CREATE FUNCTION public.clear_library() RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  DELETE FROM public.media_items WHERE user_id = auth.uid();
END;
$$;

CREATE FUNCTION public.import_library(payload jsonb, replace_existing boolean DEFAULT false)
RETURNS integer LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  entry jsonb; col jsonb; rel jsonb; saved_id uuid; col_id uuid;
  item_map jsonb := '{}'::jsonb; collection_map jsonb := '{}'::jsonb;
  imported integer := 0; owner_id uuid := auth.uid();
BEGIN
  IF owner_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF jsonb_typeof(payload->'items') IS DISTINCT FROM 'array' OR jsonb_array_length(payload->'items') > 5000 THEN
    RAISE EXCEPTION 'Expected at most 5000 items';
  END IF;
  IF replace_existing THEN
    DELETE FROM public.media_items WHERE user_id = owner_id;
    IF payload ? 'collections' THEN DELETE FROM public.collections WHERE user_id = owner_id; END IF;
  END IF;
  FOR entry IN SELECT value FROM jsonb_array_elements(payload->'items') LOOP
    IF length(trim(coalesce(entry->>'title',''))) NOT BETWEEN 1 AND 200 THEN RAISE EXCEPTION 'Invalid title'; END IF;
    IF NOT ((entry->>'type' = 'BOOK' AND entry->>'status' IN ('WANT_TO_READ','READING','COMPLETED','DROPPED')) OR
            (entry->>'type' = 'GAME' AND entry->>'status' IN ('WANT_TO_PLAY','PLAYING','COMPLETED','DROPPED')) OR
            (entry->>'type' IN ('MOVIE','SERIES') AND entry->>'status' IN ('WANT_TO_WATCH','WATCHING','COMPLETED','DROPPED'))) THEN
      RAISE EXCEPTION 'Invalid type/status';
    END IF;
    SELECT id INTO saved_id FROM public.media_items WHERE user_id = owner_id AND type = entry->>'type' AND (
      ((entry->>'externalId') IS NOT NULL AND provider = entry->>'provider' AND external_id = entry->>'externalId') OR
      ((entry->>'externalId') IS NULL AND external_id IS NULL AND lower(trim(title)) = lower(trim(entry->>'title')))
    ) LIMIT 1;
    -- Merge retains an existing item's notes and progress; it never silently overwrites them.
    IF saved_id IS NULL THEN
      INSERT INTO public.media_items(user_id,type,title,cover_url,status,rating,review,metadata,provider,external_id,created_at,completed_at)
      VALUES(owner_id,entry->>'type',trim(entry->>'title'),nullif(entry->>'coverUrl',''),entry->>'status',
        (entry->>'rating')::numeric,nullif(entry->>'review',''),
        jsonb_strip_nulls(jsonb_build_object('author',entry->'author','platform',entry->'platform','release_year',entry->'releaseYear','genres',entry->'genres')),
        entry->>'provider',entry->>'externalId',coalesce((entry->>'createdAt')::timestamptz,now()),(entry->>'completedAt')::timestamptz)
      RETURNING id INTO saved_id;
      imported := imported + 1;
    END IF;
    IF entry->>'id' IS NOT NULL THEN item_map := item_map || jsonb_build_object(entry->>'id',saved_id); END IF;
  END LOOP;
  FOR col IN SELECT value FROM jsonb_array_elements(coalesce(payload->'collections','[]'::jsonb)) LOOP
    IF length(trim(coalesce(col->>'name',''))) NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Invalid collection name'; END IF;
    SELECT id INTO col_id FROM public.collections WHERE user_id = owner_id AND lower(trim(name)) = lower(trim(col->>'name'));
    IF col_id IS NULL THEN
      INSERT INTO public.collections(user_id,name,description,color,icon) VALUES(owner_id,trim(col->>'name'),col->>'description',col->>'color',col->>'icon') RETURNING id INTO col_id;
    END IF;
    IF col->>'id' IS NOT NULL THEN collection_map := collection_map || jsonb_build_object(col->>'id',col_id); END IF;
  END LOOP;
  FOR rel IN SELECT value FROM jsonb_array_elements(coalesce(payload->'relationships','[]'::jsonb)) LOOP
    saved_id := (item_map->>(rel->>'itemId'))::uuid;
    col_id := (collection_map->>(rel->>'collectionId'))::uuid;
    IF saved_id IS NULL OR col_id IS NULL THEN RAISE EXCEPTION 'Invalid collection relationship'; END IF;
    INSERT INTO public.media_items_collections(media_item_id,collection_id) VALUES(saved_id,col_id) ON CONFLICT DO NOTHING;
  END LOOP;
  RETURN imported;
END;
$$;
REVOKE ALL ON FUNCTION public.clear_library() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.import_library(jsonb,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.clear_library() TO authenticated;
GRANT EXECUTE ON FUNCTION public.import_library(jsonb,boolean) TO authenticated;
COMMIT;
