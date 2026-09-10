import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Button, ButtonLink } from '@/components/ui/Button';
import { RadioChoice } from '@/components/ui/Choice';

it('requires explicit submission and blocks repeated actions while saving', () => {
  const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
  const action = vi.fn();
  render(
    <form onSubmit={submit}>
      <Button>Cancelar</Button>
      <Button type="submit">Guardar</Button>
      <Button isLoading onClick={action}>
        Enviando
      </Button>
    </form>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(submit).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
  expect(submit).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'Enviando' }));
  expect(action).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Enviando' })).toHaveAttribute('aria-busy', 'true');
});
it('keeps navigation as a link and choices as labeled native radios', () => {
  const change = vi.fn();
  render(
    <>
      <ButtonLink href="/library">Biblioteca</ButtonLink>
      <RadioChoice name="category" checked={false} onChange={change}>
        Libros
      </RadioChoice>
    </>,
  );
  expect(screen.getByRole('link', { name: 'Biblioteca' })).toHaveAttribute('href', '/library');
  fireEvent.click(screen.getByRole('radio', { name: 'Libros' }));
  expect(change).toHaveBeenCalledTimes(1);
});
