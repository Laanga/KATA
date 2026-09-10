'use client';

import { useState } from 'react';
import { ArrowRight, Film, BookOpen, Plus } from 'lucide-react';
import { Button, IconButton } from '@/components/ui/Button';
import { TextInput, TextArea, NativeSelect } from '@/components/ui/Field';
import { Chip, RadioChoice } from '@/components/ui/Choice';
import { Panel } from '@/components/ui/Panel';
import { Modal } from '@/components/ui/Modal';

export default function DesignSystemPage() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('books');
  const [filter, setFilter] = useState('Todos');
  return (
    <main className="mx-auto max-w-5xl px-5 py-12 space-y-10">
      <header className="space-y-3">
        <p className="text-sm text-[var(--kata-accent-text)]">KATA · SISTEMA DE DISEÑO</p>
        <h1 className="kata-title-page">Una misma identidad.</h1>
        <p className="kata-copy max-w-2xl">
          Catálogo interactivo de los componentes reales de la aplicación. La portada, los
          formularios y la bienvenida comparten estas reglas.
        </p>
      </header>
      <Panel className="space-y-5">
        <h2 className="kata-title-section">Acciones</h2>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setOpen(true)}>
            Abrir bienvenida <ArrowRight size={16} />
          </Button>
          <Button variant="secondary">Secundaria</Button>
          <Button variant="outline">Contorno</Button>
          <Button variant="ghost">Discreta</Button>
          <Button variant="danger">Eliminar</Button>
          <Button variant="warning">Revisar</Button>
          <IconButton label="Añadir título">
            <Plus size={20} />
          </IconButton>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Pequeño</Button>
          <Button>Mediano</Button>
          <Button size="lg">Grande</Button>
          <Button disabled>No disponible</Button>
          <Button isLoading>Guardando</Button>
        </div>
      </Panel>
      <div className="grid gap-5 md:grid-cols-2">
        <Panel className="space-y-5">
          <h2 className="kata-title-section">Campos</h2>
          <div>
            <label className="kata-label" htmlFor="ds-title">
              Título
            </label>
            <TextInput id="ds-title" placeholder="¿Qué te apetece guardar?" />
          </div>
          <div>
            <label className="kata-label" htmlFor="ds-state">
              Estado
            </label>
            <NativeSelect id="ds-state">
              <option>Pendiente</option>
              <option>En progreso</option>
              <option>Completado</option>
            </NativeSelect>
          </div>
          <div>
            <label className="kata-label" htmlFor="ds-notes">
              Tus notas
            </label>
            <TextArea id="ds-notes" placeholder="Lo que quieras recordar" />
          </div>
          <div>
            <label className="kata-label" htmlFor="ds-error">
              Campo con error
            </label>
            <TextInput
              id="ds-error"
              aria-invalid="true"
              aria-describedby="ds-error-help"
              defaultValue=""
            />
            <p id="ds-error-help" className="mt-2 text-sm text-red-300">
              Escribe un título para continuar.
            </p>
          </div>
        </Panel>
        <Panel className="space-y-5">
          <h2 className="kata-title-section">Selección</h2>
          <div className="flex flex-wrap gap-2" aria-label="Filtrar por estado">
            {['Todos', 'Pendientes', 'Completados'].map((value) => (
              <Chip key={value} selected={filter === value} onClick={() => setFilter(value)}>
                {value}
              </Chip>
            ))}
          </div>
          <fieldset className="space-y-3">
            <legend className="kata-label">¿Por dónde empezamos?</legend>
            <RadioChoice
              name="ds-category"
              checked={category === 'books'}
              onChange={() => setCategory('books')}
            >
              <BookOpen size={20} />
              Libros
            </RadioChoice>
            <RadioChoice
              name="ds-category"
              checked={category === 'movies'}
              onChange={() => setCategory('movies')}
            >
              <Film size={20} />
              Películas
            </RadioChoice>
          </fieldset>
          <Panel tone="subtle">
            <p className="kata-title-dialog">Superficie discreta</p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Contenido complementario y tarjetas dentro de un diálogo.
            </p>
          </Panel>
          <Panel tone="accent">
            <p className="kata-title-dialog">Un siguiente paso claro</p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              El mismo esmeralda señala la selección y acompaña el onboarding.
            </p>
          </Panel>
        </Panel>
      </div>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Bienvenido a Kata" size="md">
        <div className="space-y-5">
          <h2 className="kata-title-section">Tu próxima historia empieza aquí.</h2>
          <p className="kata-copy">
            Un mensaje breve, una acción clara y espacio para explorar a tu ritmo.
          </p>
          <div className="kata-action-row">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Ahora no
            </Button>
            <Button onClick={() => setOpen(false)}>
              Vamos a buscar <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
