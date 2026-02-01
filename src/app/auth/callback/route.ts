import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin: requestOrigin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/home';

  if (code) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[Auth] Code exchange failed:', error);
      return NextResponse.redirect(`${requestOrigin}/login?error=${encodeURIComponent(error.message)}`);
    }

    const user = data.user;
    const emailConfirmed = user?.email_confirmed_at !== null;
    const hasUsername = user?.user_metadata?.username;

    if (user && user.identities?.some(id => id.provider === 'google')) {
      const googleIdentity = user.identities.find(id => id.provider === 'google');
      const googleAvatar = googleIdentity?.identity_data?.avatar_url;

      const isValidImageUrl = (url: string | undefined | null) => {
        if (!url) return false;
        return url.startsWith('https://') || url.startsWith('http://');
      };

      if (isValidImageUrl(googleAvatar)) {
        await supabase.auth.updateUser({
          data: { avatar_url: googleAvatar }
        });
      }
    }

    let redirectUrl = next;

    if (!emailConfirmed) {
      redirectUrl = '/verify-email';
    } else if (!hasUsername) {
      redirectUrl = '/choose-username';
    } else if (type === 'recovery') {
      redirectUrl = '/reset-password';
    } else if (type === 'signup' && emailConfirmed && hasUsername) {
      redirectUrl = '/home';
    }

    const fullRedirectUrl = buildRedirectUrl(request, redirectUrl);

    console.log(`[Auth] Redirecting to: ${fullRedirectUrl}`);

    return NextResponse.redirect(fullRedirectUrl);
  }

  return NextResponse.redirect(`${requestOrigin}/login?error=no_code`);
}

function buildRedirectUrl(request: Request, path: string): string {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (isDevelopment) {
    const origin = new URL(request.url).origin;
    return `${origin}${path}`;
  }

  if (siteUrl) {
    const baseUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  }

  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');

  if (forwardedHost) {
    const protocol = forwardedProto || 'https';
    return `${protocol}://${forwardedHost}${path}`;
  }

  console.warn(
    '[Auth] Missing NEXT_PUBLIC_SITE_URL and x-forwarded-host. ' +
    'Redirects may fail. Please configure NEXT_PUBLIC_SITE_URL.'
  );

  const origin = new URL(request.url).origin;
  return `${origin}${path}`;
}
