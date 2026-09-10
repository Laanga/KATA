-- Supabase default privileges grant function execution to anon explicitly;
-- revoking PUBLIC alone does not revoke that grant.
revoke all on function public.clear_library() from anon;
revoke all on function public.import_library(jsonb, boolean) from anon;
revoke all on function public.consume_api_request() from anon;
