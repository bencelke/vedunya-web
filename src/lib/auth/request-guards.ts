import "server-only";

import type { NextRequest } from "next/server";

import { appConfig } from "@/config/app-config";

export function isAllowedRequestOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }

  const host = request.headers.get("host");
  if (!host) {
    return false;
  }

  try {
    const originUrl = new URL(origin);
    const allowedHosts = new Set<string>([host]);

    try {
      const productionHost = new URL(appConfig.productionUrl).host;
      allowedHosts.add(productionHost);
    } catch {
      // Ignore invalid production URL during local development.
    }

    if (process.env.NODE_ENV !== "production") {
      allowedHosts.add("localhost:3000");
      allowedHosts.add("127.0.0.1:3000");
    }

    return allowedHosts.has(originUrl.host);
  } catch {
    return false;
  }
}

export function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}
