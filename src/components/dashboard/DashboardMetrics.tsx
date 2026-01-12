'use client';

import { FadeIn } from "@/components/FadeIn";
import { useMediaStore } from "@/lib/store";
import { Trophy, Star, Book, Clock } from "lucide-react";

export function DashboardMetrics() {
    const items = useMediaStore((state) => state.items);

    const totalItems = items.length;

    const completedItems = items.filter(i => i.status === 'COMPLETED').length;
    const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // Calculate average rating of rated items (0-5 scale)
    const ratedItems = items.filter(i => i.rating !== null);
    const avgRating = ratedItems.length > 0
        ? (ratedItems.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedItems.length).toFixed(1)
        : 'N/A';

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
                label="Total de Elementos"
                value={totalItems.toString()}
                icon={<Book size={20} />}
                delay={0}
            />
            <MetricCard
                label="Completados"
                value={`${completedItems} (${completionRate}%)`}
                icon={<Trophy size={20} />}
                delay={0.1}
            />
            <MetricCard
                label="Puntuación Media"
                value={avgRating}
                icon={<Star size={20} />}
                delay={0.2}
            />
            <MetricCard
                label="Racha"
                value="3 Días"
                subtext="(Simulado)"
                icon={<Clock size={20} />}
                delay={0.3}
            />
        </div>
    );
}

function MetricCard({ label, value, icon, subtext, delay }: { label: string; value: string; icon: React.ReactNode; subtext?: string, delay: number }) {
    return (
        <FadeIn delay={delay}>
            <div className="bg-[var(--bg-secondary)] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3 text-[var(--text-secondary)] mb-2">
                    <div className="p-2 bg-white/5 rounded-lg text-[var(--accent-primary)]">
                        {icon}
                    </div>
                    <span className="text-sm font-medium">{label}</span>
                </div>
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-white">{value}</span>
                    {subtext && <span className="text-xs text-[var(--text-tertiary)] mb-1">{subtext}</span>}
                </div>
            </div>
        </FadeIn>
    );
}
