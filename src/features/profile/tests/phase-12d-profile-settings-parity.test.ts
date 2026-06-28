import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { profilePersonalDetailsSchema } from "@/features/profile/schemas/onboarding-schema";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

describe("Phase 12D — Profile sections", () => {
  it("renders Flutter-parity profile screen sections", () => {
    const source = readSource("src/features/profile/components/profile-content.tsx");
    expect(source).toContain("ProfilePageHeader");
    expect(source).toContain("ProfileHero");
    expect(source).toContain("ProfileSectionLabel");
    expect(source).toContain("ProfileCosmicPanel");
    expect(source).toContain("ProfileActionRow");
    expect(source).toContain("NotificationSettingsPanel");
    expect(source).toContain("ProfileEditPanel");
  });

  it("hides UID and raw debug fields from Profile UI", () => {
    const components = [
      "src/features/profile/components/profile-content.tsx",
      "src/features/profile/components/profile-account-section.tsx",
      "src/features/profile/components/profile-personal-details-section.tsx",
    ];
    for (const path of components) {
      const source = readSource(path);
      expect(source).not.toContain("profile.uid");
      expect(source).not.toContain("{uid}");
      expect(source).not.toContain("authProviders[0]");
      expect(source).not.toContain("publicProfile");
    }
  });

  it("does not show admin controls in Profile content", () => {
    const source = readSource("src/features/profile/components/profile-content.tsx");
    expect(source).not.toContain("isAdmin");
    expect(source).not.toContain("AdminControl");
  });
});

describe("Phase 12D — localization EN/RU", () => {
  it("includes account section labels in EN and RU", () => {
    expect(en.profile.account.signedInAs).toBe("Signed in as");
    expect(ru.profile.account.signedInAs).toBe("Вы вошли как");
    expect(en.profile.personalDetails.description).toContain("personal day rhythm");
    expect(ru.profile.personalDetails.description).toContain("личного ритма дня");
  });

  it("includes language section copy in EN and RU", () => {
    expect(en.profile.language.title).toBe("Language");
    expect(ru.profile.language.title).toBe("Язык");
  });

  it("RU profile avoids known EN fallback strings", () => {
    const ruProfile = JSON.stringify(ru.profile);
    expect(ruProfile).not.toContain("Signed in as");
    expect(ruProfile).not.toContain("Personal details");
    expect(ruProfile).not.toContain("Sign out");
    expect(ru.profile.logout.action).toBe("Выйти");
  });
});

describe("Phase 12D — Request and Reminders integration", () => {
  it("loads universe request summary for Profile notifications gate", () => {
    const page = readSource("src/app/[locale]/profile/page.tsx");
    expect(page).toContain("readUniverseRequest");
  });

  it("wraps notification settings behind Profile notifications row", () => {
    const source = readSource("src/features/profile/components/profile-content.tsx");
    expect(source).toContain("NotificationSettingsPanel");
    expect(source).not.toContain("endpoint");
  });
});

describe("Phase 12D — Mystic Plus placeholder", () => {
  it("links Profile Mystic Plus rows to paywall without checkout buttons", () => {
    const source = readSource("src/features/profile/components/profile-content.tsx");
    expect(source).toContain('href="/plus"');
    expect(source).not.toContain("PayPal");
    expect(source).not.toContain("paypalConfigured");
    expect(en.profile.subscription.webNote).toContain("soon");
    expect(ru.profile.subscription.webNote).toContain("скоро");
  });
});

describe("Phase 12D — Legal and Support", () => {
  it("includes disclaimer text and support email", () => {
    expect(en.profile.legal.disclaimerText).toContain("not medical");
    expect(ru.profile.legal.disclaimerText).toContain("не медицинская");
    expect(en.profile.support.email).toBe("vedunyamaria@gmail.com");
    expect(ru.profile.support.email).toBe("vedunyamaria@gmail.com");
  });

  it("links Profile App & Legal rows to trust pages", () => {
    const source = readSource("src/features/profile/components/profile-content.tsx");
    expect(source).toContain("TRUST_ROUTES.privacy");
    expect(source).toContain("TRUST_ROUTES.terms");
    expect(source).toContain("TRUST_ROUTES.support");
    expect(source).toContain("TRUST_ROUTES.about");
  });
});

describe("Phase 12D — profile validation and merge", () => {
  it("validates personal details DOB format", () => {
    expect(
      profilePersonalDetailsSchema.safeParse({
        displayName: "Maria",
        dateOfBirth: "1990-05-12",
      }).success,
    ).toBe(true);
    expect(
      profilePersonalDetailsSchema.safeParse({
        displayName: "Maria",
        dateOfBirth: "invalid",
      }).success,
    ).toBe(false);
  });

  it("uses merge-safe profile update service", () => {
    const service = readSource("src/features/profile/services/profile-bootstrap-service.ts");
    expect(service).toContain("merge: true");
  });

  it("logout clears push and navigates home", () => {
    const source = readSource("src/features/profile/components/profile-content.tsx");
    expect(source).toContain("disablePushOnLogout");
    expect(source).toContain('router.replace("/")');
  });
});
