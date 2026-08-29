// 1. تغيير رقم الإصدار هنا في كل مرة تعدل فيها الموقع (v1, v2, v3...)
const CACHE_NAME = 'fg-store-v5.4'; 

const ASSETS = [
  '/',
  '/index.html',
  // أضف هنا أي ملفات CSS أو صور أساسية تريدها أن تعمل بدون إنترنت
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
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});
