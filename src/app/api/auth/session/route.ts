import { NextRequest, NextResponse } from "next/server";

import { isAllowedRequestOrigin, jsonError } from "@/lib/auth/request-guards";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin/auth";
import {
  getSessionCookieName,
  isFirebaseAdminConfigured,
  SESSION_COOKIE_MAX_AGE_MS,
} from "@/lib/firebase-admin/config";

const MAX_ID_TOKEN_AGE_MS = 5 * 60 * 1000;

type SessionRequestBody = {
  idToken?: string;
};

export async function POST(request: NextRequest): Promise<Response> {
  if (!isFirebaseAdminConfigured()) {
    return jsonError("Server authentication is not configured.", 503);
  }

  if (request.headers.get("content-type")?.includes("application/json") !== true) {
    return jsonError("Expected application/json.", 415);
  }

  if (!isAllowedRequestOrigin(request)) {
    return jsonError("Origin not allowed.", 403);
  }

  let body: SessionRequestBody;
  try {
    body = (await request.json()) as SessionRequestBody;
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const idToken = body.idToken?.trim();
  if (!idToken) {
    return jsonError("Missing idToken.", 400);
  }

  const adminAuth = getFirebaseAdminAuth();
  if (!adminAuth) {
    return jsonError("Server authentication is not configured.", 503);
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken, true);

    const authTimeMs = (decoded.auth_time ?? 0) * 1000;
    if (authTimeMs > 0 && Date.now() - authTimeMs > MAX_ID_TOKEN_AGE_MS) {
      return jsonError("Sign-in is too old. Please sign in again.", 401);
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_COOKIE_MAX_AGE_MS,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: getSessionCookieName(),
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(SESSION_COOKIE_MAX_AGE_MS / 1000),
    });

    return response;
  } catch {
    return jsonError("Invalid or expired credentials.", 401);
  }
}
