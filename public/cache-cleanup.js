self.addEventListener('activate', (event) => {
  const legacy = [
    'start-url',
    'apis',
    'others',
    'cross-origin',
    'pages',
    'pages-rsc',
    'pages-rsc-prefetch',
    'static-data-assets',
    'next-data',
    'next-prefetch',
    'supabase',
  ];
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.filter((name) => legacy.includes(name)).map((name) => caches.delete(name)),
        ),
      ),
  );
});
