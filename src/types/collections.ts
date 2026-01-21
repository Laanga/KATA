export interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CollectionFilters {
  collection: string | 'ALL';
}

export interface CreateCollectionInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}

export const DEFAULT_COLLECTION_COLORS = [
  '#EF4444',
  '#F97316',
  '#F59E0B',
  '#EAB308',
  '#84CC16',
  '#22C55E',
  '#10B981',
  '#14B8A6',
  '#06B6D4',
  '#0EA5E9',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#A855F7',
  '#D946EF',
  '#EC4899',
  '#F43F5E',
];

