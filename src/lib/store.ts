import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MediaItem, MediaFilters, SortBy } from '@/types/media';
import { filterMediaItems, sortMediaItems, searchMediaItems } from '@/lib/utils/filters';

interface MediaStore {
  // State
  items: MediaItem[];
  filters: MediaFilters;
  sortBy: SortBy;
  searchQuery: string;
  isLoading: boolean;

  // Actions
  setItems: (items: MediaItem[]) => void;
  addItem: (item: MediaItem) => void;
  updateItem: (id: string, updates: Partial<MediaItem>) => void;
  deleteItem: (id: string) => void;
  
  // Filters
  setFilters: (filters: Partial<MediaFilters>) => void;
  resetFilters: () => void;
  setSortBy: (sortBy: SortBy) => void;
  setSearchQuery: (query: string) => void;
  
  // Computed
  getFilteredItems: () => MediaItem[];
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

export const useMediaStore = create<MediaStore>()(
  persist(
    (set, get) => ({
      // Initial State
      items: [],
      filters: DEFAULT_FILTERS,
      sortBy: 'date_added',
      searchQuery: '',
      isLoading: false,

      // Actions
      setItems: (items) => set({ items }),

      addItem: (item) =>
        set((state) => ({
          items: [item, ...state.items],
        })),

      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
          ),
        })),

      deleteItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      // Filters
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      resetFilters: () => set({ filters: DEFAULT_FILTERS }),

      setSortBy: (sortBy) => set({ sortBy }),

      setSearchQuery: (searchQuery) => set({ searchQuery }),

      // Computed
      getFilteredItems: () => {
        const { items, filters, sortBy, searchQuery } = get();
        
        // Apply search first
        let filtered = searchMediaItems(items, searchQuery);
        
        // Apply filters
        filtered = filterMediaItems(filtered, filters);
        
        // Apply sorting
        filtered = sortMediaItems(filtered, sortBy);
        
        return filtered;
      },

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
    }),
    {
      name: 'kata-media-storage',
      partialize: (state) => ({ 
        items: state.items,
        filters: state.filters,
        sortBy: state.sortBy,
      }),
    }
  )
);
