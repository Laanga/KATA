import { MediaType, MediaStatus } from '@/types/media';

// Status Labels
export const STATUS_LABELS: Record<MediaStatus, string> = {
  // Books
  WANT_TO_READ: 'Quiero Leer',
  READING: 'Leyendo',
  
  // Games
  WANT_TO_PLAY: 'Quiero Jugar',
  PLAYING: 'Jugando',
  
  // Movies/Series
  WANT_TO_WATCH: 'Quiero Ver',
  WATCHING: 'Viendo',
  
  // Shared
  COMPLETED: 'Completado',
  DROPPED: 'Abandonado',
};

// Type Colors (from CSS variables)
export const TYPE_COLORS: Record<MediaType, string> = {
  BOOK: 'var(--color-book)',
  GAME: 'var(--color-game)',
  MOVIE: 'var(--color-movie)',
  SERIES: 'var(--color-series)',
};

// Status Colors
export const STATUS_COLORS: Record<string, string> = {
  WANT_TO_READ: 'var(--accent-muted)',
  READING: 'var(--accent-warning)',
  WANT_TO_PLAY: 'var(--accent-muted)',
  PLAYING: 'var(--accent-warning)',
  WANT_TO_WATCH: 'var(--accent-muted)',
  WATCHING: 'var(--accent-warning)',
  COMPLETED: 'var(--accent-success)',
  DROPPED: 'var(--text-tertiary)',
};

// Valid statuses per media type
export const VALID_STATUSES: Record<MediaType, MediaStatus[]> = {
  BOOK: ['WANT_TO_READ', 'READING', 'COMPLETED', 'DROPPED'],
  GAME: ['WANT_TO_PLAY', 'PLAYING', 'COMPLETED', 'DROPPED'],
  MOVIE: ['WANT_TO_WATCH', 'WATCHING', 'COMPLETED'],
  SERIES: ['WANT_TO_WATCH', 'WATCHING', 'COMPLETED', 'DROPPED'],
};

// Type icons (emoji)
export const TYPE_ICONS: Record<MediaType, string> = {
  BOOK: '📚',
  GAME: '🎮',
  MOVIE: '🎬',
  SERIES: '📺',
};

// Type labels
export const TYPE_LABELS: Record<MediaType, string> = {
  BOOK: 'Libro',
  GAME: 'Juego',
  MOVIE: 'Película',
  SERIES: 'Serie',
};
