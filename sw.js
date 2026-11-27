
const CACHE = 'tjzsb-1795761602931';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  var isPage = e.request.mode === 'navigate' || url.pathname.slice(-1) === '/' || url.pathname.indexOf('index.html') >= 0;
  if (isPage) {
    e.respondWith(caches.open(CACHE).then(function (c) {
      return c.match('./index.html').then(function (cached) {
        var net = fetch(e.request, { cache: 'no-store' }).then(function (resp) {
          c.put('./index.html', resp.clone());
          return resp;
        });
        e.waitUntil(net.catch(function () {}));
        return cached || net;
      });
    }));
    return;
  }
  e.respondWith(caches.match(e.request).then(function (r) {
    return r || fetch(e.request).then(function (resp) {
      var cp = resp.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, cp); });
      return resp;
    });
  }));
});
