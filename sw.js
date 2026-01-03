const CACHE_NAME = 'meds-v1';
const ASSETS = ['./', './index.html', './app.js', './manifest.json'];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request))
    );
});

self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: 'icon-192.png',
        badge: 'icon-192.png'
    };
    event.waitUntil(self.registration.showNotification('Medicine Tracker', options));
});