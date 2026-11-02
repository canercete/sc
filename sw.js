/* SC açılış sayfası: sayfa telefonda saklanır, her açılışta internete gidilmez; yeni hali arkada indirilir (bir sonraki açılışta gelir).
   Yalnız bu sitenin dosyalarına karışır; Google'a giden istekler olduğu gibi geçer. */
var SAYFA = 'sc-acilis-v1';
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(SAYFA).then(function (c) { return c.addAll([self.registration.scope, 'manifest.webmanifest']).catch(function () {}); }));
});
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  var r = e.request; if (r.method !== 'GET') return;
  var u = new URL(r.url); if (u.origin !== self.location.origin || /sw\.js$/.test(u.pathname)) return;
  var gezinme = r.mode === 'navigate', anahtar = gezinme ? self.registration.scope : r.url.split('?')[0];
  e.respondWith(caches.open(SAYFA).then(function (c) {
    return c.match(anahtar).then(function (kayitli) {
      var ag = fetch(gezinme ? self.registration.scope : r, { cache: 'no-cache' }).then(function (y) { if (y && y.ok && y.type === 'basic') c.put(anahtar, y.clone()); return y; });
      if (kayitli) { e.waitUntil(ag.catch(function () {})); return kayitli; }   // önce telefondaki, arkada güncelle
      return ag.catch(function () { return new Response('Bağlantı yok', { status: 503 }); });
    });
  }));
});
