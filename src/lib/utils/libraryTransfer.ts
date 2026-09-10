import Papa from 'papaparse';
import type { MediaItem, MediaType, MediaProvider, MediaStatus } from '@/types/media';
import type { Collection } from '@/types/collections';
import { VALID_STATUSES } from './constants';

export interface LibraryBackup {
  version: 1;
  items: MediaItem[];
  collections?: Pick<
    Collection,
    'id' | 'name' | 'description' | 'color' | 'icon' | 'createdAt' | 'updatedAt'
  >[];
  relationships?: { itemId: string; collectionId: string }[];
}
const providers: MediaProvider[] = ['tmdb', 'igdb', 'rawg', 'google-books', 'openlibrary'];
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
const optionalString = (value: unknown, max = 10000): string | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || value.length > max)
    throw new Error('Campo de texto inválido o demasiado largo');
  return value;
};
function date(value: unknown): string | undefined {
  const result = optionalString(value, 100);
  if (result && !Number.isFinite(Date.parse(result))) throw new Error('Fecha inválida');
  return result;
}
export function validateBackup(data: unknown): LibraryBackup {
  const source = Array.isArray(data) ? { items: data } : data;
  if (!record(source) || !Array.isArray(source.items) || source.items.length > 5000)
    throw new Error('El archivo debe contener hasta 5000 elementos');
  if (source.version !== undefined && source.version !== 1)
    throw new Error('Versión de copia no compatible');
  const ids = new Set<string>();
  const items = source.items.map((raw, index): MediaItem => {
    try {
      if (!record(raw)) throw new Error('Elemento inválido');
      const title = optionalString(raw.title, 200)?.trim();
      if (!title) throw new Error('Falta el título');
      const type = raw.type as MediaType;
      if (!Object.hasOwn(VALID_STATUSES, type)) throw new Error('Tipo inválido');
      if (!VALID_STATUSES[type].includes(raw.status as MediaStatus))
        throw new Error('El estado no corresponde al tipo');
      const rating =
        raw.rating === null || raw.rating === undefined || raw.rating === ''
          ? null
          : Number(raw.rating);
      if (rating !== null && (!Number.isFinite(rating) || rating < 0 || rating > 5))
        throw new Error('Valoración inválida (0–5)');
      const provider = optionalString(raw.provider) as MediaProvider | undefined;
      const externalId = optionalString(raw.externalId, 200);
      if (!!provider !== !!externalId || (provider && !providers.includes(provider)))
        throw new Error('Identificador externo inválido');
      const releaseYear =
        raw.releaseYear == null || raw.releaseYear === '' ? undefined : Number(raw.releaseYear);
      if (
        releaseYear !== undefined &&
        (!Number.isInteger(releaseYear) || releaseYear < 1 || releaseYear > 3000)
      )
        throw new Error('Año inválido');
      if (
        raw.genres !== undefined &&
        (!Array.isArray(raw.genres) || raw.genres.some((g) => typeof g !== 'string'))
      )
        throw new Error('Géneros inválidos');
      const id = optionalString(raw.id, 200) || crypto.randomUUID();
      if (ids.has(id)) throw new Error('ID repetido en el archivo');
      ids.add(id);
      return {
        id,
        title,
        type,
        status: raw.status as MediaStatus,
        rating,
        provider,
        externalId,
        releaseYear,
        coverUrl: optionalString(raw.coverUrl) || '',
        review: optionalString(raw.review, 500),
        author: optionalString(raw.author, 200),
        platform: optionalString(raw.platform, 200),
        genres: raw.genres as string[] | undefined,
        createdAt: date(raw.createdAt) || new Date().toISOString(),
        updatedAt: date(raw.updatedAt),
        completedAt: date(raw.completedAt),
      };
    } catch (error) {
      throw new Error(
        `Elemento ${index + 1}: ${error instanceof Error ? error.message : 'inválido'}`,
      );
    }
  });
  const backup: LibraryBackup = { version: 1, items };
  if (source.collections !== undefined) {
    if (!Array.isArray(source.collections) || source.collections.length > 5000)
      throw new Error('Colecciones inválidas');
    const collectionIds = new Set<string>();
    backup.collections = source.collections.map((c) => {
      if (!record(c)) throw new Error('Colección inválida');
      const id = optionalString(c.id, 200);
      const name = optionalString(c.name, 100)?.trim();
      if (!id || !name || collectionIds.has(id))
        throw new Error('Nombre o ID de colección inválido');
      collectionIds.add(id);
      const color = optionalString(c.color);
      if (color && !/^#[0-9a-f]{6}$/i.test(color)) throw new Error('Color inválido');
      return {
        id,
        name,
        color: color || null,
        icon: optionalString(c.icon) || null,
        description: optionalString(c.description) || null,
        createdAt: date(c.createdAt) || new Date().toISOString(),
        updatedAt: date(c.updatedAt) || null,
      };
    });
    if (source.relationships !== undefined) {
      if (!Array.isArray(source.relationships)) throw new Error('Relaciones inválidas');
      backup.relationships = source.relationships.map((r) => {
        if (
          !record(r) ||
          typeof r.itemId !== 'string' ||
          typeof r.collectionId !== 'string' ||
          !ids.has(r.itemId) ||
          !collectionIds.has(r.collectionId)
        )
          throw new Error('Relación con elemento o colección inexistente');
        return { itemId: r.itemId, collectionId: r.collectionId };
      });
    }
  }
  return backup;
}
const columns = {
  id: 'ID',
  title: 'Título',
  type: 'Tipo',
  status: 'Estado',
  rating: 'Valoración',
  author: 'Autor',
  platform: 'Plataforma',
  releaseYear: 'Año',
  genres: 'Géneros',
  review: 'Reseña',
  createdAt: 'Fecha Creación',
  updatedAt: 'Fecha Actualización',
  coverUrl: 'Portada',
  provider: 'Proveedor',
  externalId: 'ID Externo',
  completedAt: 'Fecha Finalización',
} as const;
export function exportCSV(items: MediaItem[]): string {
  return Papa.unparse(
    items.map((item) => ({
      'Formato Kata': 'csv-v1',
      ...Object.fromEntries(
        Object.entries(columns).map(([key, header]) => {
          const value = item[key as keyof MediaItem];
          const cell = key === 'genres' ? JSON.stringify(value || []) : (value ?? '');
          return [
            header,
            typeof cell === 'string' && /^[=+\-@\t\r']/.test(cell) ? "'" + cell : cell,
          ];
        }),
      ),
    })),
    { columns: ['Formato Kata', ...Object.values(columns)] },
  );
}
export function parseImport(content: string, filename: string): LibraryBackup {
  if (!filename.toLowerCase().endsWith('.csv')) return validateBackup(JSON.parse(content));
  const parsed = Papa.parse<Record<string, string>>(content.replace(/^\uFEFF/, ''), {
    header: true,
    skipEmptyLines: 'greedy',
  });
  if (parsed.errors.length) throw new Error(`CSV inválido: ${parsed.errors[0].message}`);
  if (!['Título', 'Tipo', 'Estado'].every((h) => parsed.meta.fields?.includes(h)))
    throw new Error('Faltan columnas Título, Tipo o Estado');
  return validateBackup(
    parsed.data.map((row) =>
      Object.fromEntries(
        Object.entries(columns).map(([key, header]) => {
          let value: unknown = row[header];
          if (
            row['Formato Kata'] === 'csv-v1' &&
            typeof value === 'string' &&
            /^'[=+\-@\t\r']/.test(value)
          )
            value = value.slice(1);
          if (key === 'genres')
            value = value?.toString().startsWith('[')
              ? JSON.parse(String(value))
              : value
                ? String(value)
                    .split(',')
                    .map((g) => g.trim())
                : [];
          return [key, value];
        }),
      ),
    ),
  );
}
export function createBackup(
  items: MediaItem[],
  collections: Collection[],
  relationships: Record<string, string[]>,
): LibraryBackup {
  return {
    version: 1,
    items,
    collections,
    relationships: Object.entries(relationships).flatMap(([collectionId, ids]) =>
      ids
        .filter((id) => items.some((item) => item.id === id))
        .map((itemId) => ({ itemId, collectionId })),
    ),
  };
}
