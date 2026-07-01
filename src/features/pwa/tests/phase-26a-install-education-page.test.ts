import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import de from "@/messages/de.json";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";
import manifest from "@/app/manifest";

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

describe("Phase 26A — install education route", () => {
  it("defines /[locale]/install page without auth redirect", () => {
    const page = readSource("src/app/[locale]/install/page.tsx");
    expect(page).toContain("InstallEducationPage");
    expect(page).not.toContain("requireUser");
    expect(page).not.toContain("redirectAuthenticated");
  });

  it("renders RU install page copy", () => {
    expect(ru.pwa.installPage.title).toBe("Установить Mystic на телефон");
    expect(ru.pwa.installPage.step1).toContain("главный экран");
    expect(ru.pwa.installPage.platformIphoneBody).toContain("Safari");
  });

  it("renders EN install page copy", () => {
    expect(en.pwa.installPage.title).toBe("Install Mystic on your phone");
    expect(en.pwa.installPage.continueLogin).toBe("Continue to Login");
    expect(en.pwa.installPage.enterMystic).toBe("Enter Mystic");
  });

  it("DE install page uses English fallback without undefined", () => {
    expect(de.pwa.installPage.title).toBe("Install Mystic on your phone");
    expect(JSON.stringify(de.pwa.installPage)).not.toContain("undefined");
  });
});

describe("Phase 26A — install page behavior", () => {
  it("uses existing usePwaInstallState hook", () => {
    const page = readSource("src/features/pwa/components/install-education-page.tsx");
    expect(page).toContain("usePwaInstallState");
    expect(page).toContain("showIosInstructions");
    expect(page).toContain("showAndroidInstall");
    expect(page).toContain("promptInstall");
  });

  it("includes iPhone instructions without fake install button", () => {
    const page = readSource("src/features/pwa/components/install-education-page.tsx");
    expect(page).toContain("platformIphoneBody");
    expect(page).toContain('{installing ? t("installing") : t("installAction")}');
    expect(page).toContain("{showAndroidInstall ? (");
    expect(page).not.toContain("showIosInstructions ? (\n                <button");
  });

  it("shows Android install button only when prompt is available", () => {
    const page = readSource("src/features/pwa/components/install-education-page.tsx");
    expect(page).toContain("showAndroidInstall");
    expect(page).toContain("installAction");
  });

  it("renders already installed state", () => {
    const page = readSource("src/features/pwa/components/install-education-page.tsx");
    expect(page).toContain("isStandalone");
    expect(page).toContain("installedState");
  });

  it("does not request notification permission on load", () => {
    const page = readSource("src/features/pwa/components/install-education-page.tsx");
    expect(page).not.toContain("requestPermission");
    expect(page).not.toContain("Notification.requestPermission");
    const hook = readSource("src/features/pwa/use-pwa-install-state.ts");
    expect(hook).not.toContain("requestPermission");
  });
});

describe("Phase 26A — navigation CTAs", () => {
  it("links signed-out users to login", () => {
    const page = readSource("src/features/pwa/components/install-education-page.tsx");
    expect(page).toContain('href="/login"');
    expect(page).toContain("continueLogin");
  });

  it("links signed-in users to today and profile", () => {
    const page = readSource("src/features/pwa/components/install-education-page.tsx");
    expect(page).toContain('href="/today"');
    expect(page).toContain('href="/profile"');
    expect(page).toContain("enterMystic");
  });
});

describe("Phase 26A — entry point links", () => {
  it("login screen links to install page", () => {
    const auth = readSource("src/features/auth/components/auth-screen.tsx");
    const promo = readSource("src/features/pwa/components/install-page-promo.tsx");
    expect(auth).toContain("InstallPagePromo");
    expect(promo).toContain('href="/install"');
    expect(en.auth.installPromo.link).toBe("Install Mystic");
    expect(ru.auth.installPromo.link).toBe("Установить Mystic");
  });

  it("onboarding links to install page", () => {
    const onboarding = readSource(
      "src/features/onboarding/components/onboarding-flow.tsx",
    );
    expect(onboarding).toContain('href="/install"');
    expect(onboarding).toContain("compact.installLink");
  });

  it("profile notifications panel links to install page", () => {
    const panel = readSource(
      "src/features/notifications/components/notification-settings-panel.tsx",
    );
    expect(panel).toContain('href="/install"');
    expect(panel).toContain("installEducationLink");
    expect(panel).toContain("InstallMysticCard");
  });
});

describe("Phase 26A — manifest validity", () => {
  it("keeps manifest valid for PWA install", () => {
    const data = manifest();
    expect(data.name).toBe("Mystic by Vedunya Maria");
    expect(data.start_url).toBe("/ru");
    expect(data.display).toBe("standalone");
  });
});
