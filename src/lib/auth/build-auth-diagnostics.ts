import type { ProfileSnapshot } from "@/features/profile/types/user-profile";
import type { AuthDiagnostics } from "@/lib/firebase/live-firebase-diagnostic";

export function buildAuthDiagnostics(input: {
  sessionVerified: boolean;
  profile: ProfileSnapshot | null;
}): AuthDiagnostics {
  const profile = input.profile;

  return {
    authenticated: input.sessionVerified,
    sessionVerified: input.sessionVerified,
    publicProfileExists: profile?.publicProfile != null,
    privateProfileExists: profile?.privateProfile != null,
    dobPresent: profile?.dateOfBirth != null,
    profileComplete: profile?.profileComplete === true,
    localePresent: profile?.language != null,
    authProviderCount: profile?.authProviders?.length ?? 0,
  };
}

export function sanitizeAuthDiagnosticsForResponse(
  diagnostics: AuthDiagnostics,
): AuthDiagnostics {
  return { ...diagnostics };
}
