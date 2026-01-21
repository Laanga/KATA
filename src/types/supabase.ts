import type { MediaItem, MediaType, MediaStatus } from './media';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Metadata flexible en JSONB
export interface MediaMetadata {
  author?: string;
  platform?: string;
  release_year?: number;
  genres?: string[];
  [key: string]: unknown;
}

export interface Database {
  public: {
    Tables: {
      media_items: {
        Row: {
          id: string;
          user_id: string;
          type: MediaType;
          title: string;
          cover_url: string | null;
          status: MediaStatus;
          rating: number | null;
          review: string | null;
          metadata: MediaMetadata;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: MediaType;
          title: string;
          cover_url?: string | null;
          status: MediaStatus;
          rating?: number | null;
          review?: string | null;
          metadata?: MediaMetadata;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: MediaType;
          title?: string;
          cover_url?: string | null;
          status?: MediaStatus;
          rating?: number | null;
          review?: string | null;
          metadata?: MediaMetadata;
          created_at?: string;
          updated_at?: string;
        };
      };
      collections: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          color: string | null;
          icon: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          color?: string | null;
          icon?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          color?: string | null;
          icon?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      media_items_collections: {
        Row: {
          id: string;
          media_item_id: string;
          collection_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          media_item_id: string;
          collection_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          media_item_id?: string;
          collection_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper function to convert database row to MediaItem
export const dbRowToMediaItem = (row: Database['public']['Tables']['media_items']['Row']): MediaItem => {
  const metadata = row.metadata || {};
  
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    coverUrl: row.cover_url || '',
    rating: row.rating,
    status: row.status,
    author: metadata.author,
    platform: metadata.platform,
    releaseYear: metadata.release_year,
    genres: metadata.genres,
    review: row.review || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

// Helper function to convert MediaItem to database insert
export const mediaItemToDbInsert = (
  item: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string
): Database['public']['Tables']['media_items']['Insert'] => {
  const metadata: MediaMetadata = {};
  if (item.author) metadata.author = item.author;
  if (item.platform) metadata.platform = item.platform;
  if (item.releaseYear) metadata.release_year = item.releaseYear;
  if (item.genres) metadata.genres = item.genres;

  return {
    user_id: userId,
    type: item.type,
    title: item.title,
    cover_url: item.coverUrl || null,
    status: item.status,
    rating: item.rating,
    review: item.review || null,
    metadata,
  };
};

// Helper function to convert MediaItem updates to database update
export const mediaItemToDbUpdate = (
  updates: Partial<MediaItem>,
  currentMetadata?: MediaMetadata
): Database['public']['Tables']['media_items']['Update'] => {
  const dbUpdate: Database['public']['Tables']['media_items']['Update'] = {};
  
  if (updates.title !== undefined) dbUpdate.title = updates.title;
  if (updates.type !== undefined) dbUpdate.type = updates.type;
  if (updates.coverUrl !== undefined) dbUpdate.cover_url = updates.coverUrl || null;
  if (updates.rating !== undefined) dbUpdate.rating = updates.rating;
  if (updates.status !== undefined) dbUpdate.status = updates.status;
  if (updates.review !== undefined) dbUpdate.review = updates.review || null;
  
  const hasMetadataUpdates = 
    updates.author !== undefined ||
    updates.platform !== undefined ||
    updates.releaseYear !== undefined ||
    updates.genres !== undefined;

  if (hasMetadataUpdates) {
    const newMetadata: MediaMetadata = { ...(currentMetadata || {}) };
    
    if (updates.author !== undefined) newMetadata.author = updates.author;
    if (updates.platform !== undefined) newMetadata.platform = updates.platform;
    if (updates.releaseYear !== undefined) newMetadata.release_year = updates.releaseYear;
    if (updates.genres !== undefined) newMetadata.genres = updates.genres;
    
    dbUpdate.metadata = newMetadata;
  }
  
  return dbUpdate;
};
