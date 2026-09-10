import type { MediaType, MediaProvider } from '@/types/media';
export interface MediaResult {
  externalId: string;
  provider: MediaProvider;
  type: MediaType;
  title: string;
  releaseDate?: string;
  year?: number;
  author?: string;
  platform?: string;
  coverUrl?: string;
  overview?: string;
  genres: string[];
}
const object = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.length > 0 ? v : undefined;
const strings = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string') : [];
const names = (v: unknown): string[] =>
  Array.isArray(v)
    ? v
        .map((g) => str(object(g).name) || str(object(object(g).platform).name))
        .filter((s): s is string => !!s)
    : [];
const imageUrl = (v: unknown): string | undefined => {
  const s = str(v);
  if (!s) return;
  const candidate = s.startsWith('//') ? `https:${s}` : s.replace(/^http:/, 'https:');
  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' ? url.href : undefined;
  } catch {
    return undefined;
  }
};
export function normalizeMedia(
  raw: unknown,
  type: MediaType,
  genres: { id: string | number; name: string }[] = [],
): MediaResult | null {
  const item = object(raw);
  const info = object(item.volumeInfo);
  const title = str(item.title) || str(item.name) || str(info.title);
  const id = typeof item.id === 'number' ? String(item.id) : str(item.id);
  if (!title || !id) return null;
  let provider: MediaProvider =
    type === 'BOOK'
      ? id.startsWith('/works/') || id.startsWith('/books/')
        ? 'openlibrary'
        : 'google-books'
      : type === 'GAME'
        ? item.provider === 'rawg' || item.background_image
          ? 'rawg'
          : 'igdb'
        : 'tmdb';
  if (item.provider === 'openlibrary') provider = 'openlibrary';
  const release =
    str(item.release_date) ||
    str(item.first_air_date) ||
    str(item.released) ||
    str(info.publishedDate);
  const releaseDate =
    release && /^\d{4}-\d{2}-\d{2}$/.test(release) && Number.isFinite(Date.parse(release))
      ? release
      : typeof item.first_release_date === 'number' &&
          Number.isFinite(new Date(item.first_release_date * 1000).getTime())
        ? new Date(item.first_release_date * 1000).toISOString().slice(0, 10)
        : undefined;
  const year = release
    ? Number(release.slice(0, 4))
    : typeof item.first_release_date === 'number'
      ? new Date(item.first_release_date * 1000).getUTCFullYear()
      : undefined;
  const images = object(info.imageLinks);
  const cover = str(object(item.cover).url) || str(item.cover);
  const coverUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : imageUrl(
        item.background_image ||
          cover?.replace('t_thumb', 't_cover_big') ||
          images.thumbnail ||
          images.smallThumbnail,
      );
  const genreNames = strings(item.genre_names).length
    ? strings(item.genre_names)
    : names(item.genres).length
      ? names(item.genres)
      : strings(info.genre_names).length
        ? strings(info.genre_names)
        : strings(info.categories);
  if (!genreNames.length && Array.isArray(item.genre_ids))
    for (const id of item.genre_ids) {
      const name = genres.find((g) => String(g.id) === String(id))?.name;
      if (name) genreNames.push(name);
    }
  return {
    externalId: id,
    provider,
    type,
    title,
    releaseDate,
    year: year && Number.isFinite(year) ? year : undefined,
    coverUrl,
    author: strings(info.authors)[0],
    platform: names(item.platforms).join(', ') || undefined,
    overview: str(item.overview) || str(item.summary) || str(info.description),
    genres: genreNames,
  };
}
export function normalizeResponse(data: unknown, type: MediaType): MediaResult[] {
  const o = object(data);
  const list = Array.isArray(data) ? data : type === 'BOOK' ? (o.items ?? o.results) : o.results;
  if (!Array.isArray(list)) throw new Error('El proveedor devolvió una respuesta no válida');
  return list
    .map((item) => normalizeMedia(item, type))
    .filter((item): item is MediaResult => item !== null);
}
