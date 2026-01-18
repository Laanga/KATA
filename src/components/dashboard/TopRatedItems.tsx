'use client';

import { FadeIn } from "@/components/FadeIn";
import { useMediaStore } from "@/lib/store";
import { getTopRatedItems } from "@/lib/utils/analytics";
import { Star, BookOpen, Gamepad2, Film, Tv } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TYPE_ICONS_COMPONENT = {
  BOOK: BookOpen,
  GAME: Gamepad2,
  MOVIE: Film,
  SERIES: Tv,
};

export function TopRatedItems() {
  const items = useMediaStore((state) => state.items);
  const router = useRouter();
  const topRated = getTopRatedItems(items, 5);

  if (topRated.length === 0) {
    return (
      <FadeIn delay={0.2}>
        <div className="bg-[var(--bg-secondary)] border border-white/5 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Top Valorados</h3>
          <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
            No hay items con rating alto (≥4)
          </p>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn delay={0.2}>
      <div className="group bg-[var(--bg-secondary)] border border-white/5 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
        <div className="p-6 border-b border-white/5 relative z-10">
          <h3 className="text-lg font-semibold">Top Valorados</h3>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Tus items mejor puntuados
          </p>
        </div>
        <div className="relative z-10">
          {topRated.map((item, index) => {
            const Icon = TYPE_ICONS_COMPONENT[item.type];
            return (
              <FadeIn key={item.id} delay={index * 0.05}>
                <button
                  onClick={() => router.push(`/library?item=${item.id}`)}
                  className="w-full group/item flex items-center gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/5 hover:bg-gradient-to-r hover:from-emerald-500/5 hover:to-transparent transition-all duration-300 text-left relative overflow-hidden"
                >
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-emerald-500/0 group-hover/item:bg-emerald-500/5 transition-all duration-300" />
                  {/* Cover */}
                  <div className="relative h-16 w-12 flex-shrink-0 rounded overflow-hidden bg-white/5 z-10">
                    {item.coverUrl ? (
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="h-full w-full object-cover group-hover/item:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Icon size={20} className="text-[var(--text-tertiary)]" />
                      </div>
                    )}
                    {/* Rank badge */}
                    <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-emerald-500 text-black text-xs font-bold flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-transform">
                      {index + 1}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 z-10">
                    <h4 className="font-medium text-white truncate mb-1">{item.title}</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-emerald-400">
                        <Star size={14} fill="currentColor" />
                        <span className="text-sm font-semibold">{item.rating?.toFixed(1)}</span>
                      </div>
                      {item.author && (
                        <>
                          <span className="text-xs text-[var(--text-tertiary)]">•</span>
                          <span className="text-xs text-[var(--text-secondary)] truncate">
                            {item.author}
                          </span>
                        </>
                      )}
                      {item.platform && (
                        <>
                          <span className="text-xs text-[var(--text-tertiary)]">•</span>
                          <span className="text-xs text-[var(--text-secondary)] truncate">
                            {item.platform}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="text-[var(--text-tertiary)] group-hover/item:text-emerald-400 group-hover/item:translate-x-1 transition-all duration-300 z-10">
                    →
                  </div>
                </button>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </FadeIn>
  );
}
