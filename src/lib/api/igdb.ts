import { providerFetch } from './providerFetch';
let cached: { token: string; expiresAt: number } | null = null;
let pending: Promise<string | null> | null = null;
export async function getIGDBToken(): Promise<string | null> {
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  if (cached && cached.expiresAt > Date.now()) return cached.token;
  if (pending) return pending;
  pending = (async () => {
    const response = await providerFetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (
      !data ||
      typeof data !== 'object' ||
      !('access_token' in data) ||
      typeof data.access_token !== 'string' ||
      !('expires_in' in data) ||
      typeof data.expires_in !== 'number'
    )
      return null;
    cached = {
      token: data.access_token,
      expiresAt: Date.now() + Math.max(0, data.expires_in - 60) * 1000,
    };
    return cached.token;
  })()
    .catch(() => null)
    .finally(() => {
      pending = null;
    });
  return pending;
}
