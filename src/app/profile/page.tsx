'use client';
import { useState } from 'react';
import { Settings, User, Star, Library } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useMediaStore } from '@/lib/store';
import { getDashboardSummary, getDailyAdditions, formatRating } from '@/lib/utils/dashboard';
import { getYearDistribution } from '@/lib/utils/analytics';
import { TYPE_COLORS } from '@/lib/utils/constants';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Choice';
import { Panel } from '@/components/ui/Panel';
import { ProfileSkeleton } from '@/components/ui/Skeleton';
import { MediaCover } from '@/components/media/MediaCover';
import { EditItemModal } from '@/components/media/EditItemModal';
import { SettingsModal } from '@/components/SettingsModal';
import { DistributionPanel } from '@/components/dashboard/DistributionPanel';
import type { MediaItem, MediaType } from '@/types/media';

export default function ProfilePage() {
  const { user } = useAuth();
  const items = useMediaStore((s) => s.items);
  const ready = useMediaStore((s) => s.isInitialized);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tab, setTab] = useState<'overview' | 'stats' | 'reviews'>('overview');
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const summary = getDashboardSummary(items);
  const days = getDailyAdditions(items);
  const maximum = Math.max(1, ...days.map((day) => day.count));
  const reviews = [...items]
    .filter((item) => item.review?.trim())
    .sort(
      (a, b) => Date.parse(b.updatedAt || b.createdAt) - Date.parse(a.updatedAt || a.createdAt),
    );
  const years = getYearDistribution(items);
  const knownYears = years.reduce((sum, year) => sum + year.count, 0);
  const types: { type: MediaType; label: string }[] = [
    { type: 'BOOK', label: 'Libros' },
    { type: 'GAME', label: 'Juegos' },
    { type: 'MOVIE', label: 'Películas' },
    { type: 'SERIES', label: 'Series' },
  ];
  if (!ready)
    return (
      <div className="max-w-6xl mx-auto px-4 pt-10 md:pt-24 pb-nav-safe">
        <ProfileSkeleton />
      </div>
    );
  return (
    <div className="min-h-screen pb-nav-safe">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 md:pt-24 pb-10">
        <header className="mb-8">
          <p className="kata-label text-[var(--accent-primary)] mb-4">TU CUENTA</p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4 min-w-0">
              <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-full overflow-hidden kata-icon-well">
                {user?.user_metadata?.avatar_url ? (
                  <MediaCover
                    src={user.user_metadata.avatar_url}
                    alt="Tu avatar"
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={32} aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="kata-title-page break-words">
                  {user?.user_metadata?.username || 'Usuario'}
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-2 break-all">
                  {user?.email || 'Sin email'}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              className="self-start shrink-0"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings size={16} aria-hidden="true" />
              Ajustes
            </Button>
          </div>
        </header>
        <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Secciones del perfil">
          {(
            [
              { id: 'overview', label: 'Resumen' },
              { id: 'stats', label: 'Estadísticas' },
              { id: 'reviews', label: 'Reseñas' },
            ] as const
          ).map((section) => (
            <Chip
              key={section.id}
              selected={tab === section.id}
              onClick={() => setTab(section.id)}
              aria-controls="profile-content"
            >
              {section.label}
            </Chip>
          ))}
        </div>
        <div id="profile-content">
          {summary.total === 0 && (
            <Panel tone="accent" className="p-5 sm:p-6 mb-6">
              <h2 className="kata-title-section">Tu biblioteca, a tu ritmo</h2>
              <p className="kata-copy mt-2 mb-4">
                Cuando añadas contenido, aquí podrás ver cómo se reparte tu biblioteca y consultar
                tus valoraciones.
              </p>
              <ButtonLink href="/search">Añadir contenido</ButtonLink>
            </Panel>
          )}
          {tab === 'overview' && (
            <div className="space-y-6">
              <Panel
                tone="subtle"
                className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/10"
              >
                <div className="p-5 sm:p-6">
                  <Library
                    size={20}
                    className="text-[var(--accent-primary)] mb-3"
                    aria-hidden="true"
                  />
                  <p className="kata-label">Títulos en tu biblioteca</p>
                  <p className="text-3xl font-semibold mt-2 tabular-nums">{summary.total}</p>
                </div>
                <div className="p-5 sm:p-6">
                  <Star
                    size={20}
                    className="text-[var(--accent-warning)] mb-3"
                    aria-hidden="true"
                  />
                  <p className="kata-label">Valoración media</p>
                  <p className="text-3xl font-semibold mt-2 tabular-nums">
                    {formatRating(summary.average)}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-2">
                    {summary.rated} {summary.rated === 1 ? 'título valorado' : 'títulos valorados'}{' '}
                    · los títulos sin valorar no se incluyen
                  </p>
                </div>
              </Panel>
              <div className="grid md:grid-cols-2 gap-6">
                <DistributionPanel
                  title="Por categoría"
                  description="Los títulos que has guardado, según su formato."
                  total={summary.total}
                  rows={types.map(({ type, label }) => ({
                    label,
                    count: items.filter((item) => item.type === type).length,
                    color: TYPE_COLORS[type],
                  }))}
                />
                <DistributionPanel
                  title="Por estado"
                  description="Una vista de lo que tienes pendiente, en marcha y terminado."
                  total={summary.total}
                  rows={[
                    { label: 'En curso', count: summary.inProgress },
                    { label: 'Pendientes', count: summary.pending },
                    { label: 'Completados', count: summary.completed },
                    { label: 'Abandonados', count: summary.dropped },
                  ]}
                />
              </div>
            </div>
          )}
          {tab === 'stats' && (
            <div className="space-y-6">
              <Panel className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="kata-title-section">Títulos añadidos</h2>
                    <p className="kata-copy mt-2">
                      Últimos 30 días, incluido hoy. Cuenta incorporaciones, no sesiones de uso.
                    </p>
                  </div>
                  <p className="text-2xl font-semibold tabular-nums">
                    {days.reduce((sum, day) => sum + day.count, 0)}
                    <span className="text-sm font-normal text-[var(--text-secondary)] ml-2">
                      títulos
                    </span>
                  </p>
                </div>
                <div
                  role="img"
                  aria-label="Incorporaciones diarias. Fechas y cantidades disponibles en la tabla siguiente."
                  className="flex items-end gap-1 h-32 mt-6"
                >
                  {days.map((day) => (
                    <div
                      key={day.date.toISOString()}
                      title={`${day.date.toLocaleDateString('es-ES')}: ${day.count} títulos`}
                      className="flex-1 bg-[var(--accent-primary)] rounded-t-sm"
                      style={{ height: `${(day.count / maximum) * 100}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-3">
                  <span>{days[0].date.toLocaleDateString('es-ES')}</span>
                  <span>Hoy</span>
                </div>
                <details className="mt-5 text-sm">
                  <summary className="cursor-pointer text-[var(--text-secondary)] focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]">
                    Ver fechas y cantidades
                  </summary>
                  <table className="w-full mt-3 text-left">
                    <caption className="sr-only">Títulos añadidos cada día</caption>
                    <thead>
                      <tr>
                        <th scope="col" className="py-2">
                          Fecha
                        </th>
                        <th scope="col">Títulos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {days.map((day) => (
                        <tr key={day.date.toISOString()}>
                          <td className="py-1">{day.date.toLocaleDateString('es-ES')}</td>
                          <td>{day.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              </Panel>
              <div className="grid md:grid-cols-2 gap-6">
                <DistributionPanel
                  title="Tus valoraciones"
                  description="Cómo se reparten tus puntuaciones, de 0 a 5."
                  total={summary.rated}
                  rows={Array.from(
                    new Set(items.flatMap((item) => (item.rating === null ? [] : [item.rating]))),
                  )
                    .sort((a, b) => b - a)
                    .map((rating) => ({
                      label: formatRating(rating),
                      count: items.filter((item) => item.rating === rating).length,
                      color: 'var(--accent-warning)',
                    }))}
                />
                <DistributionPanel
                  title="Años de las obras"
                  description={`Publicación o estreno, agrupados por década. ${summary.total - knownYears} títulos sin año conocido quedan fuera.`}
                  total={knownYears}
                  rows={years.map((year) => ({ label: year.decade, count: year.count }))}
                />
              </div>
            </div>
          )}
          {tab === 'reviews' && (
            <section>
              <h2 className="kata-title-section mb-2">Tus reseñas</h2>
              <p className="kata-copy mb-6">
                Lo que pensaste de cada título, con espacio para cambiar de opinión.
              </p>
              {reviews.length === 0 ? (
                <Panel tone="subtle" className="p-6">
                  <p className="kata-copy mb-4">
                    Aún no has escrito reseñas. Puedes añadir una al editar cualquier título.
                  </p>
                  <ButtonLink href="/library" variant="secondary">
                    Ir a mi biblioteca
                  </ButtonLink>
                </Panel>
              ) : (
                <div className="space-y-4">
                  {reviews.map((item) => (
                    <Panel key={item.id} className="p-5 sm:p-6">
                      <div className="flex items-start gap-3">
                        <MediaCover
                          src={item.coverUrl}
                          alt=""
                          width={40}
                          height={56}
                          className="w-10 h-14 shrink-0 rounded object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="kata-title-dialog break-words">{item.title}</h3>
                          <p className="text-sm text-[var(--accent-warning)] mt-2">
                            {formatRating(item.rating)}
                          </p>
                        </div>
                      </div>
                      <p className="kata-copy whitespace-pre-wrap break-words mt-4">
                        {item.review}
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-4"
                        aria-label={`Editar reseña de ${item.title}`}
                        onClick={() => setEditing(item)}
                      >
                        Editar reseña
                      </Button>
                    </Panel>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      {editing && (
        <EditItemModal key={editing.id} item={editing} isOpen onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
