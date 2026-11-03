/* 321學神神學（三） Service Worker（單檔版）
   · 網頁、程式、資料（html／js／json／css）：網路優先（略過瀏覽器 HTTP 快取），離線才用快取
   · 圖片等其他同源資源：快取優先
   · 新版裝好後 skipWaiting 並接手；頁面的 AU 掛件會在空閒時自動重整換新版，忙碌時只顯示更新條
   · 同一個 github.io 網域共用 Cache Storage：清舊快取只清自己的前綴（PFX） */
const CACHE_VERSION = 'g321theo3-v1.4-co1-gp1103-au1103';
const PFX = 'g321theo3-';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './coread.js', './peerjs.min.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_VERSION).then(c => Promise.all(CORE.map(u =>
    fetch(new Request(u, { cache: 'reload' })).then(r => { if (r && r.ok) return c.put(u, r); }).catch(() => {})
  ))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE_VERSION && k.indexOf(PFX) === 0).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('message', e => {
  const d = e.data;
  if (d === 'skip' || (d && (d.type === 'SKIP_WAITING' || d.t === 'skip'))) self.skipWaiting();
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.headers.has('range') || /\.(mp3|m4a|aac|wav|ogg|opus|flac|mp4|mov|webm)$/i.test(url.pathname)) return;
  const nav = req.mode === 'navigate';
  if (nav || /\.(html|js|json|css|webmanifest)$/i.test(url.pathname) || url.pathname.endsWith('/')) {
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(r => {
      if (r && r.ok) { const cp = r.clone(); caches.open(CACHE_VERSION).then(c => c.put(nav ? './index.html' : req, cp)); }
      return r;
    }).catch(() => (nav ? caches.match('./index.html') : caches.match(req, { ignoreSearch: true }))
      .then(m => m || caches.match(req, { ignoreSearch: true })).then(m => m || new Response('offline', { status: 503 }))));
    return;
  }
  e.respondWith(caches.match(req).then(m => m || fetch(req).then(r => {
    if (r && r.ok && r.type === 'basic') { const cp = r.clone(); caches.open(CACHE_VERSION).then(c => c.put(req, cp)); }
    return r;
  })));
});
