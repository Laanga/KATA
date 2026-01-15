import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/home';

  if (code) {
    const supabase = await createClient();

    // Exchange code for session - this is ONLY Supabase call we make
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }

    // Get user info from session data (no additional Supabase call!)
    const user = data.user;
    const emailConfirmed = user?.email_confirmed_at !== null;
    const hasUsername = user?.user_metadata?.username;

    // Determine redirect based on user state
    let redirectUrl = next;

    if (!emailConfirmed) {
      // Email not confirmed -> go to verify-email
      redirectUrl = '/verify-email';
    } else if (!hasUsername) {
      // Email confirmed but no username -> go to choose-username
      redirectUrl = '/choose-username';
    } else if (type === 'recovery') {
      // Password recovery -> go to reset-password
      redirectUrl = '/reset-password';
    } else if (type === 'signup' && emailConfirmed && hasUsername) {
      // Completed signup -> go to dashboard
      redirectUrl = '/home';
    }

    // Determine correct origin for redirect
    const forwardedHost = request.headers.get('x-forwarded-host');
    const isLocalEnv = process.env.NODE_ENV === 'development';

    let fullRedirectUrl: string;

    if (isLocalEnv) {
      fullRedirectUrl = `${origin}${redirectUrl}`;
    } else if (forwardedHost) {
      fullRedirectUrl = `https://${forwardedHost}${redirectUrl}`;
    } else {
      fullRedirectUrl = `${origin}${redirectUrl}`;
    }

    return NextResponse.redirect(fullRedirectUrl);
  }

  // No code parameter - shouldn't happen, but handle gracefully
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
