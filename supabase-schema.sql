-- Schema actualizado para media_items
-- Usa metadata JSONB para campos flexibles (author, platform, release_year, genres)
-- Rating es DECIMAL(2,1) para soportar valores de 0 a 5 con decimales

CREATE TABLE IF NOT EXISTS public.media_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Información básica
    type TEXT NOT NULL CHECK (type IN ('BOOK', 'GAME', 'MOVIE', 'SERIES')),
    title TEXT NOT NULL,
    cover_url TEXT,

    -- Estado y valoración
    status TEXT NOT NULL CHECK (
        status IN (
            'WANT_TO_READ', 'READING', 'COMPLETED', 'DROPPED',
            'WANT_TO_PLAY', 'PLAYING',
            'WANT_TO_WATCH', 'WATCHING'
        )
    ),
    rating DECIMAL(2,1) CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
    review TEXT,

    -- Metadata flexible en JSONB
    -- Contiene: author, platform, release_year, genres (array), y otros campos
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_media_items_user_id ON public.media_items(user_id);
CREATE INDEX IF NOT EXISTS idx_media_items_type ON public.media_items(type);
CREATE INDEX IF NOT EXISTS idx_media_items_status ON public.media_items(status);
CREATE INDEX IF NOT EXISTS idx_media_items_rating ON public.media_items(rating DESC);
CREATE INDEX IF NOT EXISTS idx_media_items_created_at ON public.media_items(created_at DESC);

-- Índice GIN para búsquedas eficientes en metadata (incluyendo géneros)
CREATE INDEX IF NOT EXISTS idx_media_items_metadata_gin ON public.media_items USING GIN (metadata);

-- Índice específico para géneros en metadata (mejora búsquedas por género)
CREATE INDEX IF NOT EXISTS idx_media_items_genres ON public.media_items USING GIN ((metadata->'genres'));

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Los usuarios solo pueden ver y modificar sus propios items
CREATE POLICY "Users can view their own media items"
    ON public.media_items
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own media items"
    ON public.media_items
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media items"
    ON public.media_items
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media items"
    ON public.media_items
    FOR DELETE
    USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.media_items;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.media_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE public.media_items IS 'Tabla principal para almacenar items de media (libros, juegos, películas, series)';
COMMENT ON COLUMN public.media_items.metadata IS 'JSONB que contiene campos flexibles: author (libros), platform (juegos), release_year, genres (array de strings), y otros campos personalizados';
COMMENT ON COLUMN public.media_items.rating IS 'Puntuación de 0 a 5 con un decimal (ej: 4.5)';
