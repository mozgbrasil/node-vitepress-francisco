const VERSION = 'mozg-site-francisco-v10';
const HOME_PATH = '/node-vitepress-francisco/';
const APP_SHELL = [
  '/node-vitepress-francisco/',
  '/node-vitepress-francisco/manifest.json',
  '/node-vitepress-francisco/logo-mini.svg',
  '/node-vitepress-francisco/logo-mini.png',
  '/node-vitepress-francisco/og.jpg',
  '/node-vitepress-francisco/data/site-catalog.json',
  '/node-vitepress-francisco/data/site-audit.json',
  '/node-vitepress-francisco/data/site-discovery.json',
  '/node-vitepress-francisco/data/site-portfolio.json',
  '/node-vitepress-francisco/data/site-projects.json',
  '/node-vitepress-francisco/data/site-capabilities.json',
  '/node-vitepress-francisco/data/site-stacks.json',
  '/node-vitepress-francisco/data/site-operations.json',
  '/node-vitepress-francisco/data/site-journeys.json',
  '/node-vitepress-francisco/data/site-trust.json',
  '/node-vitepress-francisco/llms.txt',
  '/node-vitepress-francisco/robots.txt',
  '/node-vitepress-francisco/contato',
  '/node-vitepress-francisco/presenca',
  '/node-vitepress-francisco/en/',
  '/node-vitepress-francisco/en/contact',
  '/node-vitepress-francisco/en/presence',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => (key === VERSION ? null : caches.delete(key))),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            event.waitUntil(
              caches.open(VERSION).then((cache) => {
                cache.put(HOME_PATH, responseClone);
              }),
            );
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(VERSION);
          return cache.match(HOME_PATH) || Response.error();
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            event.waitUntil(
              caches.open(VERSION).then((cache) => {
                cache.put(event.request, responseClone);
              }),
            );
          }
          return response;
        })
        .catch(() => cachedResponse || Response.error());

      return cachedResponse || networkFetch;
    }),
  );
});
