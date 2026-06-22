import { describe, expect, it } from "vitest";

import { preservesProtectedPublicFields } from "@/features/profile/utils/bootstrap-merge-logic";
import { buildBootstrapPublicPatch } from "@/features/profile/utils/bootstrap-merge-logic";

describe("bootstrap merge safety on existing Mystic users", () => {
  it("does not patch premium or admin fields for existing profiles", () => {
    const existing = {
      uid: "user-1",
      displayName: "Maria",
      isPremium: true,
      premiumOverride: false,
      isOwner: true,
      isAdmin: false,
      role: "user",
      profileComplete: true,
    };

    const patch = buildBootstrapPublicPatch({
      user: {
        uid: "user-1",
        displayName: "Maria",
        photoURL: null,
        providerData: [{ providerId: "password" } as never],
      },
      existing,
      now: "SERVER_TIMESTAMP",
    });

    expect(preservesProtectedPublicFields(existing, patch)).toBe(true);
    expect(patch?.isPremium).toBeUndefined();
    expect(patch?.isOwner).toBeUndefined();
    expect(patch?.profileComplete).toBeUndefined();
  });

  it("creates shell only for missing public profile documents", () => {
    const shell = buildBootstrapPublicPatch({
      user: {
        uid: "user-2",
        displayName: "Alex",
        photoURL: null,
        providerData: [{ providerId: "google.com" } as never],
      },
      existing: {},
      languageCode: "en",
      now: "SERVER_TIMESTAMP",
    });

    expect(shell?.profileComplete).toBeUndefined();
    expect(shell?.isPremium).toBe(false);
  });
});
