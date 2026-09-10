import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { AddItemModal } from '@/components/media/AddItemModal';
import { EditItemModal } from '@/components/media/EditItemModal';
import { useMediaStore } from '@/lib/store';
import type { MediaItem } from '@/types/media';
vi.mock('@/components/ui/Modal', () => ({
  Modal: ({ children }: { children: React.ReactNode }) => <div role="dialog">{children}</div>,
}));
vi.mock('@/components/media/MediaCover', () => ({ MediaCover: () => null }));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
const item: MediaItem = {
  id: 'id',
  title: 'Title',
  type: 'BOOK',
  status: 'READING',
  coverUrl: '',
  rating: 4,
  review: 'Previous note',
  createdAt: '2020-01-01',
};
beforeEach(() => {
  useMediaStore.getState().reset('user');
});
it('keeps the add form open after a rejected database write', async () => {
  const onClose = vi.fn();
  const addItem = vi.fn().mockRejectedValue(new Error('offline'));
  useMediaStore.setState({ addItem });
  render(
    <AddItemModal isOpen onClose={onClose} prefilledType="BOOK" initialData={{ title: 'Book' }} />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Añadir a Biblioteca' }));
  await waitFor(() => expect(addItem).toHaveBeenCalledTimes(1));
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});
it('waits for confirmation, blocks double clicks, and retries onboarding without duplicate insertion', async () => {
  let resolve!: (value: MediaItem) => void;
  const addItem = vi.fn().mockReturnValue(
    new Promise<MediaItem>((r) => {
      resolve = r;
    }),
  );
  const saved = vi
    .fn()
    .mockRejectedValueOnce(new Error('preference failed'))
    .mockResolvedValue(undefined);
  const onClose = vi.fn();
  useMediaStore.setState({ addItem });
  render(
    <AddItemModal
      isOpen
      onClose={onClose}
      onSaved={saved}
      prefilledType="BOOK"
      initialData={{ title: 'Book' }}
    />,
  );
  const button = screen.getByRole('button', { name: 'Añadir a Biblioteca' });
  fireEvent.click(button);
  fireEvent.click(button);
  expect(addItem).toHaveBeenCalledTimes(1);
  expect(button).toBeDisabled();
  expect(onClose).not.toHaveBeenCalled();
  resolve(item);
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Continuar con el título guardado' })).toBeEnabled(),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Continuar con el título guardado' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  expect(addItem).toHaveBeenCalledTimes(1);
  expect(saved).toHaveBeenCalledTimes(2);
});
it('sends an explicit empty review and retains the form when editing fails', async () => {
  const onClose = vi.fn();
  const updateItem = vi.fn().mockRejectedValue(new Error('offline'));
  useMediaStore.setState({ items: [item], updateItem });
  render(<EditItemModal item={item} isOpen onClose={onClose} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
  fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
  await waitFor(() =>
    expect(updateItem).toHaveBeenCalledWith('id', expect.objectContaining({ review: '' })),
  );
  expect(onClose).not.toHaveBeenCalled();
});
it('keeps optional notes collapsed in the guided first save, without requiring a rating', async () => {
  const addItem = vi.fn().mockResolvedValue(item);
  useMediaStore.setState({ addItem });
  render(
    <AddItemModal
      isOpen
      gentle
      onClose={vi.fn()}
      prefilledType="BOOK"
      initialData={{ title: 'First book' }}
    />,
  );
  expect(screen.getByText(/Añadir valoración o nota/).closest('details')).not.toHaveAttribute(
    'open',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Guardar en mi biblioteca' }));
  await waitFor(() =>
    expect(addItem).toHaveBeenCalledWith(
      expect.objectContaining({ rating: null, status: 'WANT_TO_READ' }),
    ),
  );
});
