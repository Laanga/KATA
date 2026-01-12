-- Crear tabla media_items
CREATE TABLE IF NOT EXISTS public.media_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('BOOK', 'GAME', 'MOVIE', 'SERIES')),
    cover_url TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 0 AND rating <= 10),
    status TEXT NOT NULL CHECK (
        status IN (
            'WANT_TO_READ', 'READING', 'COMPLETED', 'DROPPED',
            'WANT_TO_PLAY', 'PLAYING',
            'WANT_TO_WATCH', 'WATCHING'
        )
    ),
    author TEXT,
    platform TEXT,
    release_year INTEGER,
    genres TEXT[],
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_media_items_user_id ON public.media_items(user_id);
CREATE INDEX IF NOT EXISTS idx_media_items_type ON public.media_items(type);
CREATE INDEX IF NOT EXISTS idx_media_items_status ON public.media_items(status);
CREATE INDEX IF NOT EXISTS idx_media_items_created_at ON public.media_items(created_at DESC);

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
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.media_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
