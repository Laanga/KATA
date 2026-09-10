import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { StarRating } from '@/components/ui/StarRating';

function Example() {
  const [value, setValue] = useState<number | null>(null);
  return <StarRating value={value} onChange={setValue} />;
}
it('selects whole stars, distinguishes zero from unrated, and clears the score', () => {
  render(<Example />);
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  expect(screen.getAllByRole('button')).toHaveLength(6);
  fireEvent.click(screen.getByRole('button', { name: '4 estrellas' }));
  expect(screen.getByText('4 / 5')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '4 estrellas' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  fireEvent.click(screen.getByRole('button', { name: '0 estrellas' }));
  expect(screen.getByText('0 / 5')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Quitar puntuación' }));
  expect(screen.getByText('Sin puntuar')).toBeInTheDocument();
});
it('supports keyboard selection without submitting the parent form', async () => {
  const user = userEvent.setup();
  const submit = vi.fn((e) => e.preventDefault());
  render(
    <form onSubmit={submit}>
      <Example />
    </form>,
  );
  screen.getByRole('button', { name: '5 estrellas' }).focus();
  await user.keyboard('{Enter}');
  expect(screen.getByText('5 / 5')).toBeInTheDocument();
  expect(submit).not.toHaveBeenCalled();
});
it('previews hover without committing and does not expose controls in readonly mode', () => {
  const change = vi.fn();
  const { rerender } = render(<StarRating value={2} onChange={change} />);
  fireEvent.mouseEnter(screen.getByRole('button', { name: '5 estrellas' }));
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByText('2 / 5')).toBeInTheDocument();
  rerender(<StarRating value={0} onChange={change} readonly />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(screen.getByText('0 / 5')).toBeInTheDocument();
});
