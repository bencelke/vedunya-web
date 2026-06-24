import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Keep firebase-admin out of the Turbopack server bundle (Vercel ESM/CJS fix).
  serverExternalPackages: ["firebase-admin"],
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    if (process.env.NODE_ENV !== "production") {
      return [{ source: "/sw.js", destination: "/sw-dev-noop.js" }];
    }

    return [];
  },
};

export default withNextIntl(nextConfig);
