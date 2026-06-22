import { getFirebaseAdminAuth } from "@/lib/firebase-admin/auth";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin/config";
import { jsonError } from "@/lib/auth/request-guards";
import { verifySessionCookie } from "@/lib/auth/session";

export async function GET(): Promise<Response> {
  if (!isFirebaseAdminConfigured()) {
    return jsonError("Server authentication is not configured.", 503);
  }

  const session = await verifySessionCookie();
  if (session.status !== "authenticated") {
    return Response.json({ user: null });
  }

  const adminAuth = getFirebaseAdminAuth();
  if (!adminAuth) {
    return jsonError("Server authentication is not configured.", 503);
  }

  try {
    const userRecord = await adminAuth.getUser(session.user.uid);
    return Response.json({
      user: {
        uid: userRecord.uid,
        email: userRecord.email ?? null,
        emailVerified: userRecord.emailVerified,
      },
    });
  } catch {
    return Response.json({ user: null });
  }
}
