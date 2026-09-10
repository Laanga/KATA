import { createClient } from '@/lib/supabase/server';
export async function authorizeApi(): Promise<Response | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user)
      return Response.json({ error: 'Inicia sesión para buscar contenido' }, { status: 401 });
    const { data: allowed, error: limitError } = await supabase.rpc('consume_api_request');
    if (limitError)
      return Response.json(
        { error: 'El servicio no está disponible temporalmente' },
        { status: 503 },
      );
    if (!allowed)
      return Response.json(
        { error: 'Demasiadas solicitudes. Inténtalo en un minuto.' },
        { status: 429, headers: { 'Retry-After': '60' } },
      );
    return null;
  } catch {
    return Response.json(
      { error: 'El servicio no está disponible temporalmente' },
      { status: 503 },
    );
  }
}
