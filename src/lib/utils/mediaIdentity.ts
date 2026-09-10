import type { MediaItem } from '@/types/media';

type Identity = Pick<MediaItem, 'type' | 'title' | 'provider' | 'externalId'>;
export function sameMedia(a: Identity, b: Identity): boolean {
  if (a.type !== b.type) return false;
  if (a.externalId && b.externalId && a.provider && b.provider) {
    return a.provider === b.provider && a.externalId === b.externalId;
  }
  return a.title.trim().toLocaleLowerCase() === b.title.trim().toLocaleLowerCase();
}
