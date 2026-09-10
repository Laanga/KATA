\set ON_ERROR_STOP on
BEGIN;
INSERT INTO auth.users(id) VALUES ('33333333-3333-3333-3333-333333333333');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','33333333-3333-3333-3333-333333333333',true);
DO $$ BEGIN
 FOR n IN 1..120 LOOP IF NOT public.consume_api_request() THEN RAISE EXCEPTION 'Premature rate limit'; END IF; END LOOP;
 IF public.consume_api_request() THEN RAISE EXCEPTION 'Rate limit not enforced'; END IF;
 BEGIN DELETE FROM public.api_request_limits; RAISE EXCEPTION 'Can reset counter'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
ROLLBACK;
\echo 'Shared API rate limit checks passed'
