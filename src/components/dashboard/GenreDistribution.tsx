'use client';

import { FadeIn } from "@/components/FadeIn";
import { useMediaStore } from "@/lib/store";
import { getGenreStats } from "@/lib/utils/analytics";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

export function GenreDistribution() {
  const items = useMediaStore((state) => state.items);
  const genreStats = getGenreStats(items);

  if (genreStats.length === 0) {
    return (
      <FadeIn delay={0.2}>
        <div className="bg-[var(--bg-secondary)] border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Géneros Favoritos</h3>
          <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
            No hay géneros disponibles
          </p>
        </div>
      </FadeIn>
    );
  }

  const data = genreStats.map(stat => ({
    name: stat.name.length > 15 ? stat.name.substring(0, 15) + '...' : stat.name,
    fullName: stat.name,
    count: stat.count,
    percentage: stat.percentage,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{data.fullName}</p>
          <p className="text-sm text-[var(--text-secondary)]">
            {data.count} items ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Color gradient basado en la posición
  const getBarColor = (index: number, total: number) => {
    const hue = 150 + (index * (60 / total)); // Verde a amarillo
    return `hsl(${hue}, 70%, 50%)`;
  };

  return (
    <FadeIn delay={0.2}>
      <div className="bg-[var(--bg-secondary)] border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-6">Géneros Favoritos</h3>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={100}
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                tickLine={{ stroke: 'var(--text-tertiary)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getBarColor(index, data.length)} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 space-y-2">
          {genreStats.slice(0, 5).map((stat, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)] truncate flex-1">
                {stat.name}
              </span>
              <span className="text-white font-medium ml-2">
                {stat.count}
              </span>
              <span className="text-[var(--text-tertiary)] ml-2 text-xs">
                ({stat.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}
