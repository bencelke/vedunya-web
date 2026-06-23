import "server-only";

export type WebPushConfig = {
  publicKey: string;
  privateKey: string;
  subject: string;
};

export function getWebPushPublicKey(): string | null {
  const value = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY?.trim();
  return value ? value : null;
}

export function getWebPushConfig(): WebPushConfig | null {
  const publicKey = getWebPushPublicKey();
  const privateKey = process.env.WEB_PUSH_PRIVATE_KEY?.trim();
  const subject =
    process.env.WEB_PUSH_SUBJECT?.trim() ?? "mailto:support@vedunya.com";

  if (!publicKey || !privateKey) {
    return null;
  }

  return { publicKey, privateKey, subject };
}

export function isWebPushConfigured(): boolean {
  return getWebPushConfig() !== null;
}
