'use client';

import { FadeIn } from "@/components/FadeIn";
import { useMediaStore } from "@/lib/store";
import { TYPE_ICONS, STATUS_LABELS, STATUS_COLORS } from "@/lib/utils/constants";
import { Star } from "lucide-react";

export function ActivityFeed() {
    const items = useMediaStore((state) => state.items);
    // Sort by createdAt desc
    const recentItems = [...items]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

    if (recentItems.length === 0) return null;

    return (
        <div className="bg-[var(--bg-secondary)] border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
                <h3 className="text-lg font-semibold">Actividad Reciente</h3>
            </div>
            <div>
                {recentItems.map((item, index) => (
                    <FadeIn key={item.id} delay={index * 0.05}>
                        <div className="group flex items-center gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                            {/* Cover / Icon */}
                            <div className="h-12 w-8 flex-shrink-0 bg-black/20 rounded overflow-hidden">
                                {item.coverUrl ? (
                                    <img src={item.coverUrl} alt={item.title} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-xs">?</div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-sm font-medium text-white truncate">{item.title}</span>
                                    <span className="text-xs text-[var(--text-tertiary)]" title={item.type}>
                                        {TYPE_ICONS[item.type]}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                                    <span className="flex items-center gap-1.5">
                                        <span
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ backgroundColor: STATUS_COLORS[item.status] }}
                                        />
                                        {STATUS_LABELS[item.status]}
                                    </span>
                                    <span>•</span>
                                    <span>{new Date(item.createdAt).toLocaleDateString('es-ES')}</span>
                                </div>
                            </div>

                            {/* Rating/Action */}
                            {item.rating && (
                                <div className="flex items-center gap-1 text-[var(--accent-warning)] text-sm font-medium">
                                    <Star size={14} fill="currentColor" />
                                    <span>{item.rating}</span>
                                </div>
                            )}
                        </div>
                    </FadeIn>
                ))}
            </div>
        </div>
    );
}
