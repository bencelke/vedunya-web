import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import en from "@/messages/en.json";
import ru from "@/messages/ru.json";
import de from "@/messages/de.json";

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

describe("Phase 23A — profile Flutter parity shell", () => {
  it("renders Profile header without AppHeader language pills", () => {
    const page = readSource("src/app/[locale]/profile/page.tsx");
    const header = readSource("src/features/profile/components/profile-page-header.tsx");

    expect(page).not.toContain("AppHeader");
    expect(page).toContain("AppShell");
    expect(header).toContain('useTranslations("profile.screen")');
    expect(header).toContain("ChevronLeft");
    expect(header).toContain('router.push("/today")');
  });

  it("uses cosmic profile hero with safe display name fallback", () => {
    const hero = readSource("src/features/profile/components/profile-hero.tsx");

    expect(hero).toContain("ProfileHero");
    expect(hero).toContain("resolveDisplayName");
    expect(hero).toContain('t("fallbackName")');
    expect(hero).not.toContain("profile.uid");
    expect(hero).not.toContain("{uid}");
  });
});

describe("Phase 23A — profile sections and rows", () => {
  it("renders grouped Account, Mystic Plus, Preferences, and App & Legal sections", () => {
    const content = readSource("src/features/profile/components/profile-content.tsx");

    expect(content).toContain("ProfileSectionLabel");
    expect(content).toContain("ProfileCosmicPanel");
    expect(content).toContain("ProfileActionRow");
    expect(content).toContain('tScreen("sections.account")');
    expect(content).toContain('tScreen("sections.mysticPlus")');
    expect(content).toContain('tScreen("sections.preferences")');
    expect(content).toContain('tScreen("sections.appLegal")');
  });

  it("links Mystic Plus rows to /plus without fake checkout", () => {
    const content = readSource("src/features/profile/components/profile-content.tsx");

    expect(content).toContain('href="/plus"');
    expect(content).not.toContain("grantShopifyCourseEntitlement");
    expect(content).not.toContain("paypal");
  });

  it("renders preferences rows for universe request, notifications, and language", () => {
    const content = readSource("src/features/profile/components/profile-content.tsx");

    expect(content).toContain('tScreen("rows.universeRequest")');
    expect(content).toContain('href="/today"');
    expect(content).toContain('tScreen("rows.notifications")');
    expect(content).toContain("NotificationSettingsCard");
    expect(content).toContain('tScreen("rows.language")');
  });

  it("renders App & Legal rows with trust routes", () => {
    const content = readSource("src/features/profile/components/profile-content.tsx");

    expect(content).toContain("TRUST_ROUTES.about");
    expect(content).toContain("TRUST_ROUTES.privacy");
    expect(content).toContain("TRUST_ROUTES.terms");
    expect(content).toContain("TRUST_ROUTES.support");
  });
});

describe("Phase 23A — admin removal", () => {
  it("does not render Administration or Control Hub in profile", () => {
    const content = readSource("src/features/profile/components/profile-content.tsx");
    const page = readSource("src/app/[locale]/profile/page.tsx");

    expect(content).not.toContain("Administration");
    expect(content).not.toContain("Control Hub");
    expect(content).not.toContain("Manage feed");
    expect(content).not.toContain("admin");
    expect(content).not.toContain("isAdmin");
    expect(page).not.toContain("AdminControl");
  });
});

describe("Phase 23A — logout and provider linking honesty", () => {
  it("calls real logout with pending guard", () => {
    const content = readSource("src/features/profile/components/profile-content.tsx");

    expect(content).toContain("disablePushOnLogout");
    expect(content).toContain("signOut");
    expect(content).toContain("loggingOut");
    expect(content).toContain("if (loggingOut)");
  });

  it("does not fake Apple/Google provider linking", () => {
    const content = readSource("src/features/profile/components/profile-content.tsx");

    expect(content).not.toContain("linkWithPopup");
    expect(content).not.toContain("linkWithCredential");
    expect(content).toContain('tScreen("rows.providerComingSoon")');
    expect(content).toContain("restoreComingSoon");
  });
});

describe("Phase 23A — localization", () => {
  it("includes EN profile screen strings", () => {
    expect(en.profile.screen.pageTitle).toBe("Profile");
    expect(en.profile.screen.hero.subtitle).toContain("daily ritual");
    expect(en.profile.screen.rows.logout).toBe("Log Out");
    expect(en.profile.screen.sections.account).toBe("Account / Profile");
  });

  it("includes RU profile screen strings", () => {
    expect(ru.profile.screen.pageTitle).toBe("Профиль");
    expect(ru.profile.screen.hero.subtitle).toContain("ежедневной практики");
    expect(ru.profile.screen.rows.logout).toBe("Выйти");
    expect(ru.profile.screen.sections.account).toBe("Аккаунт / Профиль");
  });

  it("DE profile screen keys exist with English fallback values", () => {
    expect(de.profile.screen.pageTitle).toBe("Profile");
    expect(de.profile.screen.rows.notifications).toBe("Notifications");
    expect(JSON.stringify(de.profile.screen)).not.toContain("undefined");
  });
});

describe("Phase 23A — mobile layout", () => {
  it("keeps profile content in narrow container with bottom nav shell padding", () => {
    const content = readSource("src/features/profile/components/profile-content.tsx");
    const shell = readSource("src/components/layout/app-shell.tsx");

    expect(content).toContain('<Container narrow');
    expect(content).toContain("mystic-profile-page");
    expect(shell).toContain("pb-safe-nav");
    expect(shell).toContain("BottomNavigation");
  });

  it("uses tap feedback on profile action rows", () => {
    const row = readSource("src/features/profile/components/profile-action-row.tsx");

    expect(row).toContain("touch-manipulation");
    expect(row).toContain("prefetch={false}");
    expect(row).toContain("mystic-profile-action-row-interactive");
  });
});
