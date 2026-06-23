import "server-only";

import { verifySessionCookie } from "@/lib/auth/session";
import { jsonError } from "@/lib/auth/request-guards";
import type { SessionUser } from "@/types/auth";

export async function requireApiUser(): Promise<
  { user: SessionUser } | { response: Response }
> {
  const session = await verifySessionCookie();
  if (session.status !== "authenticated") {
    return { response: jsonError("Authentication required.", 401) };
  }

  return { user: session.user };
}
