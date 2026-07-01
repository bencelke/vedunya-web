import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import de from "@/messages/de.json";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

describe("Phase 26B — why install section", () => {
  it("renders RU why-install copy", () => {
    expect(ru.pwa.installPage.whyInstallTitle).toBe("Зачем устанавливать Mystic?");
    expect(ru.pwa.installPage.whyInstallBody).toContain("необязательные напоминания");
    const page = readSource("src/features/pwa/components/install-education-page.tsx");
    expect(page).toContain("whyInstallTitle");
    expect(page).toContain("whyInstallBody");
  });

  it("renders EN why-install copy", () => {
    expect(en.pwa.installPage.whyInstallTitle).toBe("Why install Mystic?");
    expect(en.pwa.installPage.whyInstallBody).toContain("optional reminders");
  });

  it("DE install page uses English fallback without undefined", () => {
    expect(de.pwa.installPage.whyInstallTitle).toBe("Why install Mystic?");
    expect(JSON.stringify(de.pwa.installPage)).not.toContain("undefined");
  });
});

describe("Phase 26B — remove Mystic instructions", () => {
  it("renders RU removal section", () => {
    expect(ru.pwa.installPage.removeTitle).toBe("Как удалить Mystic");
    expect(ru.pwa.installPage.removeIphone).toContain("iPhone");
    expect(ru.pwa.installPage.removeAndroid).toContain("Android");
    expect(ru.pwa.installPage.removeAccountNote).toContain("не удаляет ваш аккаунт");
  });

  it("renders EN removal section", () => {
    expect(en.pwa.installPage.removeTitle).toBe("How to remove Mystic");
    expect(en.pwa.installPage.removeIphone).toContain("Remove App");
    expect(en.pwa.installPage.removeAndroid).toContain("Uninstall");
    expect(en.pwa.installPage.removeAccountNote).toContain("does not delete your account");
  });

  it("includes iPhone and Android removal instructions in component", () => {
    const page = readSource("src/features/pwa/components/install-education-page.tsx");
    expect(page).toContain("removeIphone");
    expect(page).toContain("removeAndroid");
    expect(page).toContain("removeAccountNote");
  });
});

describe("Phase 26B — no fake uninstall", () => {
  it("does not render a fake uninstall button", () => {
    const page = readSource("src/features/pwa/components/install-education-page.tsx");
    expect(page).not.toContain("Uninstall Mystic");
    expect(page).not.toContain("Удалить Mystic");
    expect(page).not.toMatch(/removeTitle[\s\S]*<button/);
    expect(page).not.toMatch(/uninstallAction/i);
  });

  it("does not request notification permission on load", () => {
    const page = readSource("src/features/pwa/components/install-education-page.tsx");
    expect(page).not.toContain("requestPermission");
    expect(page).not.toContain("Notification.requestPermission");
  });
});

describe("Phase 26B — profile install education link", () => {
  it("links to install page with updated label", () => {
    const panel = readSource(
      "src/features/notifications/components/notification-settings-panel.tsx",
    );
    expect(panel).toContain('href="/install"');
    expect(panel).toContain("installEducationLink");
    expect(en.notifications.installEducationLink).toBe(
      "How installation and removal work",
    );
    expect(ru.notifications.installEducationLink).toBe(
      "Как работает установка и удаление",
    );
  });
});
