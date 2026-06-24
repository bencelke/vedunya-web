/* Mystic PWA service worker — offline shell + Web Push handling. */
const CACHE_VERSION = "mystic-shell-v2";
const SHELL_CACHE = `mystic-shell-${CACHE_VERSION}`;
const STATIC_CACHE = `mystic-static-${CACHE_VERSION}`;

const SHELL_URLS = [
  "/en/offline",
  "/ru/offline",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/apple-touch-icon.png",
];

const NEVER_CACHE_PATTERNS = [
  /\/api\//,
  /\/__\/auth\//,
  /identitytoolkit/,
  /securetoken/,
  /firebaseapp\.com/,
  /googleapis\.com\/identity/,
];

function shouldNeverCache(url) {
  return NEVER_CACHE_PATTERNS.some((pattern) => pattern.test(url.href));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith("mystic-") && !key.includes(CACHE_VERSION),
            )
            .map((key) => caches.delete(key)),
        ),
      ),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    event.waitUntil(self.skipWaiting().then(() => self.clients.claim()));
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }
  if (shouldNeverCache(url)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigate(request));
    return;
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/assets/")
  ) {
    event.respondWith(handleStatic(request));
  }
});

async function handleNavigate(request) {
  try {
    return await fetch(request);
  } catch {
    const url = new URL(request.url);
    const localeMatch = url.pathname.match(/^\/(en|ru)(\/|$)/);
    const locale = localeMatch ? localeMatch[1] : "en";
    const offline = await caches.match(`/${locale}/offline`);
    if (offline) {
      return offline;
    }
    const fallback = await caches.match("/en/offline");
    if (fallback) {
      return fallback;
    }
    return new Response("Offline", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

async function handleStatic(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return cached || Response.error();
  }
}

const DEFAULT_NOTIFICATION = {
  title: "Mystic",
  body: "Your daily guidance is ready.",
  url: "/en/today",
  tag: "mystic-reminder",
  lang: "en",
};

function parsePushPayload(event) {
  if (!event.data) {
    return { ...DEFAULT_NOTIFICATION };
  }

  try {
    const parsed = event.data.json();
    if (!parsed || typeof parsed !== "object") {
      return { ...DEFAULT_NOTIFICATION };
    }

    return {
      title:
        typeof parsed.title === "string" && parsed.title.trim()
          ? parsed.title
          : DEFAULT_NOTIFICATION.title,
      body:
        typeof parsed.body === "string" && parsed.body.trim()
          ? parsed.body
          : DEFAULT_NOTIFICATION.body,
      url:
        typeof parsed.url === "string" && parsed.url.trim()
          ? parsed.url
          : DEFAULT_NOTIFICATION.url,
      tag:
        typeof parsed.tag === "string" && parsed.tag.trim()
          ? parsed.tag
          : DEFAULT_NOTIFICATION.tag,
      lang: parsed.lang === "ru" ? "ru" : "en",
      reminderType:
        parsed.reminderType === "morning" ||
        parsed.reminderType === "midday" ||
        parsed.reminderType === "evening" ||
        parsed.reminderType === "universeRequest" ||
        parsed.reminderType === "test"
          ? parsed.reminderType
          : undefined,
    };
  } catch {
    const text = event.data.text();
    return {
      ...DEFAULT_NOTIFICATION,
      body: text && text.trim() ? text.trim() : DEFAULT_NOTIFICATION.body,
    };
  }
}

self.addEventListener("push", (event) => {
  const payload = parsePushPayload(event);

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: payload.tag,
      lang: payload.lang,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      data: {
        url: payload.url,
        reminderType: payload.reminderType,
      },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl =
    event.notification.data &&
    typeof event.notification.data.url === "string" &&
    event.notification.data.url.trim()
      ? event.notification.data.url
      : DEFAULT_NOTIFICATION.url;

  const absoluteUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ("focus" in client) {
            return client.focus();
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(absoluteUrl);
        }

        return undefined;
      }),
  );
});

self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(Promise.resolve());
});
