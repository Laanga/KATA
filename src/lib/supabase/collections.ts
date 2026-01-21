import { createClient } from './client';
import type { Collection, CreateCollectionInput, UpdateCollectionInput } from '@/types/collections';
import type { Database } from '@/types/supabase';

class CollectionsDatabase {
  private getClient() {
    return createClient();
  }

  async getAll(): Promise<Collection[]> {
    const supabase = this.getClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }) as { data: Database['public']['Tables']['collections']['Row'][] | null, error: Error };

    if (error) throw error;
    if (!data) return [];

    return data.map((row) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description,
      color: row.color,
      icon: row.icon as Collection['icon'],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async getById(id: string): Promise<Collection | null> {
    const supabase = this.getClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single() as { data: Database['public']['Tables']['collections']['Row'] | null, error: { code?: string } };

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    if (!data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon as Collection['icon'],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async create(input: CreateCollectionInput): Promise<Collection> {
    const supabase = this.getClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Debes iniciar sesión para crear colecciones');
    }

    const { data, error } = await supabase
      .from('collections')
      // @ts-expect-error - Supabase types are too strict with new tables
      .insert({
        user_id: user.id,
        name: input.name,
        description: input.description || null,
        color: input.color || null,
        icon: input.icon || null,
      })
      .select()
      .single() as { data: Database['public']['Tables']['collections']['Row'] | null, error: Error };

    if (error) throw error;
    if (!data) throw new Error('Error creating collection');

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon as Collection['icon'],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async update(id: string, input: UpdateCollectionInput): Promise<Collection> {
    const supabase = this.getClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Debes iniciar sesión para actualizar colecciones');
    }

    const { data, error } = await supabase
      .from('collections')
      // @ts-expect-error - Supabase types are too strict with new tables
      .update({
        name: input.name,
        description: input.description !== undefined ? input.description : undefined,
        color: input.color !== undefined ? input.color : undefined,
        icon: input.icon !== undefined ? input.icon : undefined,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single() as { data: Database['public']['Tables']['collections']['Row'] | null, error: Error };

    if (error) throw error;
    if (!data) throw new Error('Collection not found');

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon as Collection['icon'],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async delete(id: string): Promise<void> {
    const supabase = this.getClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Debes iniciar sesión para eliminar colecciones');
    }

    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  async addItemToCollection(itemId: string, collectionId: string): Promise<void> {
    const supabase = this.getClient();
    
    const { error } = await supabase
      .from('media_items_collections')
      // @ts-expect-error - Supabase types are too strict with new tables
      .insert({
        media_item_id: itemId,
        collection_id: collectionId,
      });

    if (error) {
      if (error.code === '23505') {
        throw new Error('Este item ya está en la colección');
      }
      throw error;
    }
  }

  async removeItemFromCollection(itemId: string, collectionId: string): Promise<void> {
    const supabase = this.getClient();
    
    const { error } = await supabase
      .from('media_items_collections')
      .delete()
      .eq('media_item_id', itemId)
      .eq('collection_id', collectionId);

    if (error) throw error;
  }

  async getCollectionsForItem(itemId: string): Promise<Collection[]> {
    const supabase = this.getClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('media_items_collections')
      .select(`
        collection_id,
        collections!inner(
          id,
          user_id,
          name,
          description,
          color,
          icon,
          created_at,
          updated_at
        )
      `)
      .eq('media_item_id', itemId) as { data: { collection_id: string; collections: Database['public']['Tables']['collections']['Row'] }[] | null, error: Error };

    if (error) throw error;
    if (!data) return [];

    return data.map((row) => ({
      id: row.collections.id,
      userId: row.collections.user_id,
      name: row.collections.name,
      description: row.collections.description,
      color: row.collections.color,
      icon: row.collections.icon as Collection['icon'],
      createdAt: row.collections.created_at,
      updatedAt: row.collections.updated_at,
    }));
  }

  async getMediaItemIdsForCollection(collectionId: string): Promise<string[]> {
    const supabase = this.getClient();
    
    const { data, error } = await supabase
      .from('media_items_collections')
      .select('media_item_id')
      .eq('collection_id', collectionId) as { data: { media_item_id: string }[] | null, error: Error };

    if (error) throw error;
    if (!data) return [];
    
    return data.map((row) => row.media_item_id);
  }

  async getItemCount(collectionId: string): Promise<number> {
    const supabase = this.getClient();
    
    const { count, error } = await supabase
      .from('media_items_collections')
      .select('*', { count: 'exact', head: true })
      .eq('collection_id', collectionId);

    if (error) throw error;
    
    return count || 0;
  }
}

export const collectionsDb = new CollectionsDatabase();
