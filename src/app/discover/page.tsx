'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { FadeIn } from '@/components/FadeIn';
import { useMediaStore } from '@/lib/store';
import { Film, Tv, BookOpen, Gamepad2, Sparkles, Clock, ChevronDown } from 'lucide-react';
import { MediaType } from '@/types/media';
import type { MediaItem } from '@/types/media';
import { DiscoverCard } from '@/components/media/DiscoverCard';
import { HorizontalScroll } from '@/components/ui/HorizontalScroll';
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

// Mapeo de géneros de TMDB (IDs numéricos) para películas y series
const TMDB_GENRE_IDS: Record<string, string> = Object.fromEntries(
  Object.entries(TMDB_GENRE_MAP).map(([k, v]) => [k, v.toString()])
);

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
  const [recsLastUpdate, setRecsLastUpdate] = useState<number | null>(null);

  // Cache para evitar llamadas repetidas
  const upcomingCache = useRef<Map<string, { data: any[]; genres: any[]; timestamp: number }>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos de cache
  
  // Ref para cancelar peticiones pendientes (debounce)
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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

  const getDayOfYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  const getTimeUntilMidnight = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatLastUpdate = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'hace menos de 1h';
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `hace ${days}d`;
  };

  const getCachedRecommendations = (type: MediaType) => {
    const key = `recommendations_${type}`;
    const cached = localStorage.getItem(key);
    
    if (!cached) return null;
    
    const { data, timestamp, daySeed } = JSON.parse(cached);
    const today = getDayOfYear();
    
    if (daySeed !== today) {
      return null;
    }
    
    return { data, timestamp };
  };

  const setCachedRecommendations = (type: MediaType, data: any[]) => {
    const key = `recommendations_${type}`;
    const cache = {
      data,
      timestamp: Date.now(),
      daySeed: getDayOfYear(),
    };
    localStorage.setItem(key, JSON.stringify(cache));
    setRecsLastUpdate(cache.timestamp);
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

  const addToWantList = async (item: any): Promise<void> => {
    const statusMap: Record<MediaType, MediaItem['status']> = {
      BOOK: 'WANT_TO_READ',
      GAME: 'WANT_TO_PLAY',
      MOVIE: 'WANT_TO_WATCH',
      SERIES: 'WANT_TO_WATCH',
    };

    const title = getItemTitle(item);
    
    if (isInLibrary(title)) {
      toast.error('Ya tienes este título en tu biblioteca');
      throw new Error('Already in library');
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

    try {
      await addItem(newItem);
      toast.success(`"${title}" añadido a tu lista`);
    } catch (error) {
      console.error('Error al añadir a lista:', error);
      toast.error('Error al añadir a la lista');
      throw error;
    }
  };

  const getUserFavoriteGenres = (): string[] => {
    // Para libros y juegos, ser más flexible con el rating mínimo
    const minRating = (selectedType === 'BOOK' || selectedType === 'GAME') ? 3 : 4;
    
    const typeItems = items.filter((item) => 
      item.type === selectedType && 
      item.rating && 
      item.rating >= minRating
    );
    
    if (typeItems.length === 0) {
      // Si no hay items con rating, usar todos los items del tipo que tengan géneros
      const allTypeItems = items.filter((item) => 
        item.type === selectedType && 
        item.genres && 
        item.genres.length > 0
      );
      
      if (allTypeItems.length === 0) return [];
      
      // Usar los géneros de todos los items
      const genreCounts = new Map<string, number>();
      allTypeItems.forEach((item) => {
        item.genres?.forEach((genre) => {
          genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
        });
      });
      
      return Array.from(genreCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre]) => genre);
    }

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

  // Resetear género cuando cambia el tipo
  useEffect(() => {
    setSelectedGenre('ALL');
  }, [selectedType]);

  // Generar clave de cache
  const getCacheKey = useCallback((type: MediaType, period: PeriodType, genre: GenreFilter) => {
    return `${type}-${period}-${genre}`;
  }, []);

  // Fetch de próximos lanzamientos con debounce y cache
  useEffect(() => {
    const cacheKey = getCacheKey(selectedType, selectedPeriod, selectedGenre);
    
    // Verificar si tenemos datos en cache válidos
    const cached = upcomingCache.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setUpcoming(cached.data);
      if (selectedGenre === 'ALL') {
        setAvailableGenres(cached.genres);
      }
      return;
    }

    // Cancelar timeout anterior si existe (debounce)
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Debounce: esperar 300ms antes de hacer la petición
    // Esto evita múltiples llamadas si el usuario cambia rápido de género
    fetchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      
      // Crear nuevo AbortController para esta petición
      abortControllerRef.current = new AbortController();
      
      try {
        const endpoint = typeEndpoints[selectedType];
        const genreParam = selectedGenre !== 'ALL' ? `&genre=${selectedGenre}` : '';
        const response = await fetch(
          `/api/upcoming/${endpoint}?period=${selectedPeriod}${genreParam}`,
          { signal: abortControllerRef.current.signal }
        );
        const data = await response.json();

        if (data.error) {
          setUpcoming([]);
          if (selectedGenre === 'ALL') {
            setAvailableGenres([]);
          }
          return;
        }

        const results = data.results || [];
        const genres = data.availableGenres || [];

        // Guardar en cache
        upcomingCache.current.set(cacheKey, {
          data: results,
          genres: genres,
          timestamp: Date.now(),
        });

        setUpcoming(results);
        if (selectedGenre === 'ALL') {
          setAvailableGenres(genres);
        }
      } catch (error: any) {
        // Ignorar errores de abort (son intencionales)
        if (error.name === 'AbortError') {
          return;
        }
        console.error('Error fetching upcoming:', error);
        setUpcoming([]);
        if (selectedGenre === 'ALL') {
          setAvailableGenres([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms de debounce

    // Cleanup: cancelar timeout y petición al desmontar o cambiar dependencias
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedPeriod, selectedType, selectedGenre, getCacheKey]);

  const fetchRecommendations = async () => {
    const favoriteGenres = getUserFavoriteGenres();
    
    if (favoriteGenres.length === 0) {
      setRecommendations([]);
      setRecsLastUpdate(null);
      return;
    }

    const daySeed = getDayOfYear();
    
    const cached = getCachedRecommendations(selectedType);
    if (cached) {
      setRecommendations(cached.data);
      setRecsLastUpdate(cached.timestamp);
      return;
    }

    setIsLoadingRecs(true);

    try {
      let genreValues: string;
      
      // Para películas y series, usar el mapeo de TMDB (IDs numéricos)
      if (selectedType === 'MOVIE' || selectedType === 'SERIES') {
        genreValues = favoriteGenres
          .map(genre => TMDB_GENRE_IDS[genre])
          .filter(Boolean)
          .join(',');
      } else {
        // Para libros y juegos, pasar los géneros directamente
        genreValues = favoriteGenres.join(',');
      }

      if (!genreValues) {
        setRecommendations([]);
        setRecsLastUpdate(null);
        return;
      }

      const excludeTitles = items
        .filter(i => i.type === selectedType)
        .map(i => i.title)
        .join(',');

      // Determinar el tipo para la API
      const typeMap: Record<MediaType, string> = {
        MOVIE: 'movie',
        SERIES: 'tv',
        GAME: 'game',
        BOOK: 'book',
      };

      const response = await fetch(
        `/api/recommendations?type=${typeMap[selectedType]}&genres=${encodeURIComponent(genreValues)}&exclude=${encodeURIComponent(excludeTitles)}&daySeed=${daySeed}`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        setRecommendations(data.results);
        setCachedRecommendations(selectedType, data.results);
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  useEffect(() => {
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
                      <HorizontalScroll>
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
                            isInLibrary={isInLibrary(getItemTitle(item))}
                          />
                        ))}
                      </HorizontalScroll>
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

                {/* Recomendaciones - Para todos los tipos */}
                <FadeIn direction="up" delay={0.3}>
                  <section className="mb-12">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-1 h-6 rounded-full bg-[var(--accent-primary)]" />
                        <Sparkles size={20} className="text-[var(--accent-primary)]" />
                        <h2 className="text-xl font-bold">Para ti</h2>
                        {recsLastUpdate && (
                          <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                            <Clock size={12} />
                            <span>
                              {formatLastUpdate(recsLastUpdate)} • Actualiza en {getTimeUntilMidnight()}
                            </span>
                          </div>
                        )}
                      </div>

                      {isLoadingRecs ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : recommendations.length > 0 ? (
                        <HorizontalScroll>
                          {recommendations.map((item, index) => (
                            <DiscoverCard
                              key={item.id || index}
                              item={item}
                              type={selectedType}
                              onAdd={() => addToWantList(item)}
                              getImage={getItemImage}
                              getTitle={getItemTitle}
                              rating={item.vote_average}
                              isInLibrary={isInLibrary(getItemTitle(item))}
                            />
                          ))}
                        </HorizontalScroll>
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
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
