import { create } from 'zustand';
import { MediaItem, MediaFilters, SortBy } from '@/types/media';
import { filterMediaItems, sortMediaItems, searchMediaItems } from '@/lib/utils/filters';
import { mediaDb } from '@/lib/supabase/database';

interface MediaStore {
  // State
  items: MediaItem[];
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
};

export const useMediaStore = create<MediaStore>()((set, get) => ({
  // Initial State
  items: [],
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
      const items = await mediaDb.getAll();
      set({ items, isInitialized: true });
    } catch (error) {
      console.error('Failed to initialize store:', error);
      set({ items: [], isInitialized: true });
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
