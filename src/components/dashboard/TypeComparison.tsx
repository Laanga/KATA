'use client';

import { FadeIn } from "@/components/FadeIn";
import { useMediaStore } from "@/lib/store";
import { TYPE_LABELS, TYPE_COLORS } from "@/lib/utils/constants";
import { MediaType } from "@/types/media";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = {
  BOOK: '#8b5cf6',
  GAME: '#ef4444',
  MOVIE: '#3b82f6',
  SERIES: '#10b981',
};

export function TypeComparison() {
  const items = useMediaStore((state) => state.items);
  
  // Calcular estadísticas directamente desde items
  const byType = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const total = Object.values(byType).reduce((a, b) => a + b, 0);

  if (total === 0) {
    return (
      <FadeIn delay={0.2}>
        <div className="bg-[var(--bg-secondary)] border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Distribución por Tipo</h3>
          <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
            No hay datos para mostrar
          </p>
        </div>
      </FadeIn>
    );
  }

  const data = (Object.entries(byType) as [MediaType, number][])
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => ({
      name: TYPE_LABELS[type],
      value: count,
      percentage: Math.round((count / total) * 100),
      color: COLORS[type],
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-sm text-[var(--text-secondary)]">
            {data.value} items ({data.payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // No mostrar etiquetas muy pequeñas

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <FadeIn delay={0.2}>
      <div className="group bg-[var(--bg-secondary)] border border-white/5 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
        <h3 className="text-lg font-semibold mb-6 relative z-10">Distribución por Tipo</h3>
        
        <div className="h-64 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart key={`chart-${total}-${data.length}`}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={80}
                innerRadius={50}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6 relative z-10">
          {data.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-default"
            >
              <div
                className="w-3 h-3 rounded-full shadow-lg"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-[var(--text-secondary)] flex-1">
                {item.name}
              </span>
              <span className="text-sm font-medium text-white">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}
