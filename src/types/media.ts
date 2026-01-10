// Core Media Types
export type MediaType = 'BOOK' | 'GAME' | 'MOVIE' | 'SERIES';

export type MediaStatus = 
  | 'WANT_TO_READ' | 'READING' | 'COMPLETED' | 'DROPPED'  // Books
  | 'WANT_TO_PLAY' | 'PLAYING'  // Games (shares COMPLETED, DROPPED)
  | 'WANT_TO_WATCH' | 'WATCHING'; // Movies/Series (shares COMPLETED, DROPPED)

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  coverUrl: string;
  rating: number | null;
  status: MediaStatus;
  
  // Optional metadata
  author?: string;       // Books
  platform?: string;     // Games
  releaseYear?: number;  // All
  genres?: string[];     // All
  review?: string;       // User review
  
  // Timestamps
  createdAt: string;
  updatedAt?: string;
}

// Filters
export interface MediaFilters {
  type: MediaType | 'ALL';
  status: MediaStatus | 'ALL';
  rating: 'ALL' | 'HIGH' | 'MID' | 'LOW'; // HIGH: 8-10, MID: 5-7, LOW: 0-4
}

export type SortBy = 
  | 'date_added' 
  | 'date_added_asc' 
  | 'rating_desc' 
  | 'rating_asc'
  | 'title_asc' 
  | 'title_desc';

// Search
export interface SearchResult {
  externalId: string;
  title: string;
  type: MediaType;
  coverUrl: string;
  releaseYear?: number;
  author?: string;
  platform?: string;
}
