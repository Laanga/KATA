'use client';

import { FadeIn } from "@/components/FadeIn";
import { useMediaStore } from "@/lib/store";
import { TYPE_LABELS, TYPE_COLORS } from "@/lib/utils/constants";
import { MediaType } from "@/types/media";

export function StatusDistribution() {
    const getStats = useMediaStore((state) => state.getStats);
    const stats = getStats();
    const total = Object.values(stats.byType).reduce((a, b) => a + b, 0);

    // If no data, don't render or render placeholder
    if (total === 0) return null;

    return (
        <FadeIn delay={0.2}>
            <div className="bg-[var(--bg-secondary)] border border-white/5 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-semibold mb-6">Library Composition</h3>

                {/* Progress Bar */}
                <div className="h-4 w-full rounded-full bg-white/5 overflow-hidden flex mb-6">
                    {(Object.entries(stats.byType) as [MediaType, number][]).map(([type, count]) => {
                        if (count === 0) return null;
                        const width = (count / total) * 100;
                        return (
                            <div
                                key={type}
                                style={{ width: `${width}%`, backgroundColor: TYPE_COLORS[type] || 'gray' }}
                                className="h-full transition-all duration-1000"
                                title={`${TYPE_LABELS[type]}: ${count}`}
                            />
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(Object.entries(stats.byType) as [MediaType, number][]).map(([type, count]) => (
                        <div key={type} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: TYPE_COLORS[type] || 'gray' }}
                            />
                            <span className="text-sm text-[var(--text-secondary)]">{TYPE_LABELS[type]}</span>
                            <span className="text-sm font-medium text-white ml-auto">{count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </FadeIn>
    );
}
