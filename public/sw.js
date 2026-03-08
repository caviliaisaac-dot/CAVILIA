const CACHE_NAME = 'cavilia-v5'

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/images/emblem.png',
  '/images/app-icon.png',
  '/images/app-icon-192.png',
  '/images/leather-real.png',
  '/logo-cavilia.png',
  '/images/cowboy-coin.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

function isNetworkFirstRequest(request) {
  if (request.mode === 'navigate') return true
  const dest = request.destination
  return dest === 'document' || dest === 'script' || dest === 'style'
}

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) return
  if (event.request.method !== 'GET') return
  if (event.request.url.includes('/api/')) return

  if (isNetworkFirstRequest(event.request)) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          return res
        })
        .catch(() => caches.match(event.request))
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  )
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('push', (event) => {
  if (!event.data) return

  let data = {
    title: '✂️ Lembrete CAVILIA',
    body: '',
    icon: '/images/app-icon.png',
    image: '/images/emblem.png',
  }

  try {
    const payload = event.data.json()
    data = { ...data, ...payload }
  } catch (_) {
    data.body = event.data.text()
  }

  const opts = {
    body: data.body,
    icon: data.icon,
    image: data.image,
    badge: '/images/app-icon.png',
    tag: data.tag || 'cavilia-reminder',
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 300],
    silent: false,
    actions: [
      { action: 'open', title: 'Ver agendamento' },
      { action: 'dismiss', title: 'Dispensar' },
    ],
    data: { url: '/', ...data },
  }

  event.waitUntil(self.registration.showNotification(data.title, opts))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') return

  const url = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.focus()
          client.navigate(url)
          return
        }
      }
      if (self.clients.openWindow) {
        self.clients.openWindow(url)
      }
    })
  )
})
