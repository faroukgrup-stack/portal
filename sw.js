// 1. تغيير رقم الإصدار هنا في كل مرة تعدل فيها الموقع (v1, v2, v3...)
const CACHE_NAME = 'fg-store-v10-supabase'; 

const ASSETS = [
  './',
  './index.html',
  './css/index.css',
  './css/tools-common.css',
  './css/tools-common-en.css',
  './css/tools-common-tr.css',
  './css/tools-overrides.css',
  './css/tools-overrides-en.css',
  './css/tools-overrides-tr.css',
  './js/fg-config.js',
  './js/fg-boot.js',
  './js/i18n.js',
  './js/app.js',
  './manifest.json',
  './icon.png',
  './tools/tool1.html',
  './js/tools/tool1.js',
  './tools/tool2.html',
  './js/tools/tool2.js',
  './tools/tool3.html',
  './js/tools/tool3.js',
  './tools/tool4.html',
  './js/tools/tool4.js',
  './tools/tool5.html',
  './js/tools/tool5.js',
  './tools/tool6.html',
  './js/tools/tool6.js',
  './tools/tool7.html',
  './js/tools/tool7.js',
  './tools/tool8.html',
  './js/tools/tool8.js',
  './tools/tool9.html',
  './js/tools/tool9.js',
  './tools/tool10.html',
  './js/tools/tool10.js',
  './tools/tool11.html',
  './js/tools/tool11.js',
  './tools/tool12.html',
  './js/tools/tool12.js',
  './tools/tool13.html',
  './js/tools/tool13.js',
  './tools/tool14.html',
  './js/tools/tool14.js',
  './tools/tool15.html',
  './js/tools/tool15.js',
  './tools/tool16.html',
  './js/tools/tool16.js',
  './tools/tool17.html',
  './js/tools/tool17.js',
  './tools/tool18.html',
  './js/tools/tool18.js',
  './tools/tool19.html',
  './js/tools/tool19.js',
  './tools/tool20.html',
  './js/tools/tool20.js',
  './tools/tool21.html',
  './js/tools/tool21.js',
  './tools/tool22.html',
  './js/tools/tool22.js',
  './tools/tool23.html',
  './js/tools/tool23.js',
  './tools/tool24.html',
  './js/tools/tool24.js',
  './tools/tool25.html',
  './js/tools/tool25.js',
  './tools/tool26.html',
  './js/tools/tool26.js',
  './tools/tool27.html',
  './js/tools/tool27.js',
  './tools/tool28.html',
  './js/tools/tool28.js',
  './tools/tool29.html',
  './js/tools/tool29.js',
  './tools/tool30.html',
  './js/tools/tool30.js',
  './tools/tool31.html',
  './js/tools/tool31.js',
  './tools/tool32.html',
  './js/tools/tool32.js',
  // صفحة واحدة لكل أداة (بدل 3 نسخ ar/en/tr) — اللغة من قاعدة البيانات
];

// مرحلة التثبيت: تحميل الملفات للكاش
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Installing new cache version...');
      return cache.addAll(ASSETS);
    }).then(() => {
      // إجبار الـ Service Worker الجديد على التنشيط فوراً دون انتظار إغلاق المتصفح
      return self.skipWaiting();
    })
  );
});

// مرحلة التنشيط: حذف الكاش القديم تماماً (هذا هو الحل لمشكلتك)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      // إجبار جميع الصفحات المفتوحة على التحكم بواسطة الـ SW الجديد فوراً
      return self.clients.claim();
    })
  );
});

// استراتيجية الاستجابة: حاول جلب الملف من الإنترنت أولاً، إذا فشل (أوفلاين) خذه من الكاش
// هذه الاستراتيجية (Network First) هي الأفضل لموقع استشارات بمعادلات متغيرة
self.addEventListener('fetch', (e) => {
  // طلبات Supabase (الحسابات/الدخول/الترجمات) لا تُخزَّن أبداً في الكاش
  if (e.request.method !== 'GET' || e.request.url.includes('.supabase.co')) return;
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});
