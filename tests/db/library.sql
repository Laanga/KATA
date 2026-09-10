\set ON_ERROR_STOP on
BEGIN;
INSERT INTO auth.users(id) VALUES ('11111111-1111-1111-1111-111111111111'),('22222222-2222-2222-2222-222222222222');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','22222222-2222-2222-2222-222222222222',true);
INSERT INTO public.media_items(user_id,type,title,status) VALUES(auth.uid(),'BOOK','Privado B','READING');
SELECT set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111',true);
SELECT public.import_library('{"items":[{"id":"old-1","type":"MOVIE","title":"Homónima","provider":"tmdb","externalId":"1","status":"COMPLETED","rating":0,"review":"Una nota"},{"id":"old-2","type":"MOVIE","title":"Homónima","provider":"tmdb","externalId":"2","status":"WANT_TO_WATCH","rating":4.5}],"collections":[{"id":"old-col","name":"Favoritos"}],"relationships":[{"itemId":"old-1","collectionId":"old-col"}]}');
DO $$ DECLARE original_date timestamptz; BEGIN
 IF (SELECT count(*) FROM public.media_items) <> 2 THEN RAISE EXCEPTION 'RLS select or homonymous titles failed'; END IF;
 IF (SELECT count(*) FROM public.media_items_collections) <> 1 THEN RAISE EXCEPTION 'Relationship import failed'; END IF;
 SELECT completed_at INTO original_date FROM public.media_items WHERE external_id='1';
 IF original_date IS NULL THEN RAISE EXCEPTION 'Completion date missing'; END IF;
 UPDATE public.media_items SET review=NULL WHERE external_id='1';
 IF (SELECT completed_at FROM public.media_items WHERE external_id='1') IS DISTINCT FROM original_date THEN RAISE EXCEPTION 'Completion date changed'; END IF;
 BEGIN
   PERFORM public.import_library('{"items":[{"title":"Valido","type":"BOOK","status":"READING"},{"title":"Invalido","type":"MOVIE","status":"READING"}]}',true);
   RAISE EXCEPTION 'Expected validation error';
 EXCEPTION WHEN raise_exception THEN
   IF SQLERRM = 'Expected validation error' THEN RAISE; END IF;
 END;
 IF (SELECT count(*) FROM public.media_items) <> 2 THEN RAISE EXCEPTION 'Failed replacement did not roll back'; END IF;
 IF (SELECT count(*) FROM public.media_items_collections) <> 1 THEN RAISE EXCEPTION 'Failed replacement deleted relationships'; END IF;
 PERFORM public.import_library('{"items":[{"title":"Homónima","type":"MOVIE","provider":"tmdb","externalId":"1","status":"DROPPED"}]}');
 IF (SELECT status FROM public.media_items WHERE external_id='1') <> 'COMPLETED' THEN RAISE EXCEPTION 'Merge overwrote progress'; END IF;
 BEGIN
   INSERT INTO public.user_preferences(user_id) VALUES ('22222222-2222-2222-2222-222222222222');
   RAISE EXCEPTION 'Expected RLS error';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT public.clear_library();
DO $$ BEGIN IF EXISTS(SELECT 1 FROM public.media_items) THEN RAISE EXCEPTION 'Clear failed'; END IF; END $$;
SELECT set_config('request.jwt.claim.sub','22222222-2222-2222-2222-222222222222',true);
DO $$ BEGIN IF (SELECT count(*) FROM public.media_items) <> 1 THEN RAISE EXCEPTION 'Other account was modified'; END IF; END $$;
RESET ROLE;
SET LOCAL ROLE anon;
DO $$ BEGIN
 BEGIN PERFORM public.clear_library(); RAISE EXCEPTION 'Anonymous clear permitted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
ROLLBACK;
\echo 'Database isolation, atomicity, identity and completion checks passed'
