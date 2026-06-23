import { appConfig } from "@/config/app-config";

export const isProductionRuntime = process.env.NODE_ENV === "production";

export const isPwaEnabled =
  isProductionRuntime && process.env.NEXT_PUBLIC_ENABLE_PWA !== "false";

export const pwaConfig = {
  name: appConfig.name,
  shortName: appConfig.shortName,
  description:
    "Daily guidance, moon rhythm, runes, and knowledge paths by Vedunya Maria.",
  startUrl: "/en/today",
  scope: "/",
  display: "standalone" as const,
  orientation: "portrait" as const,
  themeColor: "#0B0D14",
  backgroundColor: "#0B0D14",
  categories: ["lifestyle", "education"] as const,
  lang: "en",
  dir: "ltr" as const,
  serviceWorkerPath: "/sw.js",
  icons: {
    icon192: "/icons/icon-192x192.png",
    icon512: "/icons/icon-512x512.png",
    icon512Maskable: "/icons/icon-512x512-maskable.png",
    appleTouchIcon: "/icons/apple-touch-icon.png",
  },
} as const;

export const PWA_NEVER_CACHE_PATTERNS = [
  /\/api\//,
  /\/__\/auth\//,
  /identitytoolkit/,
  /securetoken/,
  /firebaseapp\.com/,
  /googleapis\.com\/identity/,
] as const;
