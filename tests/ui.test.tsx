import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { Button, ButtonLink, IconButton } from '@/components/ui/Button';
import { RadioChoice, ColorSwatch } from '@/components/ui/Choice';

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

it('keeps icon button refs usable by positioned menus', () => {
  const ref = { current: null as HTMLButtonElement | null };
  render(
    <IconButton ref={ref} label="Opciones">
      …
    </IconButton>,
  );
  expect(ref.current).toBe(screen.getByRole('button', { name: 'Opciones' }));
  ref.current?.focus();
  expect(ref.current).toHaveFocus();
});

it('exposes a selected color and keeps its click out of form submission', () => {
  const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
  const choose = vi.fn();
  render(
    <form onSubmit={submit}>
      <ColorSwatch color="#10B981" selected onClick={choose} />
    </form>,
  );
  const swatch = screen.getByRole('button', { name: 'Color #10B981' });
  expect(swatch).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(swatch);
  expect(choose).toHaveBeenCalledTimes(1);
  expect(submit).not.toHaveBeenCalled();
});
