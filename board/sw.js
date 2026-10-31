// Cue Board offline: Seite zuerst aus dem Netz (für Updates), sonst aus dem Cache
const CACHE = 'cueboard-v1';
const CORE = ['./', 'index.html', 'manifest.json', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'flasche1.wav', 'flasche2.wav'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('cueboard-') && k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
function put(req, res){ if (res && (res.ok || res.type === 'opaque')){ const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return res; }
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  if (req.mode === 'navigate'){
    e.respondWith(new Promise(resolve => {
      let done = false;
      const fallback = () => caches.match('index.html').then(r => { if (!done){ done = true; resolve(r || fetch(req)); } });
      const t = setTimeout(fallback, 2500);
      fetch(req).then(res => { clearTimeout(t); put('index.html', res.clone()); if (!done){ done = true; resolve(res); } }).catch(() => { clearTimeout(t); fallback(); });
    }));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => put(req, res))));
});
