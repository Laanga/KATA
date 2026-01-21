'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { FadeIn } from '@/components/FadeIn';
import { useMediaStore } from '@/lib/store';
import { Film, Tv, BookOpen, Gamepad2, Sparkles, Clock, ChevronDown } from 'lucide-react';
import { MediaType } from '@/types/media';
import type { MediaItem } from '@/types/media';
import { DiscoverCard } from '@/components/media/DiscoverCard';
import { toast } from 'react-hot-toast';

type PeriodType = 'week' | 'month' | 'quarter';
type GenreFilter = string | 'ALL';

const TMDB_GENRE_MAP: Record<string, number> = {
  'Acción': 28,
  'Aventura': 12,
  'Animación': 16,
  'Comedia': 35,
  'Crimen': 80,
  'Documental': 99,
  'Drama': 18,
  'Familia': 10751,
  'Fantasía': 14,
  'Historia': 36,
  'Terror': 27,
  'Música': 10402,
  'Misterio': 9648,
  'Romance': 10749,
  'Ciencia ficción': 878,
  'Thriller': 53,
  'Bélica': 10752,
  'Western': 37,
};

const TYPE_COLORS: Record<MediaType, string> = {
  MOVIE: 'var(--color-movie)',
  SERIES: 'var(--color-series)',
  BOOK: 'var(--color-book)',
  GAME: 'var(--color-game)',
};

export default function DiscoverPage() {
  const items = useMediaStore((state) => state.items);
  const addItem = useMediaStore((state) => state.addItem);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  const [selectedGenre, setSelectedGenre] = useState<GenreFilter>('ALL');
  const [selectedType, setSelectedType] = useState<MediaType>('MOVIE');
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [availableGenres, setAvailableGenres] = useState<{ id: string | number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  const periods = [
    { value: 'week', label: '7 días', shortLabel: '7d' },
    { value: 'month', label: '30 días', shortLabel: '30d' },
    { value: 'quarter', label: '90 días', shortLabel: '90d' },
  ];

  const typeConfig: Record<MediaType, { label: string; icon: React.ReactNode }> = {
    MOVIE: { label: 'Películas', icon: <Film size={18} /> },
    SERIES: { label: 'Series', icon: <Tv size={18} /> },
    BOOK: { label: 'Libros', icon: <BookOpen size={18} /> },
    GAME: { label: 'Juegos', icon: <Gamepad2 size={18} /> },
  };

  const typeEndpoints: Record<MediaType, string> = {
    MOVIE: 'movies',
    SERIES: 'series',
    BOOK: 'books',
    GAME: 'games',
  };

  // Formatear fecha exacta
  const formatExactDate = (item: any): string => {
    if (item.first_release_date && typeof item.first_release_date === 'number') {
      const date = new Date(item.first_release_date * 1000);
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    if (item.release_date || item.first_air_date) {
      const dateStr = item.release_date || item.first_air_date;
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    if (item.volumeInfo?.publishedDate) {
      const dateStr = item.volumeInfo.publishedDate;
      if (dateStr.length === 4) return dateStr;
      if (dateStr.length === 7) {
        const [year, month] = dateStr.split('-');
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
      }
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    
    return 'Por confirmar';
  };

  const getItemImage = (item: any): string => {
    if (item.poster_path) {
      return `https://image.tmdb.org/t/p/w500${item.poster_path}`;
    }
    if (item.cover?.url) {
      let url = item.cover.url;
      if (url.startsWith('//')) url = 'https:' + url;
      return url.replace('t_thumb', 't_cover_big');
    }
    if (item.cover && typeof item.cover === 'string') {
      return item.cover;
    }
    if (item.volumeInfo?.imageLinks?.thumbnail) {
      let url = item.volumeInfo.imageLinks.thumbnail.replace('http:', 'https:');
      if (url.includes('openlibrary.org')) url = url.replace('-M.jpg', '-L.jpg');
      return url;
    }
    if (item.volumeInfo?.imageLinks?.smallThumbnail) {
      return item.volumeInfo.imageLinks.smallThumbnail.replace('http:', 'https:');
    }
    return '/placeholder-cover.jpg';
  };

  const getItemTitle = (item: any): string => {
    return item.title || item.name || item.volumeInfo?.title || 'Sin título';
  };

  const isInLibrary = (title: string): boolean => {
    return items.some((i) => i.title.toLowerCase() === title.toLowerCase());
  };

  const getFilteredUpcoming = (): any[] => {
    return upcoming
      .filter((item: any) => !isInLibrary(getItemTitle(item)))
      .filter((item: any) => {
        if (selectedGenre === 'ALL') return true;
        const itemGenres = item.genre_ids || item.volumeInfo?.categories || item.genres?.map((g: any) => g.id || g.name) || [];
        return itemGenres.some((g: any) => String(g) === String(selectedGenre));
      })
      .sort((a: any, b: any) => {
        const getTimestamp = (item: any): number => {
          if (item.first_release_date && typeof item.first_release_date === 'number') {
            return item.first_release_date * 1000;
          }
          if (item.release_date) return new Date(item.release_date).getTime();
          if (item.first_air_date) return new Date(item.first_air_date).getTime();
          if (item.volumeInfo?.publishedDate) return new Date(item.volumeInfo.publishedDate).getTime();
          return Infinity;
        };
        return getTimestamp(a) - getTimestamp(b);
      });
  };

  const addToWantList = async (item: any) => {
    try {
      const statusMap: Record<MediaType, MediaItem['status']> = {
        BOOK: 'WANT_TO_READ',
        GAME: 'WANT_TO_PLAY',
        MOVIE: 'WANT_TO_WATCH',
        SERIES: 'WANT_TO_WATCH',
      };

      const title = getItemTitle(item);
      
      if (isInLibrary(title)) {
        toast.error('Ya tienes este título en tu biblioteca');
        return;
      }

      const genres = item.genre_ids?.map((id: number) => {
        const genre = availableGenres.find(g => Number(g.id) === id);
        return genre?.name || '';
      }).filter(Boolean) || item.volumeInfo?.categories || item.genres?.map((g: any) => g.name) || [];

      const newItem: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'> = {
        type: selectedType,
        title,
        coverUrl: getItemImage(item),
        status: statusMap[selectedType],
        rating: null,
        review: undefined,
        genres,
      };

      await addItem(newItem);
      toast.success(`"${title}" añadido a tu lista`);
    } catch (error) {
      console.error('Error al añadir a lista:', error);
      toast.error('Error al añadir a la lista');
    }
  };

  const getUserFavoriteGenres = (): string[] => {
    const typeItems = items.filter((item) => item.type === selectedType && item.rating && item.rating >= 4);
    if (typeItems.length === 0) return [];

    const genreCounts = new Map<string, number>();
    typeItems.forEach((item) => {
      if (item.genres) {
        item.genres.forEach((genre) => {
          genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
        });
      }
    });

    return Array.from(genreCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);
  };

  useEffect(() => {
    const fetchUpcoming = async () => {
      setIsLoading(true);
      setSelectedGenre('ALL');
      
      try {
        const endpoint = typeEndpoints[selectedType];
        const response = await fetch(`/api/upcoming/${endpoint}?period=${selectedPeriod}`);
        const data = await response.json();

        if (data.error) {
          setUpcoming([]);
          setAvailableGenres([]);
          return;
        }

        setUpcoming(data.results || []);
        setAvailableGenres(data.availableGenres || []);
      } catch (error) {
        setUpcoming([]);
        setAvailableGenres([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcoming();
  }, [selectedPeriod, selectedType]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (selectedType !== 'MOVIE' && selectedType !== 'SERIES') {
        setRecommendations([]);
        return;
      }

      const favoriteGenres = getUserFavoriteGenres();
      if (favoriteGenres.length === 0) {
        setRecommendations([]);
        return;
      }

      setIsLoadingRecs(true);

      try {
        const genreIds = favoriteGenres
          .map(genre => TMDB_GENRE_MAP[genre])
          .filter(Boolean)
          .join(',');

        if (!genreIds) {
          setRecommendations([]);
          return;
        }

        const excludeTitles = items
          .filter(i => i.type === selectedType)
          .map(i => i.title)
          .join(',');

        const type = selectedType === 'SERIES' ? 'tv' : 'movie';
        const response = await fetch(
          `/api/recommendations?type=${type}&genres=${genreIds}&exclude=${encodeURIComponent(excludeTitles)}`
        );
        const data = await response.json();
        setRecommendations(data.results || []);
      } catch (error) {
        setRecommendations([]);
      } finally {
        setIsLoadingRecs(false);
      }
    };

    fetchRecommendations();
  }, [selectedType, items]);

  return (
    <>
      <div className="min-h-screen pb-24 md:pb-0">
        <Navbar />
        
        <main className="container mx-auto px-4 pt-24 sm:pt-28">
          {/* Header */}
          <FadeIn direction="up" delay={0.1}>
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Descubrir</h1>
              <p className="text-[var(--text-secondary)]">
                Próximos lanzamientos y recomendaciones personalizadas
              </p>
            </div>
          </FadeIn>

          {/* Filtros - Sticky */}
          <div className="sticky top-14 sm:top-16 z-40 -mx-4 px-4 py-4 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-white/5">
            <div className="flex flex-col gap-4">
              {/* Tipo - Tabs principales */}
              <div className="flex gap-1 p-1 bg-[var(--bg-secondary)] rounded-xl w-fit">
                {(['MOVIE', 'SERIES', 'BOOK', 'GAME'] as MediaType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`
                      relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${selectedType === type 
                        ? 'text-white shadow-lg' 
                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                      }
                    `}
                    style={{
                      backgroundColor: selectedType === type ? TYPE_COLORS[type] : 'transparent',
                    }}
                  >
                    {typeConfig[type].icon}
                    <span className="hidden sm:inline">{typeConfig[type].label}</span>
                  </button>
                ))}
              </div>

              {/* Fila de filtros secundarios */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Período */}
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[var(--text-tertiary)]" />
                  <div className="flex gap-1 p-0.5 bg-[var(--bg-secondary)] rounded-lg">
                    {periods.map((period) => (
                      <button
                        key={period.value}
                        onClick={() => setSelectedPeriod(period.value as PeriodType)}
                        className={`
                          px-3 py-1.5 rounded-md text-xs font-medium transition-all
                          ${selectedPeriod === period.value
                            ? 'bg-white/10 text-white'
                            : 'text-[var(--text-tertiary)] hover:text-white'
                          }
                        `}
                      >
                        <span className="sm:hidden">{period.shortLabel}</span>
                        <span className="hidden sm:inline">{period.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Género - Select estilizado */}
                {availableGenres.length > 0 && (
                  <div className="relative">
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="
                        h-8 appearance-none rounded-lg border border-white/10 bg-[var(--bg-secondary)] 
                        pl-3 pr-8 text-xs text-[var(--text-primary)] transition-all
                        hover:border-white/20 focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]
                        cursor-pointer
                      "
                    >
                      <option value="ALL">Todos los géneros</option>
                      {availableGenres.map((genre) => (
                        <option key={genre.id} value={genre.id}>{genre.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                  </div>
                )}

                {/* Indicador de resultados */}
                {!isLoading && (
                  <span className="text-xs text-[var(--text-tertiary)] ml-auto">
                    {getFilteredUpcoming().length} resultados
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="mt-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div 
                    className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: TYPE_COLORS[selectedType], borderTopColor: 'transparent' }}
                  />
                  <p className="text-[var(--text-tertiary)] text-sm">
                    Buscando {typeConfig[selectedType].label.toLowerCase()}...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Próximos lanzamientos */}
                <FadeIn direction="up" delay={0.2}>
                  <section className="mb-12">
                    <div className="flex items-center gap-3 mb-5">
                      <div 
                        className="w-1 h-6 rounded-full"
                        style={{ backgroundColor: TYPE_COLORS[selectedType] }}
                      />
                      <h2 className="text-xl font-bold">Próximos lanzamientos</h2>
                    </div>

                    {getFilteredUpcoming().length > 0 ? (
                      <div className="relative -mx-4 px-4">
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                          {getFilteredUpcoming().map((item, index) => (
                            <DiscoverCard
                              key={item.id || index}
                              item={item}
                              type={selectedType}
                              onAdd={() => addToWantList(item)}
                              getImage={getItemImage}
                              getTitle={getItemTitle}
                              releaseDate={formatExactDate(item)}
                              rating={item.vote_average}
                            />
                          ))}
                        </div>
                        <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-[var(--bg-primary)] to-transparent pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-[var(--bg-primary)] to-transparent pointer-events-none" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-white/5 bg-[var(--bg-secondary)]/50">
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                          style={{ backgroundColor: `${TYPE_COLORS[selectedType]}20` }}
                        >
                          {typeConfig[selectedType].icon}
                        </div>
                        <p className="text-[var(--text-secondary)] font-medium">
                          Sin lanzamientos próximos
                        </p>
                        <p className="text-sm text-[var(--text-tertiary)] mt-1">
                          Prueba con otro período o tipo de contenido
                        </p>
                      </div>
                    )}
                  </section>
                </FadeIn>

                {/* Recomendaciones */}
                {(selectedType === 'MOVIE' || selectedType === 'SERIES') && (
                  <FadeIn direction="up" delay={0.3}>
                    <section className="mb-12">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-1 h-6 rounded-full bg-[var(--accent-primary)]" />
                        <Sparkles size={20} className="text-[var(--accent-primary)]" />
                        <h2 className="text-xl font-bold">Para ti</h2>
                      </div>

                      {isLoadingRecs ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : recommendations.length > 0 ? (
                        <div className="relative -mx-4 px-4">
                          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {recommendations.map((item, index) => (
                              <DiscoverCard
                                key={item.id || index}
                                item={item}
                                type={selectedType}
                                onAdd={() => addToWantList(item)}
                                getImage={getItemImage}
                                getTitle={getItemTitle}
                                rating={item.vote_average}
                              />
                            ))}
                          </div>
                          <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-[var(--bg-primary)] to-transparent pointer-events-none" />
                          <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-[var(--bg-primary)] to-transparent pointer-events-none" />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-white/5 bg-[var(--bg-secondary)]/50">
                          <div className="w-16 h-16 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center mb-4">
                            <Sparkles size={24} className="text-[var(--accent-primary)]" />
                          </div>
                          <p className="text-[var(--text-secondary)] font-medium">
                            Personaliza tus recomendaciones
                          </p>
                          <p className="text-sm text-[var(--text-tertiary)] mt-1 text-center max-w-xs">
                            Añade {typeConfig[selectedType].label.toLowerCase()} a tu biblioteca y califícalas para recibir sugerencias
                          </p>
                        </div>
                      )}
                    </section>
                  </FadeIn>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
