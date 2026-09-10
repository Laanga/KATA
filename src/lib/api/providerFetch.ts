export function providerFetch(
  input: string | URL,
  init: RequestInit & { next?: { revalidate: number } } = {},
): Promise<Response> {
  const signal = init.signal
    ? AbortSignal.any([init.signal, AbortSignal.timeout(6000)])
    : AbortSignal.timeout(6000);
  return fetch(input, { ...init, signal });
}
