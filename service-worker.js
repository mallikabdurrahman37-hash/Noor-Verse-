/* =============================================
   NoorVerse – service-worker.js
   PWA Offline Support
   ============================================= */

const CACHE_NAME = 'noorverse-v1.0.0';
const OFFLINE_URLS = [
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './assets/logo.png',
  './assets/pattern.png',
  './assets/quraan.png',
  './assets/compass.png',
  './assets/prayer.png',
  './assets/pdf.png',
  './assets/compass_dial_3d.png',
  './assets/needle.png',
  'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&family=Noto+Nastaliq+Urdu&display=swap'
];

/* ---- INSTALL ---- */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(OFFLINE_URLS.map(url => new Request(url, { cache: 'reload' })))
        .catch(() => {
          // Non-fatal: cache what we can
          return Promise.allSettled(OFFLINE_URLS.map(url =>
            cache.add(new Request(url, { cache: 'reload' })).catch(() => {})
          ));
        });
    })
  );
  self.skipWaiting();
});

/* ---- ACTIVATE ---- */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* ---- FETCH (Cache-first for local assets, Network-first for API) ---- */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API calls – always network, no cache
  if (url.hostname.includes('alquran.cloud') ||
      url.hostname.includes('aladhan.com') ||
      url.hostname.includes('islamic.network')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // Google Fonts – stale-while-revalidate
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const networkFetch = fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        }).catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  // Local assets – Cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        // Return offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
