export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
}

export interface TMDBSeries {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
}

export interface TMDBResponse {
  page: number;
  results: TMDBMovie[] | TMDBSeries[];
  total_pages: number;
  total_results: number;
}

export interface GoogleBookVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: {
      smallThumbnail: string;
      thumbnail: string;
    };
    categories?: string[];
    subject?: string[];
    pageCount?: number;
    publishedDate?: string;
    genre_names?: string[];
  };
}

export interface GoogleBooksResponse {
  kind: string;
  totalItems: number;
  items: GoogleBookVolume[];
}

export interface IGDBGame {
  id: number;
  name: string;
  cover?: {
    id: number;
    image_id: number;
  };
  first_release_date?: number;
  rating?: number;
  genres?: Array<{
    id: number;
    name: string;
  }>;
}

export interface IGDBResponse {
  data: IGDBGame[];
}
