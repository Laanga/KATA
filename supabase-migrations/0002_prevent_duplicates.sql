-- Migration para prevenir items duplicados
-- Agrega unique constraint por usuario + tipo + título normalizado

-- Crear índice único para prevenir duplicados por usuario, tipo y título
CREATE UNIQUE INDEX IF NOT EXISTS idx_media_items_unique_per_user
ON public.media_items (
    user_id,
    type,
    LOWER(TRIM(title))
);

-- Comentario para documentación
COMMENT ON INDEX idx_media_items_unique_per_user IS 'Previene items duplicados por usuario, tipo y título (case-insensitive, sin espacios extra)';