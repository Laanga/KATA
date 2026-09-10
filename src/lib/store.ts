import { create } from 'zustand';
import { MediaItem, MediaFilters, SortBy } from '@/types/media';
import { filterMediaItems, sortMediaItems, searchMediaItems } from '@/lib/utils/filters';
import { mediaDb } from '@/lib/supabase/database';
import { collectionsDb } from '@/lib/supabase/collections';
import type { LibraryBackup } from '@/lib/utils/libraryTransfer';
import type { Collection, CreateCollectionInput, UpdateCollectionInput } from '@/types/collections';

interface MediaStore {
  // State
  items: MediaItem[];
  collections: Collection[];
  collectionItemIds: Record<string, string[]>;
  filters: MediaFilters;
  sortBy: SortBy;
  searchQuery: string;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  userId: string | null;
  reset: (userId?: string | null) => void;
  clearLibrary: () => Promise<void>;
  importLibrary: (backup: LibraryBackup, replace?: boolean) => Promise<number>;

  // Actions
  initialize: () => Promise<void>;
  setItems: (items: MediaItem[]) => void;
  addItem: (item: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<MediaItem>;
  updateItem: (id: string, updates: Partial<MediaItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  refreshItems: () => Promise<void>;

  // Collection Actions
  createCollection: (input: CreateCollectionInput) => Promise<Collection>;
  updateCollection: (id: string, input: UpdateCollectionInput) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  addItemToCollection: (itemId: string, collectionId: string) => Promise<void>;
  removeItemFromCollection: (itemId: string, collectionId: string) => Promise<void>;
  getItemsByCollection: (collectionId: string) => MediaItem[];

  // Filters
  setFilters: (filters: Partial<MediaFilters>) => void;
  resetFilters: () => void;
  setSortBy: (sortBy: SortBy) => void;
  setSearchQuery: (query: string) => void;

  // Computed
  getItemById: (id: string) => MediaItem | undefined;
  getStats: () => {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    averageRating: number;
  };
}

const DEFAULT_FILTERS: MediaFilters = {
  type: 'ALL',
  status: 'ALL',
  rating: 'ALL',
  genre: 'ALL',
};

let sessionVersion = 0;
let initialization: Promise<void> | null = null;

export const useMediaStore = create<MediaStore>()((set, get) => ({
  // Initial State
  items: [],
  collections: [],
  collectionItemIds: {},
  filters: DEFAULT_FILTERS,
  sortBy: 'date_added',
  searchQuery: '',
  isLoading: false,
  isInitialized: false,
  error: null,
  userId: null,
  reset: (userId = null) => {
    sessionVersion++;
    initialization = null;
    set({
      items: [],
      collections: [],
      collectionItemIds: {},
      isInitialized: false,
      isLoading: false,
      error: null,
      userId,
      filters: DEFAULT_FILTERS,
      searchQuery: '',
      sortBy: 'date_added',
    });
  },

  initialize: async () => {
    if (get().isInitialized) return;
    if (initialization) return initialization;
    const version = sessionVersion;
    set({ isLoading: true, error: null });
    const request = (async () => {
      try {
        const [items, collections, collectionItemIds] = await Promise.all([
          mediaDb.getAll(),
          collectionsDb.getAll(),
          collectionsDb.getRelationships(),
        ]);
        if (version === sessionVersion)
          set({ items, collections, collectionItemIds, isInitialized: true });
      } catch (error) {
        if (version === sessionVersion)
          set({ error: 'No hemos podido cargar tu biblioteca. Inténtalo de nuevo.' });
        throw error;
      } finally {
        if (version === sessionVersion) {
          set({ isLoading: false });
          initialization = null;
        }
      }
    })();
    initialization = request;
    return request;
  },

  refreshItems: async () => {
    const version = sessionVersion;
    const [items, collections, collectionItemIds] = await Promise.all([
      mediaDb.getAll(),
      collectionsDb.getAll(),
      collectionsDb.getRelationships(),
    ]);
    if (version === sessionVersion)
      set({ items, collections, collectionItemIds, error: null, isInitialized: true });
  },

  clearLibrary: async () => {
    const version = sessionVersion;
    await mediaDb.clear();
    if (version === sessionVersion) set({ items: [], collectionItemIds: {} });
  },

  importLibrary: async (backup, replace = false) => {
    const version = sessionVersion;
    const imported = await mediaDb.import(backup, replace);
    if (version === sessionVersion) {
      try {
        await get().refreshItems();
      } catch {
        set({
          error:
            'La importación se ha guardado, pero no pudimos actualizar la vista. Recarga para verla.',
        });
        throw new Error('Importación guardada. Recarga la biblioteca para verla.');
      }
    }
    return imported;
  },

  // Actions
  setItems: (items) => set({ items }),

  addItem: async (item) => {
    const version = sessionVersion;
    try {
      const newItem = await mediaDb.create(item);
      if (version === sessionVersion)
        set((state) => ({
          items: [newItem, ...state.items],
        }));
      return newItem;
    } catch (error) {
      throw error;
    }
  },

  updateItem: async (id, updates) => {
    const version = sessionVersion;
    try {
      const updatedItem = await mediaDb.update(id, updates);
      if (version === sessionVersion)
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? updatedItem : item)),
        }));
    } catch (error) {
      throw error;
    }
  },

  deleteItem: async (id) => {
    const version = sessionVersion;
    try {
      await mediaDb.delete(id);
      if (version === sessionVersion)
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          collectionItemIds: Object.fromEntries(
            Object.entries(state.collectionItemIds).map(([key, ids]) => [
              key,
              ids.filter((itemId) => itemId !== id),
            ]),
          ),
        }));
    } catch (error) {
      throw error;
    }
  },

  // Collection Actions
  createCollection: async (input) => {
    const version = sessionVersion;
    try {
      const newCollection = await collectionsDb.create(input);
      if (version === sessionVersion)
        set((state) => ({
          collections: [newCollection, ...state.collections],
          collectionItemIds: { ...state.collectionItemIds, [newCollection.id]: [] },
        }));
      return newCollection;
    } catch (error) {
      throw error;
    }
  },

  updateCollection: async (id, input) => {
    const version = sessionVersion;
    try {
      const updatedCollection = await collectionsDb.update(id, input);
      if (version === sessionVersion)
        set((state) => ({
          collections: state.collections.map((c) => (c.id === id ? updatedCollection : c)),
        }));
    } catch (error) {
      throw error;
    }
  },

  deleteCollection: async (id) => {
    const version = sessionVersion;
    try {
      await collectionsDb.delete(id);
      if (version === sessionVersion)
        set((state) => {
          const remainingItemIds = { ...state.collectionItemIds };
          delete remainingItemIds[id];
          return {
            collections: state.collections.filter((c) => c.id !== id),
            collectionItemIds: remainingItemIds,
          };
        });
    } catch (error) {
      throw error;
    }
  },

  addItemToCollection: async (itemId, collectionId) => {
    const version = sessionVersion;
    try {
      await collectionsDb.addItemToCollection(itemId, collectionId);
      if (version === sessionVersion)
        set((state) => ({
          collectionItemIds: {
            ...state.collectionItemIds,
            [collectionId]: [...(state.collectionItemIds[collectionId] || []), itemId],
          },
        }));
    } catch (error) {
      throw error;
    }
  },

  removeItemFromCollection: async (itemId, collectionId) => {
    const version = sessionVersion;
    try {
      await collectionsDb.removeItemFromCollection(itemId, collectionId);
      if (version === sessionVersion)
        set((state) => ({
          collectionItemIds: {
            ...state.collectionItemIds,
            [collectionId]: (state.collectionItemIds[collectionId] || []).filter(
              (id) => id !== itemId,
            ),
          },
        }));
    } catch (error) {
      throw error;
    }
  },

  getItemsByCollection: (collectionId) => {
    const state = get();
    const itemIds = state.collectionItemIds[collectionId] || [];
    return state.items.filter((item) => itemIds.includes(item.id));
  },

  // Filters
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  setSortBy: (sortBy) => set({ sortBy }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  // Computed
  getItemById: (id) => {
    return get().items.find((item) => item.id === id);
  },

  getStats: () => {
    const items = get().items;

    const byType = items.reduce(
      (acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byStatus = items.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const ratingsSum = items
      .filter((item) => item.rating !== null)
      .reduce((sum, item) => sum + (item.rating || 0), 0);

    const ratedCount = items.filter((item) => item.rating !== null).length;
    const averageRating = ratedCount > 0 ? ratingsSum / ratedCount : 0;

    return {
      total: items.length,
      byType,
      byStatus,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  },
}));

/**
 * Custom hook that returns filtered items with automatic re-rendering
 * when filters, sortBy, searchQuery, or items change
 */
export function useFilteredItems(): MediaItem[] {
  const items = useMediaStore((state) => state.items);
  const filters = useMediaStore((state) => state.filters);
  const sortBy = useMediaStore((state) => state.sortBy);
  const searchQuery = useMediaStore((state) => state.searchQuery);

  // Apply search first
  let filtered = searchMediaItems(items, searchQuery);

  // Apply filters
  filtered = filterMediaItems(filtered, filters);

  // Apply sorting
  filtered = sortMediaItems(filtered, sortBy);

  return filtered;
}
