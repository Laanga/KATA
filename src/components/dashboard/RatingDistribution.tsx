'use client';

import { FadeIn } from "@/components/FadeIn";
import { useMediaStore } from "@/lib/store";
import { getRatingDistribution } from "@/lib/utils/analytics";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = {
  '0-2': '#ef4444', // Rojo para bajo
  '2.5-3.5': '#fbbf24', // Amarillo para medio
  '4-5': '#10b981', // Verde para alto
};

export function RatingDistribution() {
  const items = useMediaStore((state) => state.items);
  const distribution = getRatingDistribution(items);
  const total = distribution.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) {
    return (
      <FadeIn delay={0.2}>
        <div className="bg-[var(--bg-secondary)] border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Distribución de Ratings</h3>
          <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
            No hay items valorados
          </p>
        </div>
      </FadeIn>
    );
  }

  const data = distribution.map(item => ({
    name: item.label,
    value: item.count,
    percentage: item.percentage,
    range: item.range,
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

  return (
    <FadeIn delay={0.2}>
      <div className="group bg-[var(--bg-secondary)] border border-white/5 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
        <h3 className="text-lg font-semibold mb-6 relative z-10">Distribución de Ratings</h3>
        
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
                    fill={COLORS[entry.range as keyof typeof COLORS] || '#8884d8'} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2 mt-6 relative z-10">
          {data.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-default"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shadow-lg"
                  style={{ backgroundColor: COLORS[item.range as keyof typeof COLORS] }}
                />
                <span className="text-sm text-[var(--text-secondary)]">
                  {item.name} ({item.range})
                </span>
              </div>
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
