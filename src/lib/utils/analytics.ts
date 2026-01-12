import { MediaItem } from '@/types/media';

export interface GenreStat {
  name: string;
  count: number;
  percentage: number;
}

export interface RatingRange {
  range: string;
  label: string;
  count: number;
  percentage: number;
}

export interface YearDecade {
  decade: string;
  count: number;
  percentage: number;
}

export interface MonthlyStat {
  month: string;
  added: number;
  completed: number;
}

interface MonthStats {
  added: number;
  completed: number;
  monthLabel?: string;
}

/**
 * Agrupa y cuenta géneros de todos los items
 */
export function getGenreStats(items: MediaItem[]): GenreStat[] {
  const genreCount: Record<string, number> = {};

  items.forEach(item => {
    if (item.genres && Array.isArray(item.genres)) {
      item.genres.forEach(genre => {
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      });
    }
  });

  const total = Object.values(genreCount).reduce((sum, count) => sum + count, 0);
  
  return Object.entries(genreCount)
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10
}

/**
 * Distribuye ratings en rangos: Bajo (0-2), Medio (2.5-3.5), Alto (4-5)
 * Escala de 0 a 5
 */
export function getRatingDistribution(items: MediaItem[]): RatingRange[] {
  const ranges = [
    { range: '0-2', label: 'Bajo', min: 0, max: 2 },
    { range: '2.5-3.5', label: 'Medio', min: 2.5, max: 3.5 },
    { range: '4-5', label: 'Alto', min: 4, max: 5 },
  ];

  const ratedItems = items.filter(item => item.rating !== null);
  const total = ratedItems.length;

  return ranges.map(({ range, label, min, max }) => {
    const count = ratedItems.filter(
      item => item.rating !== null && item.rating >= min && item.rating <= max
    ).length;

    return {
      range,
      label,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });
}

/**
 * Agrupa items por décadas basado en releaseYear
 */
export function getYearDistribution(items: MediaItem[]): YearDecade[] {
  const decadeCount: Record<string, number> = {};

  items.forEach(item => {
    if (item.releaseYear) {
      const decade = Math.floor(item.releaseYear / 10) * 10;
      const decadeLabel = `${decade}s`;
      decadeCount[decadeLabel] = (decadeCount[decadeLabel] || 0) + 1;
    }
  });

  const total = Object.values(decadeCount).reduce((sum, count) => sum + count, 0);

  return Object.entries(decadeCount)
    .map(([decade, count]) => ({
      decade,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => {
      // Ordenar por década (más reciente primero)
      const decadeA = parseInt(a.decade);
      const decadeB = parseInt(b.decade);
      return decadeB - decadeA;
    });
}

/**
 * Filtra y ordena items por rating (mejores primero)
 * Escala de 0 a 5, considera alto rating >= 4
 */
export function getTopRatedItems(items: MediaItem[], limit: number = 5): MediaItem[] {
  return items
    .filter(item => item.rating !== null && item.rating >= 4)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, limit);
}

/**
 * Calcula estadísticas mensuales (items agregados y completados)
 */
export function getMonthlyStats(items: MediaItem[]): MonthlyStat[] {
  const monthStats: Record<string, MonthStats> = {};

  items.forEach(item => {
    const createdDate = new Date(item.createdAt);
    const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = createdDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });

    if (!monthStats[monthKey]) {
      monthStats[monthKey] = { added: 0, completed: 0, monthLabel };
    }
    monthStats[monthKey].added += 1;

    // Si está completado y tiene updatedAt, contar cuando se completó
    if (item.status === 'COMPLETED' && item.updatedAt) {
      const completedDate = new Date(item.updatedAt);
      const completedMonthKey = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}`;
      const completedMonthLabel = completedDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });

      if (!monthStats[completedMonthKey]) {
        monthStats[completedMonthKey] = { added: 0, completed: 0, monthLabel: completedMonthLabel };
      }
      monthStats[completedMonthKey].completed += 1;
    }
  });

  return Object.entries(monthStats)
    .map(([key, stats]) => ({
      month: stats.monthLabel || key,
      added: stats.added,
      completed: stats.completed,
    }))
    .sort((a, b) => {
      // Ordenar por mes (más reciente primero)
      const [yearA, monthA] = a.month.split(' ');
      const [yearB, monthB] = b.month.split(' ');
      if (yearA !== yearB) return parseInt(yearB) - parseInt(yearA);
      const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      return months.indexOf(monthB) - months.indexOf(monthA);
    })
    .slice(0, 6); // Últimos 6 meses
}
