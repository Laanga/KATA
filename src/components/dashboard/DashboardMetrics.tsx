'use client';

import { FadeIn } from "@/components/FadeIn";
import { useMediaStore } from "@/lib/store";
import { Trophy, Star, Book, Calendar } from "lucide-react";
import { useMemo } from 'react';

export function DashboardMetrics() {
    const items = useMediaStore((state) => state.items);

    const metrics = useMemo(() => {
        const totalItems = items.length;
        const completedItems = items.filter(i => i.status === 'COMPLETED').length;
        const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        // Calculate average rating
        const ratedItems = items.filter(i => i.rating !== null);
        const avgRating = ratedItems.length > 0
            ? (ratedItems.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedItems.length).toFixed(1)
            : 'N/A';

        // Items agregados este mes
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const itemsThisMonth = items.filter(item => {
            const itemDate = new Date(item.createdAt);
            return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
        }).length;

        // Completados este mes
        const completedThisMonth = items.filter(item => {
            if (item.status !== 'COMPLETED' || !item.updatedAt) return false;
            const completedDate = new Date(item.updatedAt);
            return completedDate.getMonth() === currentMonth && completedDate.getFullYear() === currentYear;
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
                delay={0}
            />
            <MetricCard
                label="Completados"
                value={`${metrics.completedItems} (${metrics.completionRate}%)`}
                icon={<Trophy size={20} />}
                delay={0.1}
            />
            <MetricCard
                label="Puntuación Media"
                value={metrics.avgRating}
                icon={<Star size={20} />}
                delay={0.2}
            />
            <MetricCard
                label="Este Mes"
                value={`+${metrics.itemsThisMonth}`}
                subtext={`${metrics.completedThisMonth} completados`}
                icon={<Calendar size={20} />}
                delay={0.3}
            />
        </div>
    );
}

function MetricCard({ label, value, icon, subtext, delay }: { label: string; value: string; icon: React.ReactNode; subtext?: string, delay: number }) {
    return (
        <FadeIn delay={delay}>
            <div className="bg-[var(--bg-secondary)] border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-2 sm:gap-3 text-[var(--text-secondary)] mb-1.5 sm:mb-2">
                    <div className="p-1.5 sm:p-2 bg-white/5 rounded-lg text-[var(--accent-primary)] flex-shrink-0">
                        {icon}
                    </div>
                    <span className="text-xs sm:text-sm font-medium line-clamp-1">{label}</span>
                </div>
                <div className="flex items-end gap-1.5 sm:gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-white">{value}</span>
                    {subtext && <span className="text-xs text-[var(--text-tertiary)] mb-0.5 sm:mb-1 hidden sm:inline">{subtext}</span>}
                </div>
            </div>
        </FadeIn>
    );
}
