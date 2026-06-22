import { NextResponse } from "next/server";

import { buildAuthDiagnostics } from "@/lib/auth/build-auth-diagnostics";
import { verifySessionCookie } from "@/lib/auth/session";
import { getProfileSnapshot } from "@/features/profile/services/profile-repository";

export async function GET(): Promise<Response> {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  const session = await verifySessionCookie();
  if (session.status !== "authenticated") {
    return NextResponse.json(
      buildAuthDiagnostics({
        sessionVerified: false,
        profile: null,
      }),
      { status: 401 },
    );
  }

  const profile = await getProfileSnapshot(session.user.uid);

  return NextResponse.json(
    buildAuthDiagnostics({
      sessionVerified: true,
      profile,
    }),
  );
}
