import type { MediaItem, MediaType, MediaStatus, MediaProvider } from './media';

import type { Database, Json } from './database.generated';
export type { Database, Json } from './database.generated';

// Metadata flexible en JSONB
export interface MediaMetadata {
  author?: string;
  platform?: string;
  release_year?: number;
  genres?: string[];
  [key: string]: Json | undefined;
}

// Helper function to convert database row to MediaItem
export const dbRowToMediaItem = (
  row: Database['public']['Tables']['media_items']['Row'],
): MediaItem => {
  const metadata = (
    row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
      ? row.metadata
      : {}
  ) as MediaMetadata;

  return {
    id: row.id,
    title: row.title,
    type: row.type as MediaType,
    coverUrl: row.cover_url || '',
    rating: row.rating,
    provider: (row.provider as MediaProvider | null) || undefined,
    externalId: row.external_id || undefined,
    completedAt: row.completed_at || undefined,
    status: row.status as MediaStatus,
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
  userId: string,
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
    provider: item.provider || null,
    external_id: item.externalId || null,
    review: item.review || null,
    metadata,
  };
};

// Helper function to convert MediaItem updates to database update
export const mediaItemToDbUpdate = (
  updates: Partial<MediaItem>,
  currentMetadata?: MediaMetadata,
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

export type UserPreferences = {
  user_id: string;
  onboarding_status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  onboarding_version: number;
  onboarding_step: number;
  preferred_type: MediaType | null;
  first_item_id: string | null;
  finished_at: string | null;
  updated_at: string;
};

export function parsePreferences(
  row: Database['public']['Tables']['user_preferences']['Row'],
): UserPreferences {
  if (!['pending', 'in_progress', 'completed', 'skipped'].includes(row.onboarding_status))
    throw new Error('Estado de bienvenida inválido');
  if (row.preferred_type && !['MOVIE', 'SERIES', 'BOOK', 'GAME'].includes(row.preferred_type))
    throw new Error('Categoría inválida');
  return {
    ...row,
    onboarding_status: row.onboarding_status as UserPreferences['onboarding_status'],
    preferred_type: row.preferred_type as MediaType | null,
  };
}
