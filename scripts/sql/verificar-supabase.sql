-- Solo lectura. No ejecuta RPC, importa datos ni modifica el esquema.
SELECT jsonb_pretty(jsonb_build_object(
  'tablas_con_rls', (
    SELECT jsonb_agg(jsonb_build_object(
      'tabla', nombre,
      'existe', c.oid IS NOT NULL,
      'rls_activo', coalesce(c.relrowsecurity, false)
    ) ORDER BY nombre)
    FROM (VALUES ('media_items'), ('collections'), ('media_items_collections'),
                 ('user_preferences'), ('api_request_limits')) AS esperadas(nombre)
    LEFT JOIN pg_class c ON c.oid = to_regclass('public.' || nombre)
  ),
  'columnas_nuevas', (
    SELECT jsonb_agg(jsonb_build_object(
      'columna', nombre,
      'existe', EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'media_items'
          AND column_name = nombre
      )
    ))
    FROM (VALUES ('provider'), ('external_id'), ('completed_at')) AS esperadas(nombre)
  ),
  'funciones_y_permisos', (
    SELECT jsonb_agg(jsonb_build_object(
      'funcion', firma,
      'existe', to_regprocedure(firma) IS NOT NULL,
      'anon_puede_ejecutar', has_function_privilege('anon', to_regprocedure(firma), 'EXECUTE'),
      'authenticated_puede_ejecutar', has_function_privilege('authenticated', to_regprocedure(firma), 'EXECUTE')
    ))
    FROM (VALUES ('public.clear_library()'),
                 ('public.import_library(jsonb,boolean)'),
                 ('public.consume_api_request()')) AS esperadas(firma)
  ),
  'triggers', (
    SELECT jsonb_agg(jsonb_build_object(
      'nombre', nombre,
      'activo', EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgrelid = to_regclass('public.' || tabla)
          AND tgname = nombre AND NOT tgisinternal AND tgenabled IN ('O', 'A')
      )
    ))
    FROM (VALUES ('media_items', 'media_completion'),
                 ('user_preferences', 'preferences_updated'),
                 ('user_preferences', 'onboarding_item_owner')) AS esperados(tabla, nombre)
  ),
  'restricciones', (
    SELECT jsonb_agg(jsonb_build_object(
      'nombre', nombre,
      'existe', EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = to_regclass('public.' || tabla) AND conname = nombre
      )
    ))
    FROM (VALUES ('media_items', 'media_external_identity'),
                 ('media_items', 'media_valid_status_for_type'),
                 ('media_items', 'media_title_nonempty'),
                 ('collections', 'collection_name_nonempty')) AS esperadas(tabla, nombre)
  ),
  'indices_unicos', (
    SELECT jsonb_agg(jsonb_build_object(
      'nombre', nombre,
      'valido_y_unico', EXISTS (
        SELECT 1 FROM pg_index
        WHERE indexrelid = to_regclass('public.' || nombre)
          AND indisvalid AND indisunique
      )
    ))
    FROM (VALUES ('media_external_unique'), ('media_legacy_unique'),
                 ('idx_collections_unique_name_per_user')) AS esperados(nombre)
  ),
  'politicas_nuevas', (
    SELECT jsonb_agg(jsonb_build_object(
      'nombre', nombre,
      'existe', EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = esquema AND tablename = tabla AND policyname = nombre
      )
    ))
    FROM (VALUES ('public', 'user_preferences', 'preferences_select'),
                 ('public', 'user_preferences', 'preferences_insert'),
                 ('public', 'user_preferences', 'preferences_update'),
                 ('storage', 'objects', 'kata_avatar_insert'),
                 ('storage', 'objects', 'kata_avatar_select_own'),
                 ('storage', 'objects', 'kata_avatar_delete_own')) AS esperadas(esquema, tabla, nombre)
  ),
  'avatares', (
    SELECT jsonb_build_object('publico', public, 'limite_bytes', file_size_limit,
                             'formatos', allowed_mime_types)
    FROM storage.buckets WHERE id = 'avatars'
  ),
  'estados_onboarding', (
    SELECT jsonb_agg(to_jsonb(resumen))
    FROM (
      SELECT onboarding_status AS estado, count(*) AS cuentas
      FROM public.user_preferences GROUP BY onboarding_status
    ) resumen
  ),
  'funcion_importacion_actual', (
    SELECT pg_get_functiondef(to_regprocedure('public.import_library(jsonb,boolean)'))
  )
)) AS verificacion;
