import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useMediaSearch } from '@/hooks/useMediaSearch';
const response = (title: string) =>
  new Response(JSON.stringify({ results: [{ id: 1, title, release_date: '2024-01-01' }] }), {
    status: 200,
  });
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
it('never lets an older response replace the current query', async () => {
  let resolveOld!: (r: Response) => void;
  const fetch = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<Response>((r) => {
          resolveOld = r;
        }),
    )
    .mockResolvedValueOnce(response('New title'));
  vi.stubGlobal('fetch', fetch);
  const { result } = renderHook(() => useMediaSearch('MOVIE'));
  act(() => result.current.setSearchQuery('old'));
  await act(() => vi.advanceTimersByTimeAsync(450));
  act(() => result.current.setSearchQuery('new'));
  await act(() => vi.advanceTimersByTimeAsync(450));
  expect(result.current.results[0].title).toBe('New title');
  await act(async () => {
    resolveOld(response('Old title'));
  });
  expect(result.current.results[0].title).toBe('New title');
});
it('clearing the query cancels results and failure can be retried', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(new Response('{}', { status: 503 }))
    .mockResolvedValueOnce(response('Recovered'));
  vi.stubGlobal('fetch', fetch);
  const { result } = renderHook(() => useMediaSearch('MOVIE'));
  act(() => result.current.setSearchQuery('title'));
  await act(() => vi.advanceTimersByTimeAsync(450));
  expect(result.current.errors).toHaveLength(1);
  act(() => result.current.retry());
  await act(() => vi.advanceTimersByTimeAsync(450));
  expect(result.current.results[0].title).toBe('Recovered');
  act(() => result.current.setSearchQuery(''));
  expect(result.current.results).toEqual([]);
  expect(result.current.isSearching).toBe(false);
});
