'use client';
import { Chip } from '@/components/ui/Choice';
import { MediaCover } from '@/components/media/MediaCover';

import { useState, useEffect, useMemo } from 'react';
import { Settings, ChartNoAxesCombined, BookOpen, Gamepad2, Tv, Film, User } from 'lucide-react';
import { KataCard } from '@/components/media/KataCard';
import { useMediaStore } from '@/lib/store';
import { FadeIn } from '@/components/FadeIn';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { SettingsModal } from '@/components/SettingsModal';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/Button';
import { ProfileSkeleton } from '@/components/ui/Skeleton';
import { useRouter } from 'next/navigation';
import { STATUS_LABELS } from '@/lib/utils/constants';

export default function ProfilePage() {
  const items = useMediaStore((state) => state.items);
  const getStats = useMediaStore((state) => state.getStats);
  const isInitialized = useMediaStore((state) => state.isInitialized);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'reviews' | 'stats'>(
    'overview',
  );
  const { user } = useAuth();
  const userName = user?.user_metadata?.username || 'Usuario';
  const userEmail = user?.email || '';
  const avatarUrl = user?.user_metadata?.avatar_url || null;
  const router = useRouter();

  const stats = getStats();

  const favoriteItems = items
    .filter((item) => item.rating !== null)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);

  const recentActivity = [...items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const heatmapRef = useScrollAnimation({
    from: { opacity: 0, y: 50, scale: 0.95 },
    to: { opacity: 1, y: 0, scale: 1 },
  });

  const favoritesRef = useScrollAnimation({
    from: { opacity: 0, x: -50 },
    to: { opacity: 1, x: 0 },
  });

  const timelineRef = useScrollAnimation({
    from: { opacity: 0, x: 50 },
    to: { opacity: 1, x: 0 },
  });

  const days = 40;

  const activityChartData = useMemo(() => {
    const now = new Date();
    const data = Array.from({ length: days }).map((_, index) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - 1 - index));
      date.setHours(0, 0, 0, 0);

      const dayItems = items.filter((item) => {
        const itemDate = new Date(item.createdAt);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() === date.getTime();
      });

      const height = dayItems.length > 0 ? Math.min(100, dayItems.length * 20) : 0;
      const opacity = dayItems.length > 0 ? Math.max(0.3, Math.min(1, dayItems.length * 0.2)) : 0.1;

      return { height, opacity };
    });

    return data;
  }, [items]);

  /* eslint-disable react-hooks/set-state-in-effect */

  // Fix hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!isInitialized) {
    return (
      <>
        <div className="min-h-screen pb-nav-safe">
          <main className="container mx-auto px-4 pt-10 md:pt-32 max-w-5xl">
            <ProfileSkeleton />
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen pb-nav-safe relative overflow-hidden">
        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
          />
        </div>

        <main className="container mx-auto px-4 pt-10 md:pt-32 max-w-5xl relative z-10">
          <>
            <FadeIn direction="up" delay={0.1}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 sm:mb-12">
                <div className="flex items-center gap-4 sm:gap-6 min-w-0 max-w-full">
                  <div className="relative h-20 w-20 sm:h-28 sm:w-28 flex-shrink-0 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-emerald-900 border-2 border-[var(--accent-primary)] shadow-2xl flex items-center justify-center overflow-hidden">
                    {avatarUrl ? (
                      <MediaCover
                        width={96}
                        height={128}
                        src={avatarUrl}
                        alt={userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={48} className="text-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h1 className="kata-title-page">{userName}</h1>
                    <p className="text-[var(--text-secondary)] flex items-center gap-2 mt-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-[var(--accent-primary)]"></span>
                      {stats.total} elementos rastreados
                    </p>
                    <p className="text-[var(--text-tertiary)] text-sm mt-1 break-all">
                      {userEmail || 'Sin email'}
                    </p>
                  </div>
                </div>

                <Button variant="secondary" onClick={() => setIsSettingsOpen(true)}>
                  <Settings size={16} />
                  Ajustes
                </Button>
              </div>
            </FadeIn>

            {stats.total === 0 && (
              <FadeIn direction="up" delay={0.15}>
                <div className="kata-panel kata-panel--subtle mb-8 p-6 border-[var(--accent-primary)]/20">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-start sm:justify-between gap-4">
                    <div>
                      <h3 className="kata-title-dialog mb-2">Empieza a trackear tu contenido</h3>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Añade tus primeras películas, series, libros o videojuegos para ver tus
                        estadísticas y actividad.
                      </p>
                    </div>
                    <Button onClick={() => router.push('/search')}>Buscar Contenido</Button>
                  </div>
                </div>
              </FadeIn>
            )}

            <FadeIn direction="up" delay={0.2}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-16">
                <StatCard
                  icon={<BookOpen size={20} />}
                  label="Libros"
                  value={stats.byType.BOOK || 0}
                  color="text-[var(--color-book)]"
                  total={stats.total}
                  delay={0}
                />
                <StatCard
                  icon={<Gamepad2 size={20} />}
                  label="Juegos"
                  value={stats.byType.GAME || 0}
                  color="text-[var(--color-game)]"
                  total={stats.total}
                  delay={0.1}
                />
                <StatCard
                  icon={<Tv size={20} />}
                  label="Series"
                  value={stats.byType.SERIES || 0}
                  color="text-[var(--color-series)]"
                  total={stats.total}
                  delay={0.2}
                />
                <StatCard
                  icon={<Film size={20} />}
                  label="Películas"
                  value={stats.byType.MOVIE || 0}
                  color="text-[var(--color-movie)]"
                  total={stats.total}
                  delay={0.3}
                />
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.3}>
              <div className="border-b border-white/10 mb-8">
                <div className="flex gap-2 pb-3 overflow-x-auto scrollbar-hide">
                  <TabItem
                    label="Resumen"
                    active={activeTab === 'overview'}
                    onClick={() => setActiveTab('overview')}
                  />
                  <TabItem
                    label="Historial"
                    active={activeTab === 'history'}
                    onClick={() => setActiveTab('history')}
                  />
                  <TabItem
                    label="Reseñas"
                    active={activeTab === 'reviews'}
                    onClick={() => setActiveTab('reviews')}
                  />
                  <TabItem
                    label="Estadísticas"
                    active={activeTab === 'stats'}
                    onClick={() => setActiveTab('stats')}
                  />
                </div>
              </div>
            </FadeIn>

            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                <div className="lg:col-span-2 space-y-8 sm:space-y-12">
                  <section ref={heatmapRef}>
                    <div className="flex items-center gap-3 mb-6">
                      <ChartNoAxesCombined className="text-[var(--accent-primary)]" />
                      <h2 className="kata-title-section text-xl">Actividad por Día</h2>
                    </div>
                    <div className="kata-panel p-4 sm:p-8 transition-colors">
                      <div className="h-32 flex items-end justify-between gap-0.5 sm:gap-1">
                        {activityChartData.map((data, i) => (
                          <div
                            key={i}
                            className="w-full min-w-[3px] rounded-sm bg-[var(--accent-primary)] transition-all hover:opacity-100 cursor-pointer"
                            style={{
                              height: `${data.height}%`,
                              opacity: data.opacity,
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-4 text-xs text-[var(--text-tertiary)] font-mono">
                        <span>Hace 40 días</span>
                        <span>Ayer</span>
                      </div>
                    </div>
                  </section>

                  {favoriteItems.length > 0 && (
                    <section ref={favoritesRef}>
                      <h2 className="kata-title-section text-xl mb-6">Mejor Valorados</h2>
                      <div className="grid grid-cols-3 gap-2 sm:gap-4">
                        {favoriteItems.map((item, index) => (
                          <FadeIn key={`fav-${item.id}`} delay={index * 0.1}>
                            <KataCard item={item} />
                          </FadeIn>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                <div className="space-y-8">
                  <section ref={timelineRef}>
                    <h2 className="kata-title-section mb-4 text-[var(--text-secondary)]">
                      Actividad Reciente
                    </h2>
                    <div className="relative border-l border-white/10 pl-6 space-y-8 py-2">
                      {recentActivity.slice(0, 5).map((item, index) => (
                        <FadeIn key={item.id} delay={index * 0.15}>
                          <TimelineItem
                            title={item.title}
                            date={getRelativeTime(item.createdAt)}
                            type={item.type}
                            desc={
                              item.review ||
                              `Añadido a ${STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status}`
                            }
                          />
                        </FadeIn>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h2 className="kata-title-section text-xl mb-6">Historial Completo</h2>
                <div className="space-y-3">
                  {recentActivity.map((item, index) => (
                    <FadeIn key={item.id} delay={index * 0.05}>
                      <div className="kata-panel kata-panel--subtle flex items-center gap-4 p-4 transition-colors">
                        <MediaCover
                          width={96}
                          height={128}
                          src={item.coverUrl}
                          alt={item.title}
                          className="h-16 w-12 rounded object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="kata-title-dialog">{item.title}</h3>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {item.author || item.platform || item.releaseYear}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-[var(--accent-primary)]">
                            {item.rating ? `${item.rating}/5` : 'Sin valorar'}
                          </p>
                          <p className="text-xs text-[var(--text-tertiary)]">
                            {getRelativeTime(item.createdAt)}
                          </p>
                        </div>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <h2 className="kata-title-section text-xl mb-6">Tus Reseñas</h2>
                <div className="space-y-4">
                  {items
                    .filter((item) => item.review)
                    .map((item, index) => (
                      <FadeIn key={item.id} delay={index * 0.05}>
                        <div className="kata-panel kata-panel--subtle p-6 transition-colors">
                          <div className="flex items-start gap-4 mb-4">
                            <MediaCover
                              width={96}
                              height={128}
                              src={item.coverUrl}
                              alt={item.title}
                              className="h-20 w-14 rounded object-cover"
                            />
                            <div className="flex-1">
                              <h3 className="kata-title-dialog mb-1">{item.title}</h3>
                              <p className="text-sm text-[var(--text-secondary)] mb-2">
                                {item.author || item.platform}
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="text-[var(--accent-warning)]">
                                  {item.rating ? `${item.rating}/5` : 'Sin valorar'}
                                </div>
                                <span className="text-[var(--text-tertiary)]">•</span>
                                <span className="text-sm text-[var(--text-tertiary)]">
                                  {getRelativeTime(item.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                            {item.review}
                          </p>
                        </div>
                      </FadeIn>
                    ))}
                  {items.filter((item) => item.review).length === 0 && (
                    <p className="text-center text-[var(--text-tertiary)] py-12">
                      Aún no tienes reseñas. ¡Comienza a reseñar tus elementos!
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-8">
                <h2 className="kata-title-section text-xl mb-6">Estadísticas Detalladas</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="kata-panel kata-panel--subtle p-6">
                    <h3 className="kata-section-label text-[var(--text-tertiary)] mb-4">
                      Por Estado
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(stats.byStatus).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <span className="text-sm text-white">
                            {STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status}
                          </span>
                          <span className="text-sm font-bold text-[var(--accent-primary)]">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="kata-panel kata-panel--subtle p-6">
                    <h3 className="kata-section-label text-[var(--text-tertiary)] mb-4">
                      Distribución de Valoraciones
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: '5 estrellas', min: 4.5, max: 6 },
                        { label: '4 estrellas', min: 3.5, max: 4.5 },
                        { label: '3 estrellas', min: 2.5, max: 3.5 },
                        { label: '1-2 estrellas', min: 0, max: 2.5 },
                      ].map(({ label, min, max }) => {
                        const count = items.filter(
                          (item) => item.rating !== null && item.rating >= min && item.rating < max,
                        ).length;
                        return (
                          <div key={label} className="flex items-center justify-between">
                            <span className="text-sm text-white">{label}</span>
                            <span className="text-sm font-bold text-[var(--accent-primary)]">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        </main>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}

function StatCard({
  label,
  value,
  color,
  icon,
  total,
  delay,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  total: number;
  delay: number;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <FadeIn delay={delay} direction="up">
      <div className="kata-panel group relative overflow-hidden p-4 sm:p-6 transition-all duration-300 hover:scale-105">
        <div
          className={`mb-3 sm:mb-4 ${color} opacity-80 group-hover:scale-110 transition-transform`}
        >
          {icon}
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm text-[var(--text-tertiary)] font-medium">{label}</div>
        <div className="mt-4 h-1 w-full rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out`}
            style={{
              width: `${percentage}%`,
              backgroundColor: `var(--color-${label.toLowerCase()})`,
            }}
          />
        </div>
      </div>
    </FadeIn>
  );
}

function TabItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <Chip selected={!!active} onClick={onClick}>
      {label}
    </Chip>
  );
}

function TimelineItem({
  title,
  date,
  type,
  desc,
}: {
  title: string;
  date: string;
  type: string;
  desc: string;
}) {
  const getColor = (t: string) => {
    switch (t) {
      case 'BOOK':
        return 'bg-[var(--color-book)]';
      case 'GAME':
        return 'bg-[var(--color-game)]';
      case 'MOVIE':
        return 'bg-[var(--color-movie)]';
      case 'SERIES':
        return 'bg-[var(--color-series)]';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="relative group">
      <span
        className={`absolute -left-[29px] top-1 h-3 w-3 rounded-full ${getColor(type)} ring-4 ring-[var(--bg-primary)] group-hover:scale-125 transition-transform`}
      />
      <h4 className="text-sm font-medium text-white group-hover:text-[var(--accent-primary)] transition-colors">
        {title}
      </h4>
      <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{date}</p>
      <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-2">{desc}</p>
    </div>
  );
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Ahora mismo';
  if (diffInSeconds < 3600)
    return `hace ${Math.floor(diffInSeconds / 60)} minuto${Math.floor(diffInSeconds / 60) > 1 ? 's' : ''}`;
  if (diffInSeconds < 86400)
    return `hace ${Math.floor(diffInSeconds / 3600)} hora${Math.floor(diffInSeconds / 3600) > 1 ? 's' : ''}`;
  if (diffInSeconds < 604800)
    return `hace ${Math.floor(diffInSeconds / 86400)} día${Math.floor(diffInSeconds / 86400) > 1 ? 's' : ''}`;
  return `hace ${Math.floor(diffInSeconds / 604800)} semana${Math.floor(diffInSeconds / 604800) > 1 ? 's' : ''}`;
}
