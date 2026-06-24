// Attendance App — Service Worker
// Plain script (no ES module imports — service workers don't support them)

const CACHE_NAME = 'attendance-v3';
const OFFLINE_URL = '/offline.html';
const ASSETS_TO_CACHE = [
  '/',
  '/offline.html',
  '/favicon.svg',
  '/icon-192.png',
  '/manifest.json',
];

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(ASSETS_TO_CACHE.filter(Boolean))
    )
  );
  self.skipWaiting();
});

// ── Activate ──────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && !k.startsWith('workbox-'))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch — serve cached app shell offline ────────────────────────────────────
self.addEventListener('fetch', (event) => {
  // Only handle navigation requests for offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  }
});

// ── Push notifications ────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'Attendance Update', body: 'You have a new notification' };
  try {
    data = event.data.json();
  } catch (_) {}

  // 8-hour checkout reminders stay on screen until dismissed
  const is8HrReminder = data.tag === 'checkout-8hr-reminder';

  const options = {
    body: data.body || '',
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    tag: data.tag || `attendance-${Date.now()}`,
    renotify: true,
    vibrate: is8HrReminder ? [300, 100, 300, 100, 300] : [200, 100, 200],
    requireInteraction: is8HrReminder, // keeps notification visible until user acts
    data: { url: data.url || '/' },
    actions: is8HrReminder
      ? [
          { action: 'checkout', title: '✅ Check Out Now' },
          { action: 'dismiss',  title: 'Later' },
        ]
      : [
          { action: 'open',    title: 'Open' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(data.title || 'Attendance', options),
      // Notify open app tabs to refresh
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          client.postMessage({ type: 'NOTIFICATION_RECEIVED' });
        }
      }),
    ])
  );
});

// ── Notification click ────────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  // 'checkout' action and 'open' both navigate to dashboard
  const targetUrl = event.action === 'checkout'
    ? '/dashboard'
    : (event.notification.data?.url || '/');

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

// ── Push subscription change ──────────────────────────────────────────────────
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe(event.oldSubscription.options)
      .then((newSub) =>
        fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: newSub }),
        })
      )
  );
});