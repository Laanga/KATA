'use client';

import { FadeIn } from '@/components/FadeIn';
import { useMediaStore } from '@/lib/store';
import { Trophy, Star, Book, Calendar } from 'lucide-react';
import { useMemo } from 'react';

type AccentToken = 'primary' | 'gold' | 'secondary';

const ACCENTS: Record<AccentToken, { var: string; rgb: string }> = {
  primary: { var: 'var(--accent-primary)', rgb: '16, 185, 129' },
  gold: { var: 'var(--accent-warning)', rgb: '251, 191, 36' },
  secondary: { var: 'var(--accent-secondary)', rgb: '59, 130, 246' },
};

export function DashboardMetrics() {
  const items = useMediaStore((state) => state.items);

  const metrics = useMemo(() => {
    const totalItems = items.length;
    const completedItems = items.filter((i) => i.status === 'COMPLETED').length;
    const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    const ratedItems = items.filter((i) => i.rating !== null);
    const avgRating =
      ratedItems.length > 0
        ? (
            ratedItems.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedItems.length
          ).toFixed(1)
        : 'N/A';

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const itemsThisMonth = items.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    }).length;

    const completedThisMonth = items.filter((item) => {
      if (item.status !== 'COMPLETED' || !item.updatedAt) return false;
      const completedDate = new Date(item.updatedAt);
      return (
        completedDate.getMonth() === currentMonth && completedDate.getFullYear() === currentYear
      );
    }).length;

    return {
      totalItems,
      completedItems,
      completionRate,
      avgRating,
      itemsThisMonth,
      completedThisMonth,
    };
  }, [items]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      <MetricCard
        label="Total de Elementos"
        value={metrics.totalItems.toString()}
        icon={<Book size={20} />}
        accent="primary"
        delay={0}
      />
      <MetricCard
        label="Completados"
        value={`${metrics.completedItems} (${metrics.completionRate}%)`}
        icon={<Trophy size={20} />}
        accent="gold"
        delay={0.1}
      />
      <MetricCard
        label="Puntuación Media"
        value={metrics.avgRating}
        icon={<Star size={20} />}
        accent="gold"
        delay={0.2}
      />
      <MetricCard
        label="Este Mes"
        value={`+${metrics.itemsThisMonth}`}
        subtext={`${metrics.completedThisMonth} completados`}
        icon={<Calendar size={20} />}
        accent="secondary"
        delay={0.3}
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  subtext,
  delay,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  subtext?: string;
  delay: number;
  accent: AccentToken;
}) {
  const a = ACCENTS[accent];
  return (
    <FadeIn delay={delay}>
      <div
        className="kata-panel kata-panel--subtle group relative p-3 sm:p-4 md:p-5 transition-all duration-300 hover:-translate-y-0.5"
        style={{
          ['--metric-glow' as string]: `rgba(${a.rgb}, 0.18)`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 8px 32px rgba(${a.rgb}, 0.18), 0 1px 0 rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.14)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '';
        }}
      >
        <div className="flex items-center gap-2 sm:gap-3 text-[var(--text-secondary)] mb-1.5 sm:mb-2">
          <div
            className="flex items-center justify-center p-1.5 sm:p-2 rounded-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
            style={{
              background: `linear-gradient(180deg, rgba(${a.rgb}, 0.22) 0%, rgba(${a.rgb}, 0.10) 100%)`,
              color: a.var,
              boxShadow: `inset 0 0 0 1px rgba(${a.rgb}, 0.28)`,
            }}
          >
            {icon}
          </div>
          <span className="text-xs sm:text-sm font-medium line-clamp-1">{label}</span>
        </div>
        <div className="flex items-end gap-1.5 sm:gap-2">
          <span className="text-xl sm:text-2xl font-bold text-white">{value}</span>
          {subtext && (
            <span className="text-xs text-[var(--text-tertiary)] mb-0.5 sm:mb-1 hidden sm:inline">
              {subtext}
            </span>
          )}
        </div>
      </div>
    </FadeIn>
  );
}
