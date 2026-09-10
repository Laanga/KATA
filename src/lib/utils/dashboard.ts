import type { MediaItem } from '@/types/media';

export const isInProgress = (item: MediaItem) =>
  ['READING', 'PLAYING', 'WATCHING'].includes(item.status);
export const isPending = (item: MediaItem) =>
  ['WANT_TO_READ', 'WANT_TO_PLAY', 'WANT_TO_WATCH'].includes(item.status);
export function getDashboardSummary(items: MediaItem[]) {
  const rated = items.filter((item) => item.rating !== null);
  return {
    total: items.length,
    inProgress: items.filter(isInProgress).length,
    pending: items.filter(isPending).length,
    completed: items.filter((item) => item.status === 'COMPLETED').length,
    dropped: items.filter((item) => item.status === 'DROPPED').length,
    rated: rated.length,
    average: rated.length
      ? rated.reduce((sum, item) => sum + item.rating!, 0) / rated.length
      : null,
    continuing: items
      .filter(isInProgress)
      .sort(
        (a, b) => Date.parse(b.updatedAt || b.createdAt) - Date.parse(a.updatedAt || a.createdAt),
      )
      .slice(0, 5),
    recent: [...items]
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, 5),
  };
}
export function getDailyAdditions(items: MediaItem[], now = new Date()) {
  const key = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const counts = new Map<string, number>();
  for (const item of items) {
    const date = key(new Date(item.createdAt));
    counts.set(date, (counts.get(date) || 0) + 1);
  }
  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 29 + index);
    return { date, count: counts.get(key(date)) || 0 };
  });
}
export const formatRating = (rating: number | null) =>
  rating === null
    ? 'Sin valorar'
    : `${rating.toLocaleString('es-ES', { maximumFractionDigits: 1 })}/5`;
