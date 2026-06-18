const CACHE_NAME = 'workout-builder-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './css/base.css',
  './css/app-header.css',
  './css/search.css',
  './css/empty-state.css',
  './css/workout-list.css',
  './css/bottom-sticky.css',
  './css/calendar.css',
  './css/onboarding.css',
  './js/auth.js',
  './js/calendar.js',
  './js/data-store.js',
  './js/search.js',
  './js/summary.js',
  './js/theme.js',
  './js/weekly-goal.js',
  './js/workout-list.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
