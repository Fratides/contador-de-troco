const CACHE_NAME = 'duda-gourmet-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './assets/index-CIPXkIx5.css',
  './assets/index-tsJjVEWq.js',
  './assets/fundo-BvtbYP0Z.jpg',
  './assets/2-BNKhhOLY.png',
  './assets/5-DaPpLJZg.png',
  './assets/10-DaHuLOEB.png',
  './assets/20-4IIziVFw.png',
  './assets/50-ChtgX99Y.png',
  './assets/100-DTT_Ebx9.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return Promise.resolve();
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
