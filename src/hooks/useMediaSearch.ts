'use client';
import { useEffect, useRef, useState } from 'react';
import type { MediaType } from '@/types/media';
import { normalizeResponse, type MediaResult } from '@/lib/media/results';
const types: MediaType[] = ['BOOK', 'MOVIE', 'SERIES', 'GAME'];
const endpoints = { BOOK: 'books', MOVIE: 'movies', SERIES: 'series', GAME: 'games' };
const labels = { BOOK: 'Libros', MOVIE: 'Películas', SERIES: 'Series', GAME: 'Juegos' };
export function useMediaSearch(initialType: MediaType | 'ALL' = 'ALL') {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<MediaType | 'ALL'>(initialType);
  const [results, setResults] = useState<MediaResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(0);
  const cache = useRef(new Map<string, { items: MediaResult[]; expires: number }>());
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const query = searchQuery.trim();
    setResults([]);
    setErrors([]);
    if (query.length < 2) {
      setIsSearching(false);
      return () => controller.abort();
    }
    setIsSearching(true);
    const timeout = setTimeout(async () => {
      const failed: string[] = [];
      const selected = activeFilter === 'ALL' ? types : [activeFilter];
      const response = await Promise.all(
        selected.map(async (type) => {
          const key = `${type}:${query.toLocaleLowerCase()}`;
          const cached = cache.current.get(key);
          if (cached && cached.expires > Date.now()) return cached.items;
          try {
            const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]);
            const res = await fetch(
              `/api/search/${endpoints[type]}?q=${encodeURIComponent(query)}`,
              { signal },
            );
            if (!res.ok)
              throw new Error(
                res.status === 429
                  ? 'Demasiadas búsquedas. Espera un minuto.'
                  : 'No disponible. Puedes reintentar.',
              );
            const items = normalizeResponse(await res.json(), type);
            cache.current.set(key, { items, expires: Date.now() + 300000 });
            if (cache.current.size > 50) cache.current.delete(cache.current.keys().next().value!);
            return items;
          } catch (error) {
            if (!controller.signal.aborted)
              failed.push(
                `${labels[type]}: ${error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'La búsqueda tardó demasiado.'}`,
              );
            return [];
          }
        }),
      );
      if (active) {
        setResults(response.flat());
        setErrors(failed);
        setIsSearching(false);
      }
    }, 400);
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchQuery, activeFilter, attempt]);
  return {
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    results,
    isSearching,
    errors,
    retry: () => setAttempt((n) => n + 1),
  };
}
