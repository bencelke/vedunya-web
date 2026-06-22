import { getProfileSnapshot } from "@/features/profile/services/profile-repository";
import { verifySessionCookie } from "@/lib/auth/session";

export async function GET(): Promise<Response> {
  const session = await verifySessionCookie();
  if (session.status !== "authenticated") {
    return Response.json({ profileComplete: false, authenticated: false });
  }

  const profile = await getProfileSnapshot(session.user.uid);
  if (!profile) {
    return Response.json({
      authenticated: true,
      profileComplete: false,
    });
  }

  return Response.json({
    authenticated: true,
    profileComplete: profile.profileComplete === true,
  });
}
