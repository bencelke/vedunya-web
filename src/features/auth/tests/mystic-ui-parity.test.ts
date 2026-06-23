import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { bottomNavItems, shouldShowBottomNav } from "@/config/navigation";
import { mysticTheme } from "@/config/theme";

describe("Mystic navigation parity", () => {
  it("keeps production V1 bottom navigation tabs only", () => {
    expect(bottomNavItems.map((item) => item.key)).toEqual([
      "today",
      "moon",
      "courses",
      "profile",
    ]);
  });

  it("does not expose Feed, Cards, Admin, or Runes tabs", () => {
    const hrefs = bottomNavItems.map((item) => item.href);
    expect(hrefs).not.toContain("/feed");
    expect(hrefs).not.toContain("/cards");
    expect(hrefs).not.toContain("/admin");
    expect(hrefs).not.toContain("/runes");
  });

  it("shows bottom navigation on core shell routes", () => {
    expect(shouldShowBottomNav("/today")).toBe(true);
    expect(shouldShowBottomNav("/moon")).toBe(true);
    expect(shouldShowBottomNav("/courses/living-the-runes")).toBe(true);
    expect(shouldShowBottomNav("/profile")).toBe(true);
    expect(shouldShowBottomNav("/login")).toBe(false);
    expect(shouldShowBottomNav("/onboarding")).toBe(false);
  });
});

describe("Mystic theme assets", () => {
  it("references migrated brand assets under public/assets", () => {
    expect(mysticTheme.assets.mysticLogo.startsWith("/assets/brand/")).toBe(true);
    expect(mysticTheme.assets.appBackground.startsWith("/assets/backgrounds/")).toBe(
      true,
    );
    expect(mysticTheme.assets.googleIcon).toBe("/assets/brand/google-g.svg");
  });

  it("keeps separate auth and app palettes", () => {
    expect(mysticTheme.auth.pageBg).not.toBe(mysticTheme.app.pageBg);
    expect(mysticTheme.auth.accentGold).toBeTruthy();
    expect(mysticTheme.app.accentGold).toBeTruthy();
  });
});

describe("Profile privacy in UI", () => {
  it("does not render protected identifiers in profile content source", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/features/profile/components/profile-content.tsx"),
      "utf8",
    );

    expect(source).not.toContain("profile.uid");
    expect(source).not.toContain("premiumOverride");
    expect(source).not.toContain("isAdmin");
    expect(source).not.toContain("isOwner");
  });
});
