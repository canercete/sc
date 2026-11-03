/* SC açılış: (1) açılış sayfası telefonda saklanır, her açılışta internete gidilmez;
   (2) program (app.html) telefondaki kopyadan normal sayfa gibi açılır (akarak yüklenir, hızlı).
   Yalnız bu sitenin dosyalarına karışır; Google'a giden istekler olduğu gibi geçer. */
var SAYFA = 'sc-acilis-v1', PROG = 'sc-kabuk';
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(SAYFA).then(function (c) { return c.addAll([self.registration.scope, 'manifest.webmanifest']).catch(function () {}); }));
});
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  var r = e.request; if (r.method !== 'GET') return;
  var u = new URL(r.url); if (u.origin !== self.location.origin || /sw\.js$/.test(u.pathname)) return;
  if (/\/app\.html$/.test(u.pathname)) {   // program: telefondaki kopya
    e.respondWith(caches.open(PROG).then(function (c) { return c.match('app'); }).then(function (k) {
      return k ? new Response(k.body, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } }) : Response.redirect(self.registration.scope + '?yok=1', 302);
    }).catch(function () { return Response.redirect(self.registration.scope + '?yok=1', 302); }));
    return;
  }
  var gezinme = r.mode === 'navigate', anahtar = gezinme ? self.registration.scope : r.url.split('?')[0];
  e.respondWith(caches.open(SAYFA).then(function (c) {
    return c.match(anahtar).then(function (kayitli) {
      var ag = fetch(gezinme ? self.registration.scope : r, { cache: 'no-cache' }).then(function (y) { if (y && y.ok && y.type === 'basic') c.put(anahtar, y.clone()); return y; });
      if (kayitli) { e.waitUntil(ag.catch(function () {})); return kayitli; }
      return ag.catch(function () { return new Response('Bağlantı yok', { status: 503 }); });
    });
  }));
});
