import { createClient } from './client';
import type { MediaItem } from '@/types/media';
import type { LibraryBackup } from '@/lib/utils/libraryTransfer';
import type { Json } from '@/types/supabase';
import {
  dbRowToMediaItem,
  mediaItemToDbInsert,
  mediaItemToDbUpdate,
  type MediaMetadata,
} from '@/types/supabase';

class MediaDatabase {
  private getClient() {
    return createClient();
  }

  /**
   * Obtiene todos los media items del usuario actual
   */
  async getAll(): Promise<MediaItem[]> {
    const supabase = this.getClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    // Si no hay usuario, retornar array vacío en lugar de lanzar error
    if (!user) return [];

    const items: MediaItem[] = [];
    const pageSize = 500;
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .order('id')
        .range(offset, offset + pageSize - 1);
      if (error) throw error;
      items.push(...data.map(dbRowToMediaItem));
      if (data.length < pageSize) return items;
    }
  }

  /**
   * Obtiene un media item por ID
   */
  async getById(id: string): Promise<MediaItem | null> {
    const supabase = this.getClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return dbRowToMediaItem(data);
  }

  /**
   * Crea un nuevo media item
   */
  async create(item: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MediaItem> {
    const supabase = this.getClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Debes iniciar sesión para crear items');
    }

    const dbItem = mediaItemToDbInsert(item, user.id);

    const { data, error } = await supabase.from('media_items').insert(dbItem).select().single();

    if (error) {
      if (error.code === '23505' || error.message?.includes('unique constraint')) {
        throw new Error('Este elemento ya existe en tu biblioteca');
      }
      throw error;
    }

    return dbRowToMediaItem(data);
  }

  /**
   * Actualiza un media item existente
   */
  async update(id: string, updates: Partial<MediaItem>): Promise<MediaItem> {
    const supabase = this.getClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Debes iniciar sesión para actualizar items');
    }

    // Obtener metadata actual de la base de datos
    const { data: currentData, error: metadataError } = await supabase
      .from('media_items')
      .select('metadata')
      .eq('user_id', user.id)
      .eq('id', id)
      .single();

    if (metadataError) throw metadataError;
    const metadata = currentData
      ? (currentData as { metadata?: MediaMetadata }).metadata
      : undefined;
    const dbUpdate = mediaItemToDbUpdate(updates, metadata);

    const { data, error } = await supabase
      .from('media_items')
      .update(dbUpdate)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return dbRowToMediaItem(data);
  }

  /**
   * Elimina un media item
   */
  async delete(id: string): Promise<void> {
    const supabase = this.getClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Debes iniciar sesión para eliminar items');
    }

    const { error } = await supabase
      .from('media_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  async clear(): Promise<void> {
    const { error } = await this.getClient().rpc('clear_library');
    if (error) throw error;
  }

  async import(backup: LibraryBackup, replace = false): Promise<number> {
    const payload = JSON.parse(JSON.stringify(backup)) as Json;
    const { data, error } = await this.getClient().rpc('import_library', {
      payload,
      replace_existing: replace,
    });
    if (error) throw error;
    return data;
  }
  /**
   * Obtiene estadísticas del usuario
   */
  async getStats() {
    const items = await this.getAll();

    const byType = items.reduce(
      (acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byStatus = items.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const ratingsSum = items
      .filter((item) => item.rating !== null)
      .reduce((sum, item) => sum + (item.rating || 0), 0);

    const ratedCount = items.filter((item) => item.rating !== null).length;
    const averageRating = ratedCount > 0 ? ratingsSum / ratedCount : 0;

    return {
      total: items.length,
      byType,
      byStatus,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  }
}

export const mediaDb = new MediaDatabase();
