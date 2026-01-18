'use client';

import { useState } from 'react';
import { Navbar } from "@/components/layout/Navbar";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { MediaSearchSection } from "@/components/media/MediaSearchSection";
import { FadeIn } from "@/components/FadeIn";
import { BookOpen, Gamepad2, Film, Tv, Search } from 'lucide-react';
import { MediaType } from '@/types/media';

const tabs = [
  { id: 'BOOK' as MediaType, label: 'Libros', icon: BookOpen, color: 'text-[var(--color-book)]' },
  { id: 'GAME' as MediaType, label: 'Juegos', icon: Gamepad2, color: 'text-[var(--color-game)]' },
  { id: 'MOVIE' as MediaType, label: 'Películas', icon: Film, color: 'text-[var(--color-movie)]' },
  { id: 'SERIES' as MediaType, label: 'Series', icon: Tv, color: 'text-[var(--color-series)]' },
];

const descriptions: Record<MediaType, string> = {
  BOOK: 'Explora millones de libros. Powered by Google Books.',
  GAME: 'Busca juegos de todas las plataformas. Powered by IGDB.',
  MOVIE: 'Descubre películas populares y tendencias. Powered by TMDB.',
  SERIES: 'Encuentra tus series favoritas. Powered by TMDB.',
};

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState<MediaType>('BOOK');

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <Navbar />
      <BottomNavigation />

      <main className="container mx-auto px-4 pt-20 md:pt-24 max-w-7xl">
        <FadeIn direction="up" delay={0.1}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--accent-primary)]/10 mb-4">
              <Search size={32} className="text-[var(--accent-primary)]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Buscar Contenido
            </h1>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base">
              Explora millones de libros, juegos, películas y series
            </p>
          </div>

          {/* Tabs Navigation */}
          <div className="mb-8">
            <div className="flex overflow-x-auto gap-2 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:justify-center md:flex-wrap md:overflow-visible no-scrollbar scroll-smooth">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 whitespace-nowrap
                      ${isActive
                        ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-black font-semibold scale-105 shadow-lg shadow-[var(--accent-primary)]/20'
                        : 'bg-transparent border-white/10 text-[var(--text-secondary)] hover:bg-white/5 hover:border-white/20'
                      }
                    `}
                  >
                    <Icon size={18} className={isActive ? '' : 'opacity-60'} />
                    <span className="text-sm sm:text-base">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tab Content */}
          <FadeIn key={activeTab} direction="up" delay={0.2}>
            <MediaSearchSection
              type={activeTab}
              title={tabs.find(t => t.id === activeTab)?.label || ''}
              description={descriptions[activeTab]}
            />
          </FadeIn>
        </FadeIn>
      </main>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
