import { beforeEach, expect, it, vi } from 'vitest';
import { useMediaStore } from '@/lib/store';
import { mediaDb } from '@/lib/supabase/database';
import { collectionsDb } from '@/lib/supabase/collections';
import type { MediaItem } from '@/types/media';
vi.mock('@/lib/supabase/database', () => ({
  mediaDb: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
    import: vi.fn(),
  },
}));
vi.mock('@/lib/supabase/collections', () => ({
  collectionsDb: { getAll: vi.fn(), getRelationships: vi.fn() },
}));
const item: MediaItem = {
  id: 'a',
  title: 'Title',
  type: 'BOOK',
  status: 'READING',
  rating: null,
  coverUrl: '',
  createdAt: '2020-01-01',
};
beforeEach(() => {
  vi.resetAllMocks();
  useMediaStore.getState().reset('user-a');
  vi.mocked(mediaDb.getAll).mockResolvedValue([item]);
  vi.mocked(collectionsDb.getAll).mockResolvedValue([]);
  vi.mocked(collectionsDb.getRelationships).mockResolvedValue({});
});
it('retains data after a loading error and permits retry', async () => {
  useMediaStore.setState({ items: [item] });
  vi.mocked(mediaDb.getAll).mockRejectedValueOnce(new Error('offline'));
  await expect(useMediaStore.getState().initialize()).rejects.toThrow();
  expect(useMediaStore.getState()).toMatchObject({
    items: [item],
    isInitialized: false,
    isLoading: false,
  });
  expect(useMediaStore.getState().error).toBeTruthy();
  await useMediaStore.getState().initialize();
  expect(useMediaStore.getState()).toMatchObject({ isInitialized: true, error: null });
});
it('coalesces concurrent initialization', async () => {
  await Promise.all([useMediaStore.getState().initialize(), useMediaStore.getState().initialize()]);
  expect(mediaDb.getAll).toHaveBeenCalledTimes(1);
});
it('does not publish old account data after a session change', async () => {
  let resolve!: (items: MediaItem[]) => void;
  vi.mocked(mediaDb.getAll).mockReturnValueOnce(
    new Promise((r) => {
      resolve = r;
    }),
  );
  const pending = useMediaStore.getState().initialize();
  useMediaStore.getState().reset('user-b');
  resolve([item]);
  await pending;
  expect(useMediaStore.getState()).toMatchObject({
    userId: 'user-b',
    items: [],
    isInitialized: false,
  });
});
it('does not clear local state when the database operation fails', async () => {
  useMediaStore.setState({ items: [item], collectionItemIds: { c: ['a'] } });
  vi.mocked(mediaDb.clear).mockRejectedValueOnce(new Error('offline'));
  await expect(useMediaStore.getState().clearLibrary()).rejects.toThrow();
  expect(useMediaStore.getState().items).toEqual([item]);
  await useMediaStore.getState().clearLibrary();
  expect(useMediaStore.getState()).toMatchObject({ items: [], collectionItemIds: {} });
});
it('cleans collection relationships only after successful deletion', async () => {
  useMediaStore.setState({ items: [item], collectionItemIds: { c: ['a'] } });
  vi.mocked(mediaDb.delete).mockRejectedValueOnce(new Error('offline'));
  await expect(useMediaStore.getState().deleteItem('a')).rejects.toThrow();
  expect(useMediaStore.getState().collectionItemIds.c).toEqual(['a']);
  await useMediaStore.getState().deleteItem('a');
  expect(useMediaStore.getState().collectionItemIds.c).toEqual([]);
});
