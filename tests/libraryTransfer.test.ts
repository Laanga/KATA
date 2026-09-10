import { describe, expect, it } from 'vitest';
import { createBackup, exportCSV, parseImport, validateBackup } from '@/lib/utils/libraryTransfer';
import { mediaItemToDbUpdate } from '@/types/supabase';
import type { MediaItem } from '@/types/media';
import { sameMedia } from '@/lib/utils/mediaIdentity';
const item: MediaItem = {
  id: 'a',
  type: 'MOVIE',
  title: 'Una "cita", aquí',
  status: 'COMPLETED',
  rating: 0,
  review: 'Primera línea\nSegunda "línea"',
  genres: ['Drama, histórico', 'Acción'],
  coverUrl: 'https://image.tmdb.org/a.jpg',
  provider: 'tmdb',
  externalId: '123',
  createdAt: '2020-01-01T00:00:00Z',
  completedAt: '2020-02-01T00:00:00Z',
};
describe('library transfer', () => {
  it('round trips multiline CSV, quoted fields, zero rating, genres, covers and identity', () => {
    expect(parseImport(exportCSV([item]), 'backup.csv').items[0]).toEqual(item);
  });
  it('accepts previous JSON arrays and preserves zero', () => {
    expect(parseImport(JSON.stringify([item]), 'backup.json').items[0].rating).toBe(0);
  });
  it('round trips collections and their relationships', () => {
    const backup = createBackup(
      [item],
      [
        {
          id: 'c',
          userId: 'u',
          name: 'Colección',
          icon: null,
          color: null,
          description: null,
          createdAt: '2020-01-01',
          updatedAt: null,
        },
      ],
      { c: ['a', 'deleted'] },
    );
    expect(validateBackup(backup).relationships).toEqual([{ itemId: 'a', collectionId: 'c' }]);
  });
  it('rejects invalid states, corrupt relationships and duplicate IDs', () => {
    expect(() => validateBackup([{ ...item, status: 'READING' }])).toThrow('estado');
    expect(() => validateBackup([item, item])).toThrow('ID repetido');
    expect(() =>
      validateBackup({
        items: [item],
        collections: [],
        relationships: [{ itemId: 'a', collectionId: 'foreign' }],
      }),
    ).toThrow('inexistente');
  });
  it('makes an explicit empty review a database deletion', () => {
    expect(mediaItemToDbUpdate({ review: '' })).toEqual({ review: null });
    expect(mediaItemToDbUpdate({ status: 'COMPLETED' })).not.toHaveProperty('review');
  });
  it('distinguishes works by provider and ID, including homonymous works', () => {
    expect(sameMedia(item, { ...item, externalId: '456' })).toBe(false);
    expect(sameMedia(item, { ...item, title: 'Translated title' })).toBe(true);
    expect(sameMedia(item, { ...item, type: 'BOOK' })).toBe(false);
  });
});

it('round trips formula-like text without spreadsheet execution or lost apostrophes', () => {
  for (const title of ['=SUM(1,2)', '+Title', '-Title', '@Name', "'Original"]) {
    expect(parseImport(exportCSV([{ ...item, title }]), 'copy.csv').items[0].title).toBe(title);
  }
});
