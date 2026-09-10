'use client';
import { useEffect, useState } from 'react';
import { normalizeMedia, type MediaResult } from '@/lib/media/results';
import type { MediaType } from '@/types/media';
import { MOVIE_GENRES, TV_GENRES } from '@/lib/media/genres';
type Genre = { id: string | number; name: string };
interface Catalog {
  items: MediaResult[];
  genres: Genre[];
  updatedAt: number;
}
const cache = new Map<string, Catalog>();
export function useCatalog(url: string | null, type: MediaType, userId: string | null) {
  const key = `${userId}:${type}:${url}`;
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ key: string; data?: Catalog; error?: string }>({ key: '' });
  useEffect(() => {
    if (!url || !userId) return;
    let active = true;
    const controller = new AbortController();
    const load = async () => {
      try {
        const cached = cache.get(key);
        if (cached && Date.now() - cached.updatedAt < 300000) {
          if (active) setState({ key, data: cached });
          return;
        }
        const response = await fetch(url, {
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
        });
        if (!response.ok)
          throw new Error(
            response.status === 429
              ? 'Demasiadas solicitudes. Espera un minuto.'
              : 'No pudimos cargar el catálogo. Inténtalo de nuevo.',
          );
        const data: unknown = await response.json();
        if (
          !data ||
          typeof data !== 'object' ||
          !('results' in data) ||
          !Array.isArray(data.results)
        )
          throw new Error('El catálogo no está disponible temporalmente.');
        const incoming =
          'availableGenres' in data && Array.isArray(data.availableGenres)
            ? data.availableGenres
            : [];
        const genres: Genre[] = incoming.filter(
          (g): g is Genre =>
            !!g &&
            typeof g === 'object' &&
            'id' in g &&
            'name' in g &&
            typeof g.name === 'string' &&
            (typeof g.id === 'number' || typeof g.id === 'string'),
        );
        const fallback = Object.entries(type === 'SERIES' ? TV_GENRES : MOVIE_GENRES).map(
          ([name, id]) => ({ id, name }),
        );
        const items = data.results
          .map((raw) => normalizeMedia(raw, type, genres.length ? genres : fallback))
          .filter((item): item is MediaResult => !!item);
        const result = { items, genres, updatedAt: Date.now() };
        if (active) {
          cache.set(key, result);
          if (cache.size > 40) cache.delete(cache.keys().next().value!);
          setState({ key, data: result });
        }
      } catch (e) {
        if (active) setState({ key, error: e instanceof Error ? e.message : 'Error al cargar' });
      }
    };
    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [url, type, userId, key, attempt]);
  const current = state.key === key ? state : undefined;
  return {
    items: current?.data?.items || [],
    genres: current?.data?.genres || [],
    updatedAt: current?.data?.updatedAt,
    error: current?.error,
    loading: !!url && !!userId && !current,
    retry: () => {
      cache.delete(key);
      setState({ key: '' });
      setAttempt((n) => n + 1);
    },
  };
}
