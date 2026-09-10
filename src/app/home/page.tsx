'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ArrowUpRight, BookOpen, Check, Clock } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useMediaStore } from '@/lib/store';
import { getDashboardSummary } from '@/lib/utils/dashboard';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { LibraryRow } from '@/components/dashboard/LibraryRow';
import { EditItemModal } from '@/components/media/EditItemModal';
import type { MediaItem } from '@/types/media';

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const items = useMediaStore((s) => s.items);
  const ready = useMediaStore((s) => s.isInitialized);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const summary = getDashboardSummary(items);
  function openLibrary(status: 'IN_PROGRESS' | 'WANT_TO_CONSUME') {
    const store = useMediaStore.getState();
    store.resetFilters();
    store.setSearchQuery('');
    store.setFilters({ status });
    router.push('/library');
  }
  if (!ready) return <DashboardSkeleton />;
  return (
    <div className="min-h-screen pb-nav-safe">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 md:pt-24 pb-10">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="min-w-0">
            <p className="kata-label text-[var(--accent-primary)] mb-2">TU ESPACIO EN KATA</p>
            <h1 className="kata-title-page break-words">
              Hola, {user?.user_metadata?.username || 'Usuario'}
            </h1>
            <p className="kata-copy mt-2">Un momento para seguir con lo que te gusta.</p>
          </div>
          <ButtonLink href="/search" className="shrink-0 self-start">
            <Plus size={18} aria-hidden="true" />
            Añadir contenido
          </ButtonLink>
        </header>
        <Panel tone="subtle" className="grid grid-cols-3 divide-x divide-white/10 mb-8 py-5">
          {[
            { label: 'En curso', value: summary.inProgress, icon: BookOpen },
            { label: 'Pendientes', value: summary.pending, icon: Clock },
            { label: 'Completados', value: summary.completed, icon: Check },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="px-3 sm:px-6">
              <Icon size={18} aria-hidden="true" className="text-[var(--accent-primary)] mb-3" />
              <p className="text-2xl sm:text-3xl font-semibold tabular-nums">{value}</p>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">{label}</p>
            </div>
          ))}
        </Panel>
        {summary.total === 0 ? (
          <Panel tone="accent" className="p-6 sm:p-10">
            <BookOpen size={28} className="text-[var(--accent-primary)] mb-5" aria-hidden="true" />
            <h2 className="kata-title-section">Tu próximo título empieza aquí</h2>
            <p className="kata-copy mt-3 mb-6 max-w-lg">
              Añade un libro, juego, película o serie. Aquí podrás retomar lo que tengas en curso y
              actualizarlo a tu ritmo.
            </p>
            <ButtonLink href="/search">Añadir mi primer título</ButtonLink>
          </Panel>
        ) : (
          <div className="grid lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-6 items-start">
            <Panel className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="kata-title-section">En curso</h2>
                <Button variant="ghost" size="sm" onClick={() => openLibrary('IN_PROGRESS')}>
                  Ver todos
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Button>
              </div>
              <p className="kata-copy mt-2 mb-2">Retoma tus títulos y actualiza cómo vas.</p>
              {summary.continuing.length ? (
                <div className="divide-y divide-white/10">
                  {summary.continuing.map((item) => (
                    <LibraryRow key={item.id} item={item} onEdit={setEditing} />
                  ))}
                </div>
              ) : (
                <div className="py-8">
                  <p className="kata-copy mb-4">
                    No tienes títulos en curso. Elige uno de tus pendientes para empezar.
                  </p>
                  <Button variant="secondary" onClick={() => openLibrary('WANT_TO_CONSUME')}>
                    Ver pendientes
                  </Button>
                </div>
              )}
            </Panel>
            <Panel tone="subtle" className="p-5 sm:p-6">
              <h2 className="kata-title-section">Últimos añadidos</h2>
              <p className="kata-copy mt-2 mb-2">Las últimas incorporaciones a tu biblioteca.</p>
              <div className="divide-y divide-white/10">
                {summary.recent.map((item) => (
                  <LibraryRow key={item.id} item={item} onEdit={setEditing} recent />
                ))}
              </div>
            </Panel>
          </div>
        )}
      </main>
      {editing && (
        <EditItemModal key={editing.id} item={editing} isOpen onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
