-- Restore original timestamps for imported items and collections. Existing merged records remain unchanged.
CREATE OR REPLACE FUNCTION public.import_library(payload jsonb, replace_existing boolean DEFAULT false)
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
      INSERT INTO public.media_items(user_id,type,title,cover_url,status,rating,review,metadata,provider,external_id,created_at,updated_at,completed_at)
      VALUES(owner_id,entry->>'type',trim(entry->>'title'),nullif(entry->>'coverUrl',''),entry->>'status',
        (entry->>'rating')::numeric,nullif(entry->>'review',''),
        jsonb_strip_nulls(jsonb_build_object('author',entry->'author','platform',entry->'platform','release_year',entry->'releaseYear','genres',entry->'genres')),
        entry->>'provider',entry->>'externalId',coalesce((entry->>'createdAt')::timestamptz,now()),coalesce((entry->>'updatedAt')::timestamptz,(entry->>'createdAt')::timestamptz,now()),(entry->>'completedAt')::timestamptz)
      RETURNING id INTO saved_id;
      imported := imported + 1;
    END IF;
    IF entry->>'id' IS NOT NULL THEN item_map := item_map || jsonb_build_object(entry->>'id',saved_id); END IF;
  END LOOP;
  FOR col IN SELECT value FROM jsonb_array_elements(coalesce(payload->'collections','[]'::jsonb)) LOOP
    IF length(trim(coalesce(col->>'name',''))) NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Invalid collection name'; END IF;
    SELECT id INTO col_id FROM public.collections WHERE user_id = owner_id AND lower(trim(name)) = lower(trim(col->>'name'));
    IF col_id IS NULL THEN
      INSERT INTO public.collections(user_id,name,description,color,icon,created_at,updated_at) VALUES(owner_id,trim(col->>'name'),col->>'description',col->>'color',col->>'icon',coalesce((col->>'createdAt')::timestamptz,now()),coalesce((col->>'updatedAt')::timestamptz,(col->>'createdAt')::timestamptz,now())) RETURNING id INTO col_id;
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
