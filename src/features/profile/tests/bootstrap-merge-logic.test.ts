import { describe, expect, it } from "vitest";

import {
  buildBootstrapPrivatePatch,
  buildBootstrapPublicPatch,
  preservesProtectedPublicFields,
} from "@/features/profile/utils/bootstrap-merge-logic";

const mockUser = {
  uid: "user-123",
  displayName: "Maria",
  photoURL: "https://example.com/photo.jpg",
  email: "maria@example.com",
  providerData: [{ providerId: "google.com" }],
} as const;

describe("bootstrap merge logic", () => {
  it("creates only missing minimum documents for a new user", () => {
    const publicPatch = buildBootstrapPublicPatch({
      user: mockUser,
      existing: {},
      languageCode: "en",
      now: "NOW",
    });

    expect(publicPatch?.displayName).toBe("Maria");
    expect(publicPatch?.profileComplete).toBeUndefined();
    expect(publicPatch?.isPremium).toBe(false);
  });

  it("does not overwrite an existing complete public profile", () => {
    const existing = {
      displayName: "Maria K.",
      profileComplete: true,
      language: "ru",
      isPremium: true,
      isAdmin: true,
      role: "admin",
      dob: "legacy-should-not-be-written",
    };

    const patch = buildBootstrapPublicPatch({
      user: mockUser,
      existing,
      languageCode: "en",
      now: "NOW",
    });

    expect(patch?.displayName).toBeUndefined();
    expect(patch?.language).toBeUndefined();
    expect(preservesProtectedPublicFields(existing, patch)).toBe(true);
  });

  it("handles missing public profile while private profile exists", () => {
    const patch = buildBootstrapPublicPatch({
      user: mockUser,
      existing: {},
      now: "NOW",
    });

    expect(patch?.uid).toBe("user-123");
  });

  it("handles missing private profile while public profile exists", () => {
    const patch = buildBootstrapPrivatePatch({
      user: mockUser,
      existing: {},
      exists: false,
      now: "NOW",
    });

    expect(patch.createdAt).toBe("NOW");
    expect(patch.email).toBe("maria@example.com");
    expect(patch.dob).toBeUndefined();
  });

  it("preserves premium fields on existing users", () => {
    const existing = {
      isPremium: true,
      premiumOverride: true,
      profileComplete: true,
      displayName: "Maria",
    };

    const patch = buildBootstrapPublicPatch({
      user: mockUser,
      existing,
      now: "NOW",
    });

    expect(preservesProtectedPublicFields(existing, patch)).toBe(true);
  });

  it("preserves admin fields on existing users", () => {
    const existing = {
      isAdmin: true,
      isOwner: true,
      role: "admin",
      profileComplete: true,
      displayName: "Maria",
    };

    const patch = buildBootstrapPublicPatch({
      user: { ...mockUser, displayName: "Shell" },
      existing,
      now: "NOW",
    });

    expect(preservesProtectedPublicFields(existing, patch)).toBe(true);
  });

  it("is idempotent on repeated bootstrap calls", () => {
    const existingPublic = {
      displayName: "Maria",
      language: "en",
      profileComplete: true,
      photoUrl: "https://example.com/photo.jpg",
    };
    const existingPrivate = {
      email: "maria@example.com",
      profileComplete: true,
      dob: "1990-03-15",
    };

    const firstPublic = buildBootstrapPublicPatch({
      user: mockUser,
      existing: existingPublic,
      languageCode: "ru",
      now: "NOW",
    });
    const secondPublic = buildBootstrapPublicPatch({
      user: mockUser,
      existing: existingPublic,
      languageCode: "ru",
      now: "NOW",
    });

    const firstPrivate = buildBootstrapPrivatePatch({
      user: mockUser,
      existing: existingPrivate,
      exists: true,
      now: "NOW",
    });
    const secondPrivate = buildBootstrapPrivatePatch({
      user: mockUser,
      existing: existingPrivate,
      exists: true,
      now: "NOW",
    });

    expect(firstPublic).toEqual(secondPublic);
    expect(firstPublic?.profileComplete).toBeUndefined();
    expect(firstPublic?.dob).toBeUndefined();
    expect(firstPrivate).toEqual(secondPrivate);
    expect(firstPrivate.dob).toBeUndefined();
  });
});
