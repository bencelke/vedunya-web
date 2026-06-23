import { createHash } from "node:crypto";

export function hashSubscriptionEndpoint(endpoint: string): string {
  return createHash("sha256").update(endpoint.trim()).digest("hex");
}
