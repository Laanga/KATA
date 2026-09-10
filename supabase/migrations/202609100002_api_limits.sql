BEGIN;
CREATE TABLE public.api_request_limits (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  window_start timestamptz NOT NULL,
  requests integer NOT NULL
);
ALTER TABLE public.api_request_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.api_request_limits FROM anon, authenticated;
-- Fixed budget, atomic across instances. Clients cannot reset counters or choose
-- a larger budget. No elevated access is used for media/library operations.
CREATE FUNCTION public.consume_api_request() RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE count_now integer; owner_id uuid := auth.uid();
BEGIN
  IF owner_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  INSERT INTO public.api_request_limits(user_id,window_start,requests) VALUES(owner_id,now(),1)
  ON CONFLICT(user_id) DO UPDATE SET
    requests = CASE WHEN api_request_limits.window_start < now()-interval '1 minute' THEN 1 ELSE api_request_limits.requests+1 END,
    window_start = CASE WHEN api_request_limits.window_start < now()-interval '1 minute' THEN now() ELSE api_request_limits.window_start END
  RETURNING requests INTO count_now;
  RETURN count_now <= 120;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_api_request() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_api_request() TO authenticated;
CREATE FUNCTION public.validate_onboarding_item() RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
 IF NEW.first_item_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.media_items WHERE id=NEW.first_item_id AND user_id=NEW.user_id) THEN
  RAISE EXCEPTION 'The onboarding item must belong to the user';
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER onboarding_item_owner BEFORE INSERT OR UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.validate_onboarding_item();
COMMIT;
