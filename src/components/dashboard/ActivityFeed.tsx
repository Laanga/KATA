'use client';

import { FadeIn } from "@/components/FadeIn";
import { useMediaStore } from "@/lib/store";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/utils/constants";
import { Star } from "lucide-react";

export function ActivityFeed() {
  const items = useMediaStore((state) => state.items);
  // Sort by createdAt desc
  const recentItems = [...items]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    if (recentItems.length === 0) return null;

  return (
    <div className="group bg-[var(--bg-secondary)] border border-white/5 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] relative">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
      <div className="p-6 border-b border-white/5 relative z-10">
        <h3 className="text-lg font-semibold">Actividad Reciente</h3>
      </div>
      <div className="relative z-10">
        {recentItems.map((item, index) => (
          <FadeIn key={item.id} delay={index * 0.05}>
            <div className="group/item flex items-center gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/5 hover:bg-gradient-to-r hover:from-emerald-500/5 hover:to-transparent transition-all duration-300 cursor-pointer relative overflow-hidden">
              {/* Hover glow */}
              <div className="absolute inset-0 bg-emerald-500/0 group-hover/item:bg-emerald-500/5 transition-all duration-300" />
              {/* Cover / Icon */}
              <div className="h-12 w-8 flex-shrink-0 bg-black/20 rounded overflow-hidden z-10">
                {item.coverUrl ? (
                  <img 
                    src={item.coverUrl} 
                    alt={item.title} 
                    className="h-full w-full object-cover group-hover/item:scale-110 transition-transform duration-300" 
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs">?</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 z-10">
                                <div className="mb-0.5">
                                    <span className="text-sm font-medium text-white truncate">{item.title}</span>
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
