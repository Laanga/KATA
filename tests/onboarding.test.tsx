import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingGuide } from '@/components/OnboardingGuide';
import SearchPage from '@/app/search/page';
import { useMediaStore } from '@/lib/store';
import type { UserPreferences } from '@/types/supabase';
const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  replace: vi.fn(),
  query: vi.fn(),
  filter: vi.fn(),
  preferences: {
    onboarding_status: 'in_progress',
    onboarding_step: 1,
    preferred_type: 'BOOK',
    first_item_id: null,
  },
}));
vi.mock('@/components/OnboardingProvider', () => ({
  useOnboarding: () => ({ preferences: mocks.preferences, save: mocks.save }),
}));
vi.mock('@/components/ui/Modal', () => ({
  Modal: ({
    children,
    onClose,
    title,
  }: {
    children: React.ReactNode;
    onClose: () => void;
    title: string;
  }) => (
    <div role="dialog" aria-label={title}>
      <button onClick={onClose}>Cerrar diálogo</button>
      {children}
    </div>
  ),
}));
vi.mock('@/components/FadeIn', () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/components/media/MediaCover', () => ({ MediaCover: () => null }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: mocks.replace }) }));
vi.mock('@vercel/analytics', () => ({ track: vi.fn() }));
vi.mock('@/hooks/useMediaSearch', () => ({
  useMediaSearch: (type: string) => ({
    activeFilter: type,
    setActiveFilter: mocks.filter,
    searchQuery: '',
    setSearchQuery: mocks.query,
    errors: [],
    results: [],
    isSearching: false,
    retry: vi.fn(),
  }),
}));
vi.mock('@/components/media/AddItemModal', () => ({ AddItemModal: () => null }));
const preferences = () =>
  ({
    ...mocks.preferences,
    user_id: 'qa',
    onboarding_version: 1,
    finished_at: null,
    updated_at: '2026-09-10T00:00:00Z',
  }) as UserPreferences;
beforeEach(() => {
  vi.clearAllMocks();
  mocks.preferences.onboarding_step = 1;
  mocks.save.mockResolvedValue(undefined);
  useMediaStore.getState().reset('qa');
});
it('keeps the welcome open if skipping fails, without forcing navigation', async () => {
  mocks.save.mockRejectedValueOnce(new Error('No se pudo guardar'));
  render(<OnboardingGuide preferences={preferences()} save={mocks.save} />);
  await userEvent.click(screen.getByRole('button', { name: 'Ahora no' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo guardar');
  expect(mocks.replace).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'Ahora no' }));
  expect(mocks.save).toHaveBeenLastCalledWith(
    expect.objectContaining({ onboarding_status: 'skipped' }),
  );
  expect(mocks.replace).not.toHaveBeenCalled();
});
it('persists the category before moving to the real search screen', async () => {
  render(<OnboardingGuide preferences={preferences()} save={mocks.save} />);
  await userEvent.click(screen.getByRole('radio', { name: 'Juegos' }));
  await userEvent.click(screen.getByRole('button', { name: 'Vamos a buscar' }));
  await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/search'));
  expect(mocks.save).toHaveBeenCalledWith(
    expect.objectContaining({ onboarding_step: 2, preferred_type: 'GAME' }),
  );
});
it('renders search guidance inline without a blocking dialog and offers a real query', async () => {
  mocks.preferences.onboarding_step = 2;
  render(<SearchPage />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Empieza por algo que te guste.' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Libros' })).toHaveAttribute('aria-pressed', 'true');
  await userEvent.click(screen.getByRole('button', { name: 'Buscar «El principito»' }));
  expect(mocks.query).toHaveBeenCalledWith('El principito');
});
it('waits for final persistence and clears old filters before opening the library', async () => {
  mocks.preferences.onboarding_step = 3;
  let resolve!: () => void;
  mocks.save.mockImplementationOnce(
    () =>
      new Promise<void>((r) => {
        resolve = r;
      }),
  );
  useMediaStore.getState().setFilters({ type: 'GAME' });
  useMediaStore.getState().setSearchQuery('stale');
  render(<OnboardingGuide preferences={preferences()} save={mocks.save} />);
  await userEvent.click(screen.getByRole('button', { name: 'Ver mi biblioteca' }));
  expect(mocks.replace).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Ver mi biblioteca' })).toBeDisabled();
  resolve();
  await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/library'));
  expect(useMediaStore.getState().filters.type).toBe('ALL');
  expect(useMediaStore.getState().searchQuery).toBe('');
});
it('closing the success modal completes the guide rather than skipping it', async () => {
  mocks.preferences.onboarding_step = 3;
  render(<OnboardingGuide preferences={preferences()} save={mocks.save} />);
  await userEvent.click(screen.getByRole('button', { name: 'Cerrar diálogo' }));
  expect(mocks.save).toHaveBeenCalledWith(
    expect.objectContaining({ onboarding_status: 'completed' }),
  );
});
