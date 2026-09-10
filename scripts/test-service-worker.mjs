import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const routes = [];
const imports = [];
const workbox = new Proxy(
  {},
  {
    get: (_, key) => {
      if (key === 'registerRoute') return (matcher, strategy) => routes.push({ matcher, strategy });
      if (['clientsClaim', 'precacheAndRoute', 'cleanupOutdatedCaches'].includes(key))
        return () => {};
      return function Strategy(options) {
        this.kind = key;
        this.options = options;
      };
    },
  },
);
const scope = {
  define: (_, callback) => callback(workbox),
  importScripts: (path) => imports.push(path),
  skipWaiting() {},
  URL,
};
scope.self = scope;
vm.runInNewContext(fs.readFileSync('public/sw.js', 'utf8'), scope);
const strategyFor = (address) => {
  const url = new URL(address);
  const route = routes.find(({ matcher }) =>
    typeof matcher === 'function'
      ? matcher({ url, sameOrigin: url.origin === 'http://localhost:3001' })
      : typeof matcher === 'string'
        ? matcher === url.pathname
        : matcher.test(url.href),
  );
  return route?.strategy.kind;
};
assert.ok(imports.includes('/cache-cleanup.js'));
assert.equal(strategyFor('http://127.0.0.1:54321/rest/v1/media_items'), 'NetworkOnly');
assert.equal(strategyFor('https://project.supabase.co/auth/v1/user'), 'NetworkOnly');
assert.equal(strategyFor('http://localhost:3001/api/search/books?q=private'), 'NetworkOnly');
assert.equal(strategyFor('http://localhost:3001/auth/callback?code=private'), 'NetworkOnly');
assert.equal(
  strategyFor('http://localhost:3001/'),
  undefined,
  'Start route must not cache a personalized redirect',
);
assert.equal(strategyFor('http://localhost:3001/library'), undefined);
assert.equal(strategyFor('https://image.tmdb.org/t/p/w500/test.jpg'), 'StaleWhileRevalidate');
assert.ok(!routes.some(({ strategy }) => strategy.kind === 'NetworkFirst'));
let activation;
const deleted = [];
vm.runInNewContext(fs.readFileSync('public/cache-cleanup.js', 'utf8'), {
  self: {
    addEventListener: (_, fn) => {
      activation = fn;
    },
  },
  caches: {
    keys: async () => [
      'cross-origin',
      'pages-rsc',
      'pages-rsc-prefetch',
      'start-url',
      'apis',
      'tmdb-images',
    ],
    delete: async (name) => {
      deleted.push(name);
      return true;
    },
  },
});
let cleanup;
activation({
  waitUntil: (promise) => {
    cleanup = promise;
  },
});
await cleanup;
assert.deepEqual(deleted.sort(), [
  'apis',
  'cross-origin',
  'pages-rsc',
  'pages-rsc-prefetch',
  'start-url',
]);
console.log(
  'PASS generated service worker: executable matchers, private NetworkOnly, no start/page fallback, legacy cache cleanup',
);
