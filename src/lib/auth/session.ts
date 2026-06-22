import "server-only";

import { cookies } from "next/headers";

import { getFirebaseAdminAuth } from "@/lib/firebase-admin/auth";
import {
  getSessionCookieName,
  SESSION_COOKIE_MAX_AGE_MS,
} from "@/lib/firebase-admin/config";
import type { AuthSessionResult, SessionUser } from "@/types/auth";

export async function getSessionCookieValue(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(getSessionCookieName())?.value;
  return value && value.length > 0 ? value : null;
}

export async function verifySessionCookie(): Promise<AuthSessionResult> {
  const sessionCookie = await getSessionCookieValue();
  if (!sessionCookie) {
    return { status: "unauthenticated" };
  }

  const adminAuth = getFirebaseAdminAuth();
  if (!adminAuth) {
    return { status: "unauthenticated" };
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const user: SessionUser = {
      uid: decoded.uid,
      email: decoded.email ?? null,
      emailVerified: decoded.email_verified ?? false,
    };
    return { status: "authenticated", user };
  } catch {
    return { status: "unauthenticated" };
  }
}

export { SESSION_COOKIE_MAX_AGE_MS, getSessionCookieName };
