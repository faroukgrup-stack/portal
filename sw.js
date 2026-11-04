// 1. غيّر رقم الإصدار في كل مرة تعدل الموقع
const CACHE_NAME = 'fg-store-v6.1';

const ASSETS = [
  '/',
  '/index.html',
  '/css/index.css',
  '/css/tools-common.css',
  '/css/tools-common-en.css',
  '/css/tools-common-tr.css',
  '/css/tools-overrides-tr.css',
  '/css/tools-overrides-en.css',
  '/css/tools-overrides.css',
  '/js/i18n.js',
  '/js/app.js',
  '/js/auth-check.js',
  '/manifest.json',
  '/icon.png',
];

// التثبيت
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// التنشيط + حذف الكاش القديم
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// الاستجابة
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // ✅ مهم جداً: لا تتدخل أبداً في طلبات الـ API (Worker أو Google Script)
  if (
    url.hostname.includes('workers.dev') ||
    url.hostname.includes('script.google.com') ||
    e.request.method !== 'GET'
  ) {
    return; // اترك المتصفح يتعامل مع الطلب مباشرة
  }

  // باقي الملفات: Network First
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});
