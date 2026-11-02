/* Yalnız "uygulama olarak yükle" özelliği için; hiçbir şeyi önbelleğe almaz, veriler hep canlı gelir. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function () { });
