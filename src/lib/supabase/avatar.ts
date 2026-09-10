import { createClient } from './client';

export function ownedAvatarPath(url: string | null, userId: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const origin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin;
    const prefix = '/storage/v1/object/public/avatars/';
    if (parsed.origin !== origin || !parsed.pathname.startsWith(prefix)) return null;
    const path = decodeURIComponent(parsed.pathname.slice(prefix.length));
    return path.startsWith(`${userId}/`) || path.startsWith(`avatars/${userId}-`) ? path : null;
  } catch {
    return null;
  }
}

export async function saveAvatar(file: File, previousUrl: string | null): Promise<string> {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  if (!extensions[file.type] || file.size > 2097152)
    throw new Error('Elige una imagen JPG, PNG, WebP o GIF de hasta 2 MB.');
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Debes iniciar sesión.');
  const path = `${user.id}/${crypto.randomUUID()}.${extensions[file.type]}`;
  const upload = await supabase.storage
    .from('avatars')
    .upload(path, file, { cacheControl: '3600' });
  if (upload.error) throw upload.error;
  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(path);
  const update = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
  if (update.error) {
    await supabase.storage.from('avatars').remove([path]);
    throw update.error;
  }
  // Only clean up after the account points at the new image; failure leaves an unused file.
  const oldPath = ownedAvatarPath(previousUrl, user.id);
  if (oldPath) await supabase.storage.from('avatars').remove([oldPath]);
  return publicUrl;
}

export async function removeAvatar(previousUrl: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Debes iniciar sesión.');
  const { error } = await supabase.auth.updateUser({ data: { avatar_url: null } });
  if (error) throw error;
  const path = ownedAvatarPath(previousUrl, user.id);
  if (path) await supabase.storage.from('avatars').remove([path]);
}
