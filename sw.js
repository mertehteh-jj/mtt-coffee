/* เปลี่ยนเลขนี้ทุกครั้งที่แก้ index.html เพื่อบังคับให้เครื่องที่ติดตั้งไว้โหลดของใหม่ */
const CACHE = 'mtt-v13';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // ไม่แตะการเรียก API ของ Apps Script
  if (url.hostname.indexOf('script.google') >= 0 || e.request.method !== 'GET') return;
  if (url.origin !== location.origin) return;

  const isPage = e.request.mode === 'navigate' ||
                 url.pathname.endsWith('/') ||
                 url.pathname.endsWith('index.html') ||
                 url.pathname.endsWith('manifest.json');

  if (isPage) {
    /* ตัวแอป: เอาของใหม่จากเน็ตก่อนเสมอ ถ้าเน็ตล่มค่อยใช้ของที่เก็บไว้
       ทำแบบนี้เพื่อให้แก้โค้ดแล้วเครื่องที่ติดตั้งไว้เห็นของใหม่เอง */
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
    );
    return;
  }

  /* ไอคอนและไฟล์อื่น: ใช้ของที่เก็บไว้ก่อน เพราะแทบไม่เปลี่ยน */
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }))
  );
});
