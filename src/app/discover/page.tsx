'use client';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Choice';
import { NativeSelect } from '@/components/ui/Field';

import { useMemo, useState } from 'react';
import { Film, Tv, BookOpen, Gamepad2, Sparkles, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMediaStore } from '@/lib/store';
import { useCatalog } from '@/hooks/useCatalog';
import { DiscoverCard } from '@/components/media/DiscoverCard';
import { HorizontalScroll } from '@/components/ui/HorizontalScroll';
import { sameMedia } from '@/lib/utils/mediaIdentity';
import { MOVIE_GENRES, TV_GENRES } from '@/lib/media/genres';
import { VALID_STATUSES } from '@/lib/utils/constants';
import type { MediaResult } from '@/lib/media/results';
import type { MediaType } from '@/types/media';
const categories = [
  { type: 'MOVIE', label: 'Películas', icon: Film, endpoint: 'movies', rec: 'movie' },
  { type: 'SERIES', label: 'Series', icon: Tv, endpoint: 'series', rec: 'tv' },
  { type: 'BOOK', label: 'Libros', icon: BookOpen, endpoint: 'books', rec: 'book' },
  { type: 'GAME', label: 'Juegos', icon: Gamepad2, endpoint: 'games', rec: 'game' },
] as const;
export default function DiscoverPage() {
  const [type, setType] = useState<MediaType>('MOVIE');
  const [period, setPeriod] = useState('month');
  const [genre, setGenre] = useState('ALL');
  const items = useMediaStore((s) => s.items);
  const userId = useMediaStore((s) => s.userId);
  const addItem = useMediaStore((s) => s.addItem);
  const config = categories.find((c) => c.type === type)!;
  const upcoming = useCatalog(
    `/api/upcoming/${config.endpoint}?${new URLSearchParams({ period, genre })}`,
    type,
    userId,
  );
  const favoriteGenres = useMemo(() => {
    const typed = items.filter((item) => item.type === type);
    const rated = typed.filter((item) => item.rating !== null && item.rating >= 3.5);
    const counts = new Map<string, number>();
    for (const item of rated.length ? rated : typed)
      for (const g of item.genres || []) counts.set(g, (counts.get(g) || 0) + 1);
    return [...counts]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([g]) => g);
  }, [items, type]);
  const genreValues =
    type === 'MOVIE' || type === 'SERIES'
      ? favoriteGenres
          .map((g) => (type === 'MOVIE' ? MOVIE_GENRES : TV_GENRES)[g])
          .filter(Boolean)
          .join(',')
      : favoriteGenres.join(',');
  const day = Math.floor((Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 1)) / 86400000) + 1;
  // Preferences form part of the URL/cache key. Local filtering updates immediately
  // after saving an item without sending the library's titles in request URLs.
  const recommendations = useCatalog(
    genreValues
      ? `/api/recommendations?${new URLSearchParams({ type: config.rec, genres: genreValues, daySeed: String(day) })}`
      : null,
    type,
    userId,
  );
  const inLibrary = (result: MediaResult) => items.some((item) => sameMedia(item, result));
  const add = async (result: MediaResult) => {
    try {
      await addItem({
        title: result.title,
        type: result.type,
        provider: result.provider,
        externalId: result.externalId,
        coverUrl: result.coverUrl || '',
        releaseYear: result.year,
        author: result.author,
        platform: result.platform,
        genres: result.genres,
        status: VALID_STATUSES[result.type][0],
        rating: null,
      });
      toast.success(`"${result.title}" guardado como pendiente`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar. Inténtalo de nuevo.');
      throw e;
    }
  };
  const periods =
    type === 'BOOK'
      ? [
          { value: 'week', label: 'Este año' },
          { value: 'month', label: 'Últimos 2 años' },
          { value: 'quarter', label: 'Últimos 3 años' },
        ]
      : [
          { value: 'week', label: '7 días' },
          { value: 'month', label: '30 días' },
          { value: 'quarter', label: '90 días' },
        ];
  return (
    <main className="container mx-auto max-w-7xl px-4 sm:px-6 pt-10 md:pt-28 pb-nav-safe min-h-screen">
      <header className="mb-10">
        <p className="text-emerald-300 text-xs uppercase tracking-[.25em] mb-3">
          Tu próxima historia
        </p>
        <h1 className="kata-title-page">Descubrir</h1>
        <p className="text-[var(--text-secondary)] mt-4">
          Novedades y recomendaciones a partir de lo que disfrutas.
        </p>
      </header>
      <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label="Tipo de contenido">
        {categories.map((c) => (
          <Chip
            key={c.type}
            selected={type === c.type}
            onClick={() => {
              setType(c.type);
              setGenre('ALL');
            }}
          >
            <c.icon size={17} />
            {c.label}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 items-center mb-10">
        <Clock size={18} className="text-[var(--text-secondary)]" />
        {periods.map((p) => (
          <Chip key={p.value} selected={period === p.value} onClick={() => setPeriod(p.value)}>
            {p.label}
          </Chip>
        ))}
        <NativeSelect
          aria-label="Género"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="w-auto"
        >
          <option value="ALL">Todos los géneros</option>
          {upcoming.genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </NativeSelect>
      </div>
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-5">
          {type === 'BOOK' ? 'Lecturas recientes' : 'Próximos lanzamientos'}
        </h2>
        {upcoming.loading ? (
          <p role="status">Cargando novedades…</p>
        ) : upcoming.error ? (
          <div role="status">
            <p>{upcoming.error}</p>
            <Button variant="ghost" size="sm" onClick={upcoming.retry}>
              Reintentar
            </Button>
          </div>
        ) : upcoming.items.length ? (
          <HorizontalScroll>
            {upcoming.items.map((item) => (
              <DiscoverCard
                key={`${item.provider}-${item.externalId}`}
                item={item}
                onAdd={() => add(item)}
                isInLibrary={inLibrary(item)}
              />
            ))}
          </HorizontalScroll>
        ) : (
          <p className="text-[var(--text-secondary)]">
            No hay novedades para estos filtros. Prueba otro período o género.
          </p>
        )}
      </section>
      <section className="pb-10">
        <h2 className="flex items-center gap-3 text-2xl font-semibold mb-3">
          <Sparkles size={22} className="text-emerald-300" />
          Para ti
        </h2>
        <p className="text-[var(--text-secondary)] mb-6">
          {favoriteGenres.length
            ? `Basado en ${favoriteGenres.join(', ')}.`
            : 'Guarda y valora algunos títulos para descubrir historias relacionadas.'}
        </p>
        {recommendations.loading ? (
          <p role="status">Buscando recomendaciones…</p>
        ) : recommendations.error ? (
          <div role="status">
            <p>{recommendations.error}</p>
            <Button variant="ghost" size="sm" onClick={recommendations.retry}>
              Reintentar
            </Button>
          </div>
        ) : (
          <HorizontalScroll>
            {recommendations.items
              .filter((item) => !inLibrary(item))
              .map((item) => (
                <DiscoverCard
                  key={`${item.provider}-${item.externalId}`}
                  item={item}
                  onAdd={() => add(item)}
                />
              ))}
          </HorizontalScroll>
        )}
      </section>
    </main>
  );
}
