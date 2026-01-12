'use client';

import { useState, useEffect, useRef } from 'react';
import { useMediaStore } from '@/lib/store';
import { MediaItem } from '@/types/media';
import { Search, X, BookOpen, Gamepad2, Film, Tv, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const typeIcons = {
  BOOK: BookOpen,
  GAME: Gamepad2,
  MOVIE: Film,
  SERIES: Tv,
};

const typeLabels = {
  BOOK: 'Libro',
  GAME: 'Videojuego',
  MOVIE: 'Película',
  SERIES: 'Serie',
};

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const items = useMediaStore((state) => state.items);

  // Búsqueda simple sin dependencias externas
  const searchResults = query.trim()
    ? items.filter(item => {
        const searchTerm = query.toLowerCase();
        return (
          item.title.toLowerCase().includes(searchTerm) ||
          item.author?.toLowerCase().includes(searchTerm) ||
          item.platform?.toLowerCase().includes(searchTerm) ||
          item.genres?.some(genre => genre.toLowerCase().includes(searchTerm))
        );
      })
    : items.slice(0, 8); // Mostrar últimos 8 si no hay búsqueda

  // Limitar a 8 resultados
  const limitedResults = searchResults.slice(0, 8);

  // Abrir input cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Manejar teclas básicas (solo Escape para cerrar)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelectItem = (item: MediaItem) => {
    router.push(`/library?item=${item.id}`);
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Search Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4 pointer-events-none">
        <div
          className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-white/10">
            <Search size={20} className="text-[var(--text-tertiary)] flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Buscar en tu biblioteca..."
              className="flex-1 bg-transparent text-white placeholder-[var(--text-tertiary)] outline-none text-lg"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="text-[var(--text-tertiary)] hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {limitedResults.length > 0 ? (
              <div className="p-2">
                {limitedResults.map((item, index) => {
                  const Icon = typeIcons[item.type];
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-emerald-500/20 border border-emerald-500/30'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      {/* Cover */}
                      <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-white/5">
                        {item.coverUrl ? (
                          <img
                            src={item.coverUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon size={20} className="text-[var(--text-tertiary)]" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-white truncate">{item.title}</h3>
                          {item.rating && (
                            <span className="text-xs text-[var(--text-tertiary)]">
                              ⭐ {item.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                          <Icon size={12} />
                          <span>{typeLabels[item.type]}</span>
                          {item.author && (
                            <>
                              <span>•</span>
                              <span>{item.author}</span>
                            </>
                          )}
                          {item.platform && (
                            <>
                              <span>•</span>
                              <span>{item.platform}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <ArrowRight
                        size={16}
                        className={`text-[var(--text-tertiary)] flex-shrink-0 ${
                          isSelected ? 'text-emerald-400' : ''
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                  <Search size={24} className="text-[var(--text-tertiary)]" />
                </div>
                <p className="text-[var(--text-secondary)] mb-1">No se encontraron resultados</p>
                <p className="text-sm text-[var(--text-tertiary)]">
                  Intenta con otro término de búsqueda
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-white/10 bg-black/30">
            <div className="flex items-center justify-end text-xs text-[var(--text-tertiary)]">
              {limitedResults.length > 0 && (
                <span>{limitedResults.length} resultado{limitedResults.length !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
