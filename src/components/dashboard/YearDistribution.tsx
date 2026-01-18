'use client';

import { FadeIn } from "@/components/FadeIn";
import { useMediaStore } from "@/lib/store";
import { getYearDistribution } from "@/lib/utils/analytics";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  percentage: number;
  [key: string]: string | number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartData; value: number; name: string }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
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

interface CustomLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: CustomLabelProps) => {
  const RADIAN = Math.PI / 180;
  const radius = (innerRadius || 0) + ((outerRadius || 0) - (innerRadius || 0)) * 0.5;
  const x = (cx || 0) + radius * Math.cos(-(midAngle || 0) * RADIAN);
  const y = (cy || 0) + radius * Math.sin(-(midAngle || 0) * RADIAN);

  if ((percent || 0) < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > (cx || 0) ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${((percent || 0) * 100).toFixed(0)}%`}
    </text>
  );
};

const getColor = (decade: string, maxDecade: string) => {
  const decadeNum = parseInt(decade);
  const maxDecadeNum = parseInt(maxDecade);
  const ratio = (decadeNum - (maxDecadeNum - 50)) / 50;
  const hue = 150 + (ratio * 30);
  return `hsl(${hue}, 70%, 50%)`;
};

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

  const data: ChartData[] = yearStats.map(stat => ({
    name: stat.decade,
    value: stat.count,
    percentage: stat.percentage,
  }));

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
                    fill={getColor(entry.name, maxDecade)}
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
                style={{ backgroundColor: getColor(stat.decade, maxDecade) }}
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
