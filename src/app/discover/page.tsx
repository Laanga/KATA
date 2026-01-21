'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { FadeIn } from '@/components/FadeIn';
import { useMediaStore } from '@/lib/store';
import { Calendar, Film, Tv, BookOpen, Gamepad2 } from 'lucide-react';
import { MediaType } from '@/types/media';
import type { MediaItem } from '@/types/media';
import { Button } from '@/components/ui/Button';

type PeriodType = 'week' | 'month' | 'quarter';
type GenreFilter = string | 'ALL';

export default function DiscoverPage() {
  const items = useMediaStore((state) => state.items);
  const updateItem = useMediaStore((state) => state.updateItem);
  const addItem = useMediaStore((state) => state.addItem);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  const [selectedGenre, setSelectedGenre] = useState<GenreFilter>('ALL');
  const [selectedType, setSelectedType] = useState<MediaType>('MOVIE');
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [availableGenres, setAvailableGenres] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const periods = [
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
    { value: 'quarter', label: 'Este trimestre' },
  ];

  const typeLabels: Record<MediaType, string> = {
    BOOK: 'Libros',
    GAME: 'Juegos',
    MOVIE: 'Películas',
    SERIES: 'Series',
  };

  const typeIcons: Record<MediaType, React.ReactNode> = {
    BOOK: <BookOpen size={20} />,
    GAME: <Gamepad2 size={20} />,
    MOVIE: <Film size={20} />,
    SERIES: <Tv size={20} />,
  };

  const getActionButtonText = (type: MediaType): string => {
    switch (type) {
      case 'BOOK':
        return 'Añadir a Quiero leer';
      case 'GAME':
        return 'Añadir a Quiero jugar';
      case 'MOVIE':
      case 'SERIES':
      default:
        return 'Añadir a Quiero ver';
    }
  };

  const getDisplayDate = (item: any): string => {
    const date = item.release_date || item.first_air_date || item.publishedDate || '';
    
    if (!date) return '';
    
    const releaseDate = new Date(date);
    const now = new Date();
    const diffDays = Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays < 7) return `En ${diffDays} días`;
    if (diffDays < 30) return `En ${Math.ceil(diffDays / 7)} semanas`;
    return releaseDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getFilteredUpcoming = (): any[] => {
    return upcoming
      .filter((item: any) => {
        const title = item.title || item.volumeInfo?.title || '';
        const hasInLibrary = items.some((libraryItem) => 
          libraryItem.title.toLowerCase() === title.toLowerCase()
        );
        return !hasInLibrary;
      })
      .filter((item: any) => {
        if (selectedGenre === 'ALL') return true;
        
        const itemGenres = item.genre_ids || item.volumeInfo?.categories || item.genres?.map((g: any) => g.name) || [];
        return itemGenres.includes(selectedGenre);
      })
      .slice(0, 10);
  };

  const getRecommended = (): MediaItem[] => {
    const typeItems = items.filter((item: MediaItem) => item.type === selectedType && item.rating && item.rating >= 4);
    
    if (typeItems.length === 0) return [];

    const genreCounts = new Map<string, number>();
    typeItems.forEach((item) => {
      if (item.genres) {
        item.genres.forEach((genre) => {
          genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
        });
      }
    });

    const topGenres = Array.from(genreCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);

    const recommended = items
      .filter((item: MediaItem) => {
        if (item.type !== selectedType) return false;
        
        const hasInLibrary = items.some((libraryItem: MediaItem) => libraryItem.id === item.id);
        if (hasInLibrary) return false;

        if (item.genres?.some((g: string) => topGenres.includes(g))) {
          return true;
        }
        return false;
      })
      .slice(0, 5)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return recommended;
  };

  const addToWantList = async (item: any) => {
    try {
      const statusMap: Record< MediaType, MediaItem['status']> = {
        BOOK: 'WANT_TO_READ',
        GAME: 'WANT_TO_PLAY',
        MOVIE: 'WANT_TO_WATCH',
        SERIES: 'WANT_TO_WATCH',
      };

      const title = item.title || item.volumeInfo?.title || '';
      const hasInLibrary = items.some((i: MediaItem) => i.title.toLowerCase() === title.toLowerCase());

      if (hasInLibrary) {
        const existingItem = items.find((i: MediaItem) => i.title.toLowerCase() === title.toLowerCase());
        if (existingItem) {
          await updateItem(existingItem.id, { status: statusMap[selectedType] });
        }
      } else {
        const genres = item.genre_ids || item.volumeInfo?.categories || item.genres?.map((g: any) => g.name) || [];

        const newItem: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'> = {
          type: selectedType,
          title,
          coverUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
            : item.cover?.url 
            || item.volumeInfo?.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
          status: statusMap[selectedType],
          rating: null,
          review: undefined,
          genres,
          collectionIds: [],
        };

        if (item.release_date || item.first_air_date || item.publishedDate) {
          const date = item.release_date || item.first_air_date || item.publishedDate || '';
          (newItem as any).releaseYear = new Date(date).getFullYear();
        }

        await addItem(newItem);
      }
    } catch (error) {
      console.error('Error al añadir a lista:', error);
    }
  };

  useEffect(() => {
    const fetchUpcoming = async () => {
      setIsLoading(true);
      
      try {
        const [movies, series, books, games] = await Promise.all([
          fetch(`/api/upcoming/movies?period=${selectedPeriod}`).then(r => r.json()),
          fetch(`/api/upcoming/series?period=${selectedPeriod}`).then(r => r.json()),
          fetch(`/api/upcoming/books?period=${selectedPeriod}`).then(r => r.json()),
          fetch(`/api/upcoming/games?period=${selectedPeriod}`).then(r => r.json()),
        ]);

        setUpcoming(movies.results || []);
        setAvailableGenres(movies.availableGenres || []);
      } catch (error) {
        console.error('Error fetching upcoming:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcoming();
  }, [selectedPeriod]);

  return (
    <>
      <div className="min-h-screen pb-24 md:pb-0">
        <Navbar />
        
        <main className="container mx-auto px-4 pt-32">
          <FadeIn direction="up" delay={0.1}>
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                Descubrir
              </h1>
              <p className="text-lg text-[var(--text-secondary)]">
                Próximos lanzamientos y recomendaciones basadas en tus gustos
              </p>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Filtrar
              </h2>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--text-tertiary)]">Tipo:</span>
                  {(['MOVIE', 'SERIES', 'BOOK', 'GAME'] as MediaType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        selectedType === type
                          ? 'bg-[var(--accent-primary)] text-black font-medium'
                          : 'bg-white/5 hover:bg-white/10 text-white'
                      }`}
                    >
                      {typeLabels[type]}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--text-tertiary)]">Período:</span>
                  {periods.map((period) => (
                    <button
                      key={period.value}
                      onClick={() => setSelectedPeriod(period.value as PeriodType)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        selectedPeriod === period.value
                          ? 'bg-[var(--accent-primary)] text-black font-medium'
                          : 'bg-white/5 hover:bg-white/10 text-white'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>

                {availableGenres.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--text-tertiary)]">Género:</span>
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg border-0 outline-none cursor-pointer transition-colors"
                    >
                      <option value="ALL">Todos</option>
                      {availableGenres.map((genre) => (
                        <option key={genre.id} value={genre.id}>{genre.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </FadeIn>

          {isLoading ? (
            <div className="text-center py-20 text-[var(--text-tertiary)]">
              Cargando...
            </div>
          ) : (
            <>
              <FadeIn direction="up" delay={0.3}>
                <section className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    {typeIcons[selectedType]}
                    <h2 className="text-2xl font-bold">
                      Próximos lanzamientos de {typeLabels[selectedType]}
                    </h2>
                  </div>

                  <div className="overflow-x-auto pb-4">
                    <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
                      {getFilteredUpcoming().map((item, index) => (
                        <FadeIn key={item.id} delay={index * 0.05}>
                          <div className="relative group flex-shrink-0 w-48 rounded-xl overflow-hidden border border-white/10 bg-[var(--bg-secondary)] hover:border-white/20 transition-all hover:scale-105 cursor-pointer">
                            <div className="aspect-[2/3] relative">
                              <Image
                                src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
                                  : item.cover?.url 
                                  || item.volumeInfo?.imageLinks?.thumbnail?.replace('http:', 'https:') || ''}
                                alt={item.title || item.volumeInfo?.title || ''}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                <p className="text-xs text-[var(--text-tertiary)] mb-1">
                                  {getDisplayDate(item)}
                                </p>
                                <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight">
                                  {item.title || item.volumeInfo?.title || ''}
                                </h3>
                              </div>
                            </div>

                            <div className="p-3">
                              <div className="flex flex-wrap gap-1 mb-3">
                                {(item.genre_ids || []).slice(0, 2).map((genreId: string) => {
                                  const genre = availableGenres.find((g: any) => g.id === genreId);
                                  return genre ? (
                                    <span key={genreId} className="text-xs px-2 py-1 rounded-full bg-white/10 text-[var(--text-tertiary)]">
                                      {genre.name}
                                    </span>
                                  ) : null;
                                })}
                              </div>

                              <Button
                                onClick={() => addToWantList(item)}
                                className="w-full"
                                size="sm"
                              >
                                {getActionButtonText(selectedType)}
                              </Button>
                            </div>
                          </div>
                        </FadeIn>
                      ))}
                    </div>
                  </div>

                  {getFilteredUpcoming().length === 0 && (
                    <div className="text-center py-12 text-[var(--text-tertiary)]">
                      No hay lanzamientos próximos en este período para {typeLabels[selectedType]}.
                    </div>
                  )}
                </section>
              </FadeIn>

              <FadeIn direction="up" delay={0.4}>
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <Film size={24} />
                    <h2 className="text-2xl font-bold">
                      Basado en tus gustos
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {getRecommended().map((item, index) => (
                      <FadeIn key={item.id} delay={index * 0.05}>
                        <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-[var(--bg-secondary)] hover:border-[var(--accent-primary)]/30 transition-all hover:scale-105 cursor-pointer">
                          <div className="aspect-[2/3] relative">
                            <Image
                              src={item.coverUrl}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-[var(--accent-primary)] flex items-center gap-1">
                              <span className="text-xs font-bold text-black">
                                {item.rating}
                              </span>
                              <span className="text-[10px] text-black/70">
                                ★
                              </span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight">
                                {item.title}
                              </h3>
                            </div>
                          </div>

                          <div className="p-3">
                            <div className="flex flex-wrap gap-1 mb-3">
                              {(item.genres || []).slice(0, 2).map((genre) => (
                                <span key={genre} className="text-xs px-2 py-1 rounded-full bg-white/10 text-[var(--text-tertiary)]">
                                  {genre}
                                </span>
                              ))}
                            </div>

                            <Button
                              onClick={() => addToWantList(item)}
                              className="w-full"
                              size="sm"
                            >
                              {getActionButtonText(selectedType)}
                            </Button>
                          </div>
                        </div>
                      </FadeIn>
                    ))}
                  </div>

                  {getRecommended().length === 0 && (
                    <div className="text-center py-12 text-[var(--text-tertiary)]">
                      Añade más {typeLabels[selectedType].toLowerCase()} a tu biblioteca para obtener recomendaciones personalizadas.
                    </div>
                  )}
                </section>
              </FadeIn>
            </>
          )}
        </main>
      </div>
    </>
  );
}
