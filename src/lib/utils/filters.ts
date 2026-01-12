import { MediaItem, MediaFilters, SortBy } from '@/types/media';

/**
 * Filter media items based on filters
 */
export function filterMediaItems(
  items: MediaItem[],
  filters: MediaFilters
): MediaItem[] {
  let filtered = [...items];

  // Filter by type
  if (filters.type !== 'ALL') {
    filtered = filtered.filter((item) => item.type === filters.type);
  }

  // Filter by status
  if (filters.status !== 'ALL') {
    filtered = filtered.filter((item) => item.status === filters.status);
  }

  // Filter by rating (0-5 scale)
  if (filters.rating !== 'ALL') {
    filtered = filtered.filter((item) => {
      if (!item.rating) return false;
      
      switch (filters.rating) {
        case 'HIGH':
          return item.rating >= 4; // 4-5 estrellas
        case 'MID':
          return item.rating === 3; // 3 estrellas
        case 'LOW':
          return item.rating < 3; // 1-2 estrellas
        default:
          return true;
      }
    });
  }

  return filtered;
}

/**
 * Sort media items
 */
export function sortMediaItems(
  items: MediaItem[],
  sortBy: SortBy
): MediaItem[] {
  const sorted = [...items];

  switch (sortBy) {
    case 'date_added':
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    
    case 'date_added_asc':
      return sorted.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    
    case 'rating_desc':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    
    case 'rating_asc':
      return sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    
    case 'title_asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    
    case 'title_desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    
    default:
      return sorted;
  }
}

/**
 * Search media items by query
 */
export function searchMediaItems(
  items: MediaItem[],
  query: string
): MediaItem[] {
  if (!query || query.length < 2) return items;

  const lowerQuery = query.toLowerCase();

  return items.filter((item) => {
    // Search in title
    if (item.title.toLowerCase().includes(lowerQuery)) return true;

    // Search in author (books)
    if (item.author?.toLowerCase().includes(lowerQuery)) return true;

    // Search in platform (games)
    if (item.platform?.toLowerCase().includes(lowerQuery)) return true;

    return false;
  });
}
