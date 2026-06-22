import { describe, expect, it } from "vitest";

import { mapFirebaseAuthError } from "@/features/auth/utils/auth-error-map";
import { dateOfBirthSchema } from "@/features/profile/schemas/onboarding-schema";
import {
  isShellDisplayName,
  sanitizePublicProfilePatch,
} from "@/features/profile/utils/profile-merge";
import {
  getLoginRedirectPath,
  getOnboardingRedirectPath,
  getTodayRedirectPath,
} from "@/lib/auth/paths";
import { getFirebaseConfigurationStatus } from "@/lib/firebase/configuration-status";
import { validateFirebaseConfig } from "@/lib/firebase/config";
import { validateFirebaseAdminConfig } from "@/lib/firebase-admin/config";

describe("dateOfBirthSchema", () => {
  it("accepts a valid past date", () => {
    const result = dateOfBirthSchema.safeParse("1990-03-15");
    expect(result.success).toBe(true);
  });

  it("rejects future dates", () => {
    const futureYear = new Date().getFullYear() + 1;
    const result = dateOfBirthSchema.safeParse(`${futureYear}-01-01`);
    expect(result.success).toBe(false);
  });
});

describe("sanitizePublicProfilePatch", () => {
  it("removes protected fields from public profile writes", () => {
    const sanitized = sanitizePublicProfilePatch({
      displayName: "Maria",
      isPremium: true,
      isAdmin: true,
      role: "admin",
      profileComplete: true,
    });

    expect(sanitized.displayName).toBe("Maria");
    expect(sanitized.profileComplete).toBe(true);
    expect(sanitized.isPremium).toBeUndefined();
    expect(sanitized.isAdmin).toBeUndefined();
    expect(sanitized.role).toBeUndefined();
  });

  it("does not overwrite with empty strings", () => {
    const sanitized = sanitizePublicProfilePatch({
      displayName: "   ",
      language: "",
    });

    expect(Object.keys(sanitized)).toHaveLength(0);
  });
});

describe("isShellDisplayName", () => {
  it("detects placeholder names", () => {
    expect(isShellDisplayName("Vedunya Maria member")).toBe(true);
    expect(isShellDisplayName("Maria")).toBe(false);
  });
});

describe("mapFirebaseAuthError", () => {
  it("maps invalid credential codes safely", () => {
    expect(
      mapFirebaseAuthError({ code: "auth/invalid-credential" }),
    ).toBe("invalidCredential");
  });
});

describe("locale redirect paths", () => {
  it("builds locale-aware auth routes", () => {
    expect(getLoginRedirectPath("en")).toBe("/en/login");
    expect(getOnboardingRedirectPath("ru")).toBe("/ru/onboarding");
    expect(getTodayRedirectPath("en")).toBe("/en/today");
  });
});

describe("firebase configuration validation", () => {
  it("reports missing client configuration without crashing", () => {
    const result = validateFirebaseConfig({
      apiKey: "",
      authDomain: "",
      projectId: "",
      storageBucket: "",
      messagingSenderId: "",
      appId: "",
    });

    expect(result.configured).toBe(false);
    expect(result.missingKeys.length).toBeGreaterThan(0);
  });

  it("reports missing admin configuration without crashing", () => {
    const originalProjectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const originalEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const originalKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    delete process.env.FIREBASE_ADMIN_PROJECT_ID;
    delete process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    delete process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    const result = validateFirebaseAdminConfig();
    expect(result.configured).toBe(false);

    process.env.FIREBASE_ADMIN_PROJECT_ID = originalProjectId;
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL = originalEmail;
    process.env.FIREBASE_ADMIN_PRIVATE_KEY = originalKey;
  });

  it("returns safe configuration status without exposing values", () => {
    const status = getFirebaseConfigurationStatus();
    expect(status).toMatchObject({
      clientConfigured: expect.any(Boolean),
      adminConfigured: expect.any(Boolean),
      missingClientKeys: expect.any(Array),
      missingAdminKeys: expect.any(Array),
    });
    expect(JSON.stringify(status)).not.toMatch(/AIza|BEGIN PRIVATE KEY/);
  });
});
