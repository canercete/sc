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
/* V478: uygulama bildirimi — sunucu (Firebase) gönderir, telefon burada gösterir. Başka uygulama gerekmez. */
self.addEventListener('push', function (e) {
  var d = {};
  try { var j = e.data ? e.data.json() : {}; d = j.data || (j.notification ? { t: j.notification.title, b: j.notification.body } : j) || {}; }
  catch (x) { d = { t: 'SC İletişim', b: e.data ? e.data.text() : '' }; }
  var opt = { body: d.b || '', icon: 'apple-touch-icon.png', badge: 'favicon-32.png', data: { u: d.u || self.registration.scope } };
  if (d.g) { opt.tag = d.g + '-' + Date.now(); }
  e.waitUntil(self.registration.showNotification(d.t || 'SC İletişim', opt));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var hedef = (e.notification.data && e.notification.data.u) || self.registration.scope;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (l) {
    for (var i = 0; i < l.length; i++) { if (l[i].url.indexOf(self.registration.scope) === 0 && 'focus' in l[i]) return l[i].focus(); }
    return self.clients.openWindow ? self.clients.openWindow(hedef) : null;
  }));
});
