import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type'); // 'signup', 'recovery', etc.
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Verificar si el email está confirmado
      const { data: { user } } = await supabase.auth.getUser();
      const emailConfirmed = user?.email_confirmed_at !== null;
      const hasUsername = user?.user_metadata?.username;
      
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      
      let redirectUrl = next;
      
      // Si viene de OAuth (Google) y no tiene username, redirigir a choose-username
      if (!hasUsername && emailConfirmed) {
        redirectUrl = '/choose-username';
      } else if (type === 'recovery') {
        // Para recuperación de contraseña, ir a reset-password
        redirectUrl = '/reset-password';
      } else if (!emailConfirmed) {
        // Si el email no está confirmado, ir a verify-email
        redirectUrl = '/verify-email';
      } else if (type === 'signup' && emailConfirmed && hasUsername) {
        // Si es un signup y el email está confirmado y tiene username, ir al dashboard
        redirectUrl = '/';
      }
    
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectUrl}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectUrl}`);
      } else {
        return NextResponse.redirect(`${origin}${redirectUrl}`);
      }
    }
  }

  // Si hay un error, redirigir a login
  return NextResponse.redirect(`${origin}/login`);
}
