import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { getDashboardSummary, getDailyAdditions, formatRating } from '@/lib/utils/dashboard';
import { useMediaStore } from '@/lib/store';
import HomePage from '@/app/home/page';
import ProfilePage from '@/app/profile/page';
import type { MediaItem } from '@/types/media';
const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/components/AuthProvider', () => ({
  useAuth: () => ({ user: { email: 'qa@example.test', user_metadata: { username: 'QA' } } }),
}));
vi.mock('@/components/media/MediaCover', () => ({ MediaCover: () => null }));
vi.mock('@/components/SettingsModal', () => ({ SettingsModal: () => null }));
vi.mock('@/components/media/EditItemModal', () => ({
  EditItemModal: ({ item }: { item: MediaItem }) => <div role="dialog">{item.title}</div>,
}));
const makeItem = (overrides: Partial<MediaItem> = {}): MediaItem => ({
  id: '1',
  title: 'Libro',
  type: 'BOOK',
  coverUrl: '',
  rating: null,
  status: 'READING',
  createdAt: '2026-01-01T12:00:00Z',
  ...overrides,
});
beforeEach(() => {
  useMediaStore.getState().reset('qa');
  useMediaStore.setState({ isInitialized: true });
  push.mockClear();
});
it('counts all grouped states, includes zero ratings, and sorts without mutating the library', () => {
  const items = [
    makeItem({ rating: 0 }),
    makeItem({ id: '2', status: 'WANT_TO_WATCH', rating: 4 }),
    makeItem({ id: '3', status: 'COMPLETED' }),
    makeItem({ id: '4', updatedAt: '2026-02-01' }),
    makeItem({ id: '5', status: 'DROPPED' }),
  ];
  const stats = getDashboardSummary(items);
  expect(stats).toMatchObject({
    total: 5,
    inProgress: 2,
    pending: 1,
    completed: 1,
    dropped: 1,
    rated: 2,
    average: 2,
  });
  expect(stats.continuing.map((item) => item.id)).toEqual(['4', '1']);
  expect(items[0].id).toBe('1');
  expect(formatRating(0)).toBe('0/5');
  expect(formatRating(null)).toBe('Sin valorar');
  expect(getDashboardSummary([]).average).toBeNull();
});
it('limits previews to five while retaining full totals', () => {
  const stats = getDashboardSummary(
    Array.from({ length: 40 }, (_, index) => makeItem({ id: String(index) })),
  );
  expect(stats.inProgress).toBe(40);
  expect(stats.continuing).toHaveLength(5);
  expect(stats.recent).toHaveLength(5);
});
it('counts 30 local calendar dates including today, excludes older and future additions', () => {
  const now = new Date(2026, 2, 30, 12);
  const items = [
    makeItem({ createdAt: new Date(2026, 2, 1, 12).toISOString() }),
    makeItem({ createdAt: now.toISOString() }),
    makeItem({ createdAt: new Date(2026, 1, 28, 12).toISOString() }),
    makeItem({ createdAt: new Date(2026, 2, 31, 12).toISOString() }),
  ];
  const days = getDailyAdditions(items, now);
  expect(days).toHaveLength(30);
  expect(days[0].count).toBe(1);
  expect(days[29].count).toBe(1);
  expect(days.reduce((sum, day) => sum + day.count, 0)).toBe(2);
});
it('opens an item for editing and clears stale filters before viewing in-progress titles', () => {
  useMediaStore.setState({
    items: [makeItem()],
    searchQuery: 'unrelated',
    filters: { type: 'GAME', genre: 'Drama', rating: 'HIGH', status: 'COMPLETED' },
  });
  render(<HomePage />);
  fireEvent.click(screen.getAllByRole('button', { name: 'Actualizar Libro' })[0]);
  expect(screen.getByRole('dialog')).toHaveTextContent('Libro');
  fireEvent.click(screen.getByRole('button', { name: 'Ver todos' }));
  expect(useMediaStore.getState().filters).toEqual({
    type: 'ALL',
    genre: 'ALL',
    rating: 'ALL',
    status: 'IN_PROGRESS',
  });
  expect(useMediaStore.getState().searchQuery).toBe('');
  expect(push).toHaveBeenCalledWith('/library');
});
it('offers a first title when empty and pending titles when nothing is in progress', () => {
  const view = render(<HomePage />);
  expect(screen.getByRole('link', { name: 'Añadir mi primer título' })).toHaveAttribute(
    'href',
    '/search',
  );
  view.unmount();
  useMediaStore.setState({ items: [makeItem({ status: 'COMPLETED' })] });
  render(<HomePage />);
  fireEvent.click(screen.getByRole('button', { name: 'Ver pendientes' }));
  expect(useMediaStore.getState().filters.status).toBe('WANT_TO_CONSUME');
});
it('preserves zero-rated reviews and opens their editing form', () => {
  useMediaStore.setState({ items: [makeItem({ rating: 0, review: 'No me gustó' })] });
  render(<ProfilePage />);
  expect(screen.getByText('0/5')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Reseñas' }));
  expect(screen.getByText('0/5')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Editar reseña de Libro' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('Libro');
});
