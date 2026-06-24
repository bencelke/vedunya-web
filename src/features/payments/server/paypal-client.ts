import "server-only";

import {
  getPayPalApiBaseUrl,
  getPayPalConfig,
  type PayPalConfig,
} from "@/features/payments/server/paypal-config";

type AccessTokenCache = {
  token: string;
  expiresAt: number;
};

let tokenCache: AccessTokenCache | null = null;

export class PayPalApiError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, statusCode: number, code = "paypal_api_error") {
    super(message);
    this.name = "PayPalApiError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

async function fetchAccessToken(config: PayPalConfig): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) {
    return tokenCache.token;
  }

  const credentials = Buffer.from(
    `${config.clientId}:${config.clientSecret}`,
    "utf8",
  ).toString("base64");

  const response = await fetch(`${getPayPalApiBaseUrl(config.env)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new PayPalApiError("Unable to authenticate with PayPal.", response.status);
  }

  const data = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!data.access_token) {
    throw new PayPalApiError("PayPal access token missing.", 502);
  }

  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 300) * 1000,
  };

  return data.access_token;
}

export async function paypalRequest<T>(input: {
  path: string;
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
}): Promise<T> {
  const config = getPayPalConfig();
  if (!config) {
    throw new PayPalApiError("PayPal is not configured.", 503, "paypal_not_configured");
  }

  const token = await fetchAccessToken(config);
  const response = await fetch(`${getPayPalApiBaseUrl(config.env)}${input.path}`, {
    method: input.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: input.body === undefined ? undefined : JSON.stringify(input.body),
  });

  const text = await response.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    const message =
      parsed &&
      typeof parsed === "object" &&
      "message" in parsed &&
      typeof (parsed as { message?: string }).message === "string"
        ? (parsed as { message: string }).message
        : "PayPal request failed.";
    throw new PayPalApiError(message, response.status);
  }

  return parsed as T;
}

export function resetPayPalTokenCacheForTests(): void {
  tokenCache = null;
}
