/**
 * Service Worker para Jogo na Hora - PWA Completo
 * Cache estático + stale-while-revalidate + offline-first
 * Suporte a background sync, push notifications (futuro), periodic sync
 */

const CACHE_NAME = 'jogo-na-hora-v1';
const STATIC_ASSETS = [
  '/Projeto-Loteria/',
  '/Projeto-Loteria/index.html',
  '/Projeto-Loteria/site.webmanifest',
  '/Projeto-Loteria/favicon.svg',
];

const CACHE_STRATEGIES = {
  // Cache-first: assets imutáveis (hash no filename)
  immutable: ['/assets/', '.js', '.css', '.woff2', '.woff', '.png', '.jpg', '.svg', '.ico'],
  
  // Stale-while-revalidate: dados que mudam pouco
  staleWhileRevalidate: ['/data/', '/api/'],
  
  // Network-first: HTML pages (sempre fresco)
  networkFirst: ['text/html'],
  
  // Network-only: APIs mutáveis
  networkOnly: ['/api/'],
};

// Instalação - cache assets estáticos + skipWaiting
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação - limpar caches antigos + clients.claim
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Helper: determinar estratégia baseada na request
function getCacheStrategy(request) {
  const url = new URL(request.url);
  
  // Network-only para APIs mutáveis
  if (CACHE_STRATEGIES.networkOnly.some((path) => url.pathname.startsWith(path))) {
    return 'network-only';
  }
  
  // Network-first para HTML (sempre fresco)
  if (request.headers.get('accept')?.includes('text/html')) {
    return 'network-first';
  }
  
  // Cache-first para assets imutáveis (hash no filename)
  if (CACHE_STRATEGIES.immutable.some((path) => url.pathname.startsWith(path) || request.url.endsWith(path))) {
    return 'cache-first';
  }
  
  // Stale-while-revalidate para dados que mudam pouco
  if (CACHE_STRATEGIES.staleWhileRevalidate.some((path) => url.pathname.startsWith(path))) {
    return 'stale-while-revalidate';
  }
  
  // Default: network-first
  return 'network-first';
}

// Fetch handler com estratégias múltiplas
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requests não-GET
  if (request.method !== 'GET') return;
  
  // Ignorar requests cross-origin
  if (url.origin !== location.origin) return;
  
  const strategy = getCacheStrategy(request);
  
  switch (strategy) {
    case 'network-only':
      event.respondWith(fetch(request));
      break;
      
    case 'network-first':
      event.respondWith(networkFirst(request));
      break;
      
    case 'cache-first':
      event.respondWith(cacheFirst(request));
      break;
      
    case 'stale-while-revalidate':
      event.respondWith(staleWhileRevalidate(request));
      break;
      
    default:
      event.respondWith(networkFirst(request));
  }
});

// Network-first: tenta rede, fallback cache
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

// Cache-first: cache primeiro, rede como fallback
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Fallback para página offline se disponível
    const offline = await caches.match('/Projeto-Loteria/offline.html');
    if (offline) return offline;
    throw error;
  }
}

// Stale-while-revalidate: retorna cache imediatamente, atualiza em background
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const cache = caches.open(CACHE_NAME);
      cache.then((c) => c.put(request, response.clone()));
    }
    return response;
  }).catch(() => {}); // Silencioso - cache serve como fallback
  
  return cached || fetchPromise;
}

// Background Sync para ações offline (futuro)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-games') {
    event.waitUntil(syncGames());
  }
});

async function syncGames() {
  // Futuro: sincronizar jogos salvos offline quando voltar online
  console.log('[SW] Background sync: sync-games');
}

// Periodic Background Sync (futuro)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-data') {
    event.waitUntil(updateData());
  }
});

async function updateData() {
  // Futuro: atualizar dados JSON periodicamente
  console.log('[SW] Periodic sync: update-data');
}

// Push Notifications (futuro)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/Projeto-Loteria/assets/icon-192.png',
    badge: '/Projeto-Loteria/assets/badge-72.png',
    vibrate: [100, 50, 100],
    data: data.url || '/Projeto-Loteria/',
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'dismiss', title: 'Dispensar' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clients) => {
        for (const client of clients) {
          if (client.url.includes('Projeto-Loteria') && 'focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow('/Projeto-Loteria/');
      })
    );
  }
});

// Mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data === 'cache-clear') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
  
  if (event.data === 'cache-size') {
    caches.open(CACHE_NAME).then((cache) => {
      cache.keys().then((keys) => {
        event.ports[0].postMessage({ size: keys.length });
      });
    });
  }
});

/**
 * Utilitário: limpar cache antigo (útil para debug)
 */
async function clearOldCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter((name) => name !== CACHE_NAME)
      .map((name) => caches.delete(name))
  );
}

/**
 * Utilitário: pré-carregar assets críticos
 */
async function precacheCriticalAssets() {
  const cache = await caches.open(CACHE_NAME);
  return cache.addAll(STATIC_ASSETS);
}