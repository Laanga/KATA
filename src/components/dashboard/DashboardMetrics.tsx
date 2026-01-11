'use client';

import { FadeIn } from "@/components/FadeIn";
import { useMediaStore } from "@/lib/store";
import { Trophy, Star, Book, Clock } from "lucide-react";

export function DashboardMetrics() {
    const items = useMediaStore((state) => state.items);

    const totalItems = items.length;

    const completedStatus = ['COMPLETED', 'READ', 'FINISHED', 'WATCHED']; // Mapping standard 'COMPLETED'
    // Actually check the MediaStatus type in store. The Valid statuses are:
    // WANT_TO_READ, READING, COMPLETED, DROPPED (Book)
    // WANT_TO_PLAY, PLAYING, COMPLETED, DROPPED (Game)
    // WANT_TO_WATCH, WATCHING, COMPLETED, DROPPED (Movie/Series)

    const completedItems = items.filter(i => i.status === 'COMPLETED').length;
    const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // Calculate average rating of rated items
    const ratedItems = items.filter(i => i.rating !== null);
    const avgRating = ratedItems.length > 0
        ? (ratedItems.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedItems.length).toFixed(1)
        : 'N/A';

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
                label="Total Items"
                value={totalItems.toString()}
                icon={<Book size={20} />}
                delay={0}
            />
            <MetricCard
                label="Completed"
                value={`${completedItems} (${completionRate}%)`}
                icon={<Trophy size={20} />}
                delay={0.1}
            />
            <MetricCard
                label="Avg Rating"
                value={avgRating}
                icon={<Star size={20} />}
                delay={0.2}
            />
            <MetricCard
                label="Streak"
                value="3 Days"
                subtext="(Mock)"
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
