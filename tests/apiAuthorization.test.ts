import { beforeEach, expect, it, vi } from 'vitest';
import { authorizeApi } from '@/lib/api/authorize';
const client = vi.hoisted(() => ({ auth: { getUser: vi.fn() }, rpc: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => client }));
beforeEach(() => {
  vi.resetAllMocks();
  client.auth.getUser.mockResolvedValue({ data: { user: { id: 'qa' } }, error: null });
  client.rpc.mockResolvedValue({ data: true, error: null });
});
it('rejects anonymous callers before consuming provider quota', async () => {
  client.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
  expect((await authorizeApi())?.status).toBe(401);
  expect(client.rpc).not.toHaveBeenCalled();
});
it('honors shared quota and fails closed when the limiter is unavailable', async () => {
  client.rpc.mockResolvedValueOnce({ data: false, error: null });
  const denied = await authorizeApi();
  expect(denied?.status).toBe(429);
  expect(denied?.headers.get('Retry-After')).toBe('60');
  client.rpc.mockResolvedValueOnce({ data: null, error: new Error('offline') });
  expect((await authorizeApi())?.status).toBe(503);
  expect(await authorizeApi()).toBeNull();
});
