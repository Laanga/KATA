import type { User } from '@supabase/supabase-js';
import { createClient } from './client';

/**
 * Usuario de la sesión guardada en el navegador, sin una petición a Supabase Auth.
 * Basta para filtrar consultas: RLS valida el JWT en el servidor y getSession
 * refresca el token si ha caducado. Para decisiones de acceso usar getUser().
 */
export async function getSessionUser(
  supabase: ReturnType<typeof createClient> = createClient(),
): Promise<User | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
}
