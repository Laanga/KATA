import { create } from 'zustand';
import { MediaItem, MediaFilters, SortBy } from '@/types/media';
import { filterMediaItems, sortMediaItems, searchMediaItems } from '@/lib/utils/filters';
import { mediaDb } from '@/lib/supabase/database';
import { collectionsDb } from '@/lib/supabase/collections';
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

  // Initialize - Load data from Supabase
  initialize: async () => {
    if (get().isInitialized) return;
    
    set({ isLoading: true });
    try {
      const [items, collections] = await Promise.all([
        mediaDb.getAll(),
        collectionsDb.getAll(),
      ]);

      // Load item IDs for each collection
      const collectionItemIds: Record<string, string[]> = {};
      await Promise.all(
        collections.map(async (collection) => {
          const itemIds = await collectionsDb.getMediaItemIdsForCollection(collection.id);
          collectionItemIds[collection.id] = itemIds;
        })
      );

      set({ items, collections, collectionItemIds, isInitialized: true });
    } catch (error) {
      console.error('Failed to initialize store:', error);
      set({ items: [], collections: [], collectionItemIds: {}, isInitialized: true });
    } finally {
      set({ isLoading: false });
    }
  },

  // Refresh items from database
  refreshItems: async () => {
    set({ isLoading: true });
    try {
      const items = await mediaDb.getAll();
      set({ items });
    } catch (error) {
      console.error('Failed to refresh items:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Actions
  setItems: (items) => set({ items }),

  addItem: async (item) => {
    set({ isLoading: true });
    try {
      const newItem = await mediaDb.create(item);
      set((state) => ({
        items: [newItem, ...state.items],
        isLoading: false,
      }));
      return newItem;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateItem: async (id, updates) => {
    set({ isLoading: true });
    try {
      const updatedItem = await mediaDb.update(id, updates);
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? updatedItem : item
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteItem: async (id) => {
    set({ isLoading: true });
    try {
      await mediaDb.delete(id);
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Collection Actions
  createCollection: async (input) => {
    set({ isLoading: true });
    try {
      const newCollection = await collectionsDb.create(input);
      set((state) => ({
        collections: [newCollection, ...state.collections],
        collectionItemIds: { ...state.collectionItemIds, [newCollection.id]: [] },
        isLoading: false,
      }));
      return newCollection;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateCollection: async (id, input) => {
    set({ isLoading: true });
    try {
      const updatedCollection = await collectionsDb.update(id, input);
      set((state) => ({
        collections: state.collections.map((c) =>
          c.id === id ? updatedCollection : c
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteCollection: async (id) => {
    set({ isLoading: true });
    try {
      await collectionsDb.delete(id);
      set((state) => {
        const { [id]: _, ...remainingItemIds } = state.collectionItemIds;
        return {
          collections: state.collections.filter((c) => c.id !== id),
          collectionItemIds: remainingItemIds,
          isLoading: false,
        };
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  addItemToCollection: async (itemId, collectionId) => {
    try {
      await collectionsDb.addItemToCollection(itemId, collectionId);
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
    try {
      await collectionsDb.removeItemFromCollection(itemId, collectionId);
      set((state) => ({
        collectionItemIds: {
          ...state.collectionItemIds,
          [collectionId]: (state.collectionItemIds[collectionId] || []).filter(
            (id) => id !== itemId
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

    const byType = items.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

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
