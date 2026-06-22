import { describe, expect, it } from "vitest";

import { buildAuthDiagnostics } from "@/lib/auth/build-auth-diagnostics";

describe("buildAuthDiagnostics", () => {
  it("returns unauthenticated diagnostics without profile data", () => {
    const result = buildAuthDiagnostics({
      sessionVerified: false,
      profile: null,
    });

    expect(result).toEqual({
      authenticated: false,
      sessionVerified: false,
      publicProfileExists: false,
      privateProfileExists: false,
      dobPresent: false,
      profileComplete: false,
      localePresent: false,
      authProviderCount: 0,
    });
  });

  it("returns safe booleans for authenticated profile without exposing values", () => {
    const result = buildAuthDiagnostics({
      sessionVerified: true,
      profile: {
        uid: "hidden-uid",
        displayName: "Hidden Name",
        email: "hidden@example.com",
        dateOfBirth: new Date(1990, 2, 15),
        language: "en",
        profileComplete: true,
        authProviders: ["password", "google.com"],
        publicProfile: {
          uid: "hidden-uid",
          displayName: "Hidden Name",
          profileComplete: true,
          isPremium: true,
          premiumOverride: false,
          isOwner: false,
          isAdmin: false,
        },
        privateProfile: {
          uid: "hidden-uid",
          email: "hidden@example.com",
          dob: new Date(1990, 2, 15),
          profileComplete: true,
        },
      },
    });

    expect(result).toEqual({
      authenticated: true,
      sessionVerified: true,
      publicProfileExists: true,
      privateProfileExists: true,
      dobPresent: true,
      profileComplete: true,
      localePresent: true,
      authProviderCount: 2,
    });

    expect(JSON.stringify(result)).not.toContain("hidden");
    expect(JSON.stringify(result)).not.toContain("1990");
    expect(JSON.stringify(result)).not.toContain("premium");
  });
});

describe("dev auth diagnostics contract", () => {
  it("does not include sensitive field names in diagnostics shape", () => {
    const keys = Object.keys(
      buildAuthDiagnostics({ sessionVerified: true, profile: null }),
    );

    expect(keys).not.toContain("uid");
    expect(keys).not.toContain("email");
    expect(keys).not.toContain("dob");
    expect(keys).not.toContain("displayName");
  });
});
