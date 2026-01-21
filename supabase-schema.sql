-- ============================================
-- KATA - Database Schema
-- ============================================
-- Base de datos para la aplicación Kata
-- Última actualización: Enero 2025
-- ============================================

-- ============================================
-- TABLA: media_items
-- ============================================
-- Almacena libros, películas, series y videojuegos

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
    -- Estructura: { author?: string, platform?: string, release_year?: number, genres?: string[] }
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para media_items
CREATE INDEX IF NOT EXISTS idx_media_items_user_id ON public.media_items(user_id);
CREATE INDEX IF NOT EXISTS idx_media_items_type ON public.media_items(type);
CREATE INDEX IF NOT EXISTS idx_media_items_status ON public.media_items(status);
CREATE INDEX IF NOT EXISTS idx_media_items_rating ON public.media_items(rating DESC);
CREATE INDEX IF NOT EXISTS idx_media_items_created_at ON public.media_items(created_at DESC);

-- Índice único para prevenir duplicados por usuario
CREATE UNIQUE INDEX IF NOT EXISTS idx_media_items_unique_per_user
ON public.media_items (user_id, type, LOWER(TRIM(title)));

-- Índices GIN para búsquedas en JSONB
CREATE INDEX IF NOT EXISTS idx_media_items_metadata_gin ON public.media_items USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_media_items_genres ON public.media_items USING GIN ((metadata->'genres'));

-- ============================================
-- TABLA: collections
-- ============================================
-- Colecciones personalizadas para organizar items

CREATE TABLE IF NOT EXISTS public.collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    description TEXT,
    color TEXT CHECK (color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$'), -- Hex color (#RRGGBB)
    icon TEXT, -- Emoji o nombre de icono (sin restricción)

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para collections
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_created_at ON public.collections(created_at DESC);

-- Índice único: nombre de colección único por usuario
CREATE UNIQUE INDEX IF NOT EXISTS idx_collections_unique_name_per_user
ON public.collections (user_id, LOWER(TRIM(name)));

-- ============================================
-- TABLA: media_items_collections (Junction)
-- ============================================
-- Relación muchos a muchos entre items y colecciones

CREATE TABLE IF NOT EXISTS public.media_items_collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    media_item_id UUID NOT NULL REFERENCES public.media_items(id) ON DELETE CASCADE,
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    UNIQUE(media_item_id, collection_id)
);

-- Índices para junction table
CREATE INDEX IF NOT EXISTS idx_media_items_collections_media_item_id 
ON public.media_items_collections(media_item_id);

CREATE INDEX IF NOT EXISTS idx_media_items_collections_collection_id 
ON public.media_items_collections(collection_id);

CREATE INDEX IF NOT EXISTS idx_media_items_collections_composite 
ON public.media_items_collections(collection_id, media_item_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items_collections ENABLE ROW LEVEL SECURITY;

-- Políticas para media_items
DROP POLICY IF EXISTS "Users can view their own media items" ON public.media_items;
CREATE POLICY "Users can view their own media items"
    ON public.media_items FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own media items" ON public.media_items;
CREATE POLICY "Users can insert their own media items"
    ON public.media_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own media items" ON public.media_items;
CREATE POLICY "Users can update their own media items"
    ON public.media_items FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own media items" ON public.media_items;
CREATE POLICY "Users can delete their own media items"
    ON public.media_items FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para collections
DROP POLICY IF EXISTS "Users can view their own collections" ON public.collections;
CREATE POLICY "Users can view their own collections"
    ON public.collections FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own collections" ON public.collections;
CREATE POLICY "Users can insert their own collections"
    ON public.collections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own collections" ON public.collections;
CREATE POLICY "Users can update their own collections"
    ON public.collections FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own collections" ON public.collections;
CREATE POLICY "Users can delete their own collections"
    ON public.collections FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para media_items_collections
DROP POLICY IF EXISTS "Users can view collection relationships for their own items" ON public.media_items_collections;
CREATE POLICY "Users can view collection relationships for their own items"
    ON public.media_items_collections FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.media_items
            WHERE media_items.id = media_items_collections.media_item_id
            AND media_items.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert collection relationships for their own items" ON public.media_items_collections;
CREATE POLICY "Users can insert collection relationships for their own items"
    ON public.media_items_collections FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.media_items
            WHERE media_items.id = media_items_collections.media_item_id
            AND media_items.user_id = auth.uid()
        )
        AND
        EXISTS (
            SELECT 1 FROM public.collections
            WHERE collections.id = media_items_collections.collection_id
            AND collections.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete collection relationships for their own items" ON public.media_items_collections;
CREATE POLICY "Users can delete collection relationships for their own items"
    ON public.media_items_collections FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.media_items
            WHERE media_items.id = media_items_collections.media_item_id
            AND media_items.user_id = auth.uid()
        )
    );

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para media_items
DROP TRIGGER IF EXISTS set_media_items_updated_at ON public.media_items;
CREATE TRIGGER set_media_items_updated_at
    BEFORE UPDATE ON public.media_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para collections
DROP TRIGGER IF EXISTS set_collections_updated_at ON public.collections;
CREATE TRIGGER set_collections_updated_at
    BEFORE UPDATE ON public.collections
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE public.media_items IS 'Tabla principal para items de media (libros, juegos, películas, series)';
COMMENT ON COLUMN public.media_items.type IS 'Tipo de media: BOOK, GAME, MOVIE, SERIES';
COMMENT ON COLUMN public.media_items.status IS 'Estado del item según su tipo';
COMMENT ON COLUMN public.media_items.rating IS 'Puntuación de 0 a 5 con un decimal (ej: 4.5)';
COMMENT ON COLUMN public.media_items.metadata IS 'JSONB con campos flexibles: author, platform, release_year, genres[]';

COMMENT ON TABLE public.collections IS 'Colecciones personalizadas para organizar items';
COMMENT ON COLUMN public.collections.color IS 'Color en formato hex (#RRGGBB)';
COMMENT ON COLUMN public.collections.icon IS 'Emoji o identificador de icono';

COMMENT ON TABLE public.media_items_collections IS 'Relación N:M entre media_items y collections';
