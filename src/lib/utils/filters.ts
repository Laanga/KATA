import { MediaItem, MediaFilters, SortBy, GroupedStatus } from '@/types/media';

/**
 * Get all statuses that belong to a grouped status
 */
function getStatusesForGroupedStatus(groupedStatus: GroupedStatus): string[] {
  switch (groupedStatus) {
    case 'WANT_TO_CONSUME':
      return ['WANT_TO_READ', 'WANT_TO_PLAY', 'WANT_TO_WATCH'];
    case 'IN_PROGRESS':
      return ['READING', 'PLAYING', 'WATCHING'];
    case 'COMPLETED':
      return ['COMPLETED'];
    default:
      return [];
  }
}

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

  // Filter by status (support both grouped and individual statuses)
  if (filters.status !== 'ALL') {
    const statusFilter = filters.status;
    
    // Check if it's a grouped status
    if (['WANT_TO_CONSUME', 'IN_PROGRESS', 'COMPLETED'].includes(statusFilter)) {
      const statuses = getStatusesForGroupedStatus(statusFilter as GroupedStatus);
      filtered = filtered.filter((item) => statuses.includes(item.status));
    } else {
      // Individual status filter
      filtered = filtered.filter((item) => item.status === statusFilter);
    }
  }

  // Filter by rating (0-5 scale)
  if (filters.rating !== 'ALL') {
    filtered = filtered.filter((item) => {
      if (!item.rating) return false;
      
      switch (filters.rating) {
        case 'HIGH':
          return item.rating >= 4; // 4-5 estrellas
        case 'MID':
          return item.rating >= 2.5 && item.rating < 4; // 2.5-3.5 estrellas
        case 'LOW':
          return item.rating < 2.5; // 0-2 estrellas
        default:
          return true;
      }
    });
  }

  // Filter by genre
  if (filters.genre !== 'ALL') {
    filtered = filtered.filter((item) => {
      if (!item.genres || item.genres.length === 0) return false;
      return item.genres.some(genre => 
        genre.toLowerCase() === filters.genre.toLowerCase()
      );
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

    // Search in genres
    if (item.genres?.some(genre => genre.toLowerCase().includes(lowerQuery))) return true;

    return false;
  });
}
