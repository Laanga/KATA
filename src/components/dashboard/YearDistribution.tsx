'use client';

import { FadeIn } from "@/components/FadeIn";
import { useMediaStore } from "@/lib/store";
import { getYearDistribution } from "@/lib/utils/analytics";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function YearDistribution() {
  const items = useMediaStore((state) => state.items);
  const yearStats = getYearDistribution(items);

  if (yearStats.length === 0) {
    return (
      <FadeIn delay={0.2}>
        <div className="bg-[var(--bg-secondary)] border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Preferencia por Década</h3>
          <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
            No hay datos de años disponibles
          </p>
        </div>
      </FadeIn>
    );
  }

  const data = yearStats.map(stat => ({
    name: stat.decade,
    value: stat.count,
    percentage: stat.percentage,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-sm text-[var(--text-secondary)]">
            {data.value} items ({data.percentage}%)
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

    if (percent < 0.05) return null;

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

  // Color gradient: más reciente = más verde
  const getColor = (decade: string, maxDecade: string, index: number, total: number) => {
    const decadeNum = parseInt(decade);
    const maxDecadeNum = parseInt(maxDecade);
    const ratio = (decadeNum - (maxDecadeNum - 50)) / 50;
    const hue = 150 + (ratio * 30); // Verde a amarillo
    return `hsl(${hue}, 70%, 50%)`;
  };

  const maxDecade = yearStats[0]?.decade || '2020s';

  return (
    <FadeIn delay={0.2}>
      <div className="group bg-[var(--bg-secondary)] border border-white/5 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
        <h3 className="text-lg font-semibold mb-6 relative z-10">Preferencia por Década</h3>
        
        <div className="h-64 relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
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
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getColor(entry.name, maxDecade, index, data.length)} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6 relative z-10">
          {yearStats.map((stat, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-default"
            >
              <div
                className="w-3 h-3 rounded-full shadow-lg"
                style={{ backgroundColor: getColor(stat.decade, maxDecade, index, yearStats.length) }}
              />
              <span className="text-sm text-[var(--text-secondary)] flex-1">
                {stat.decade}
              </span>
              <span className="text-sm font-medium text-white">
                {stat.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}
