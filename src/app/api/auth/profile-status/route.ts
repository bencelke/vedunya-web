import { getProfileSnapshot } from "@/features/profile/services/profile-repository";
import { resolveProfileStatus } from "@/features/profile/utils/resolve-profile-status";
import { verifySessionCookie } from "@/lib/auth/session";

export async function GET(): Promise<Response> {
  const session = await verifySessionCookie();
  if (session.status !== "authenticated") {
    return Response.json(
      resolveProfileStatus(null, false),
    );
  }

  const profile = await getProfileSnapshot(session.user.uid);

  return Response.json(resolveProfileStatus(profile, true));
}
