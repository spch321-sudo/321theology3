/* 321學神神學（三） Service Worker（單檔版）
   · 網頁、程式、資料（html／js／json／css）：網路優先（略過瀏覽器 HTTP 快取），離線才用快取
   · 圖片等其他同源資源：快取優先
   · 新版裝好後 skipWaiting 並接手；頁面的 AU 掛件會在空閒時自動重整換新版，忙碌時只顯示更新條
   · 同一個 github.io 網域共用 Cache Storage：清舊快取只清自己的前綴（PFX） */
const CACHE_VERSION = 'g321theo3-v1.5-co1-gp1103-au1103-xz1103-xzm1103-md1104-rf1105-cs1109';
const PFX = 'g321theo3-';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './xz2.js', './xzm.js', './coread.js', './cpar.js', './peerjs.min.js'];

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
    /* rf1105：version.json（更新偵測）維持純網路優先；其餘殼層檔網路請求與 1 秒計時賽跑，慢網路先用「完全相同」的快取，網路那份繼續下載更新快取 */
    if (!/\/version\.json$/i.test(url.pathname)) { e.respondWith(shellFetch(req, nav, url)); return; }
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

/* rf1105：殼層（index.html 約 11MB、js、json）網路優先 + SHELL_WAIT 毫秒競速。
   快取只在「自己的」CACHE_VERSION 裡找，不碰同網域別的 App；只有導覽請求才可退回 index.html（程式檔退回 html 會變 SyntaxError）。 */
const SHELL_WAIT = 1000;
async function shellFetch(req, nav, url) {
  const key = nav ? './index.html' : req;
  const own = () => caches.open(CACHE_VERSION).then(c => c.match(key, nav ? undefined : { ignoreSearch: true }));
  const net = fetch(req, { cache: 'no-cache' }).then(res => {
    if (res && res.ok) { const cp = res.clone(); caches.open(CACHE_VERSION).then(c => c.put(key, cp)).catch(() => {}); }
    return res;
  });
  try {
    const first = await Promise.race([net, new Promise(ok => setTimeout(() => ok(null), SHELL_WAIT))]);
    if (first) return first;
    const hit = await own();
    if (hit) { net.catch(() => {}); return hit; }
    return await net;
  } catch (err) {
    const hit = await own();
    if (hit) return hit;
    const any = await caches.match(req, { ignoreSearch: true });
    if (any && any.url && any.url.indexOf(url.origin + url.pathname.replace(/[^/]*$/, '')) === 0) return any;
    return new Response('offline', { status: 503 });
  }
}
