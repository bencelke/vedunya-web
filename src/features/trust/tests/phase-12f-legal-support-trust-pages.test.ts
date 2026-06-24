import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { SUPPORT_EMAIL, TRUST_ROUTES } from "@/features/trust/constants";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

const WEB_ROOT = process.cwd();

const TRUST_PAGES = [
  "src/app/[locale]/legal/disclaimer/page.tsx",
  "src/app/[locale]/legal/privacy/page.tsx",
  "src/app/[locale]/legal/terms/page.tsx",
  "src/app/[locale]/support/page.tsx",
  "src/app/[locale]/about/page.tsx",
  "src/app/[locale]/account/data-deletion/page.tsx",
] as const;

const FORBIDDEN_CLAIMS = [
  "guaranteed prediction",
  "guaranteed result",
  "HIPAA compliant",
  "GDPR certified",
  "payment active",
  "automatic account deletion",
] as const;

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

function trustMessages(locale: typeof en | typeof ru) {
  return JSON.stringify({
    legal: locale.legal,
    support: locale.support,
    about: locale.about,
    dataDeletion: locale.dataDeletion,
    profileLegal: locale.profile.legal,
    profileSupport: locale.profile.support,
  });
}

describe("Phase 12F — trust routes exist", () => {
  it("defines locale-aware trust routes", () => {
    expect(TRUST_ROUTES.disclaimer).toBe("/legal/disclaimer");
    expect(TRUST_ROUTES.privacy).toBe("/legal/privacy");
    expect(TRUST_ROUTES.terms).toBe("/legal/terms");
    expect(TRUST_ROUTES.support).toBe("/support");
    expect(TRUST_ROUTES.about).toBe("/about");
    expect(TRUST_ROUTES.dataDeletion).toBe("/account/data-deletion");
  });

  it("creates all trust page routes with TrustPageShell", () => {
    const shell = readSource("src/features/trust/components/trust-page-shell.tsx");
    expect(shell).toContain('href="/profile"');

    for (const page of TRUST_PAGES) {
      const source = readSource(page);
      expect(source).toContain("TrustPageShell");
    }
  });
});

describe("Phase 12F — disclaimer EN/RU", () => {
  it("includes required disclaimer copy in EN", () => {
    expect(en.legal.disclaimer.paragraph1).toContain("reflection, spiritual practice");
    expect(en.legal.disclaimer.paragraph2).toContain("medical, legal, financial");
    expect(en.legal.disclaimer.paragraph3).toContain("supportive reflection tools");
  });

  it("includes required disclaimer copy in RU", () => {
    expect(ru.legal.disclaimer.paragraph1).toContain("размышления, духовной практики");
    expect(ru.legal.disclaimer.paragraph2).toContain("медицинскую, юридическую");
    expect(ru.legal.disclaimer.paragraph3).toContain("инструменты для спокойного размышления");
  });

  it("includes professional-help disclaimer on disclaimer page", () => {
    const source = readSource("src/app/[locale]/legal/disclaimer/page.tsx");
    expect(source).toContain("paragraph2");
    expect(en.legal.disclaimer.paragraph2).toMatch(/professional|emergency/i);
    expect(ru.legal.disclaimer.paragraph2).toMatch(/специалист|экстренн/i);
  });
});

describe("Phase 12F — privacy EN/RU", () => {
  it("includes Firebase and honest payment notes in EN", () => {
    expect(en.legal.privacy.sections.firebase.body).toContain("Firebase");
    expect(en.legal.privacy.sections.payments.body).toContain("not active");
  });

  it("includes Firebase and honest payment notes in RU", () => {
    expect(ru.legal.privacy.sections.firebase.body).toContain("Firebase");
    expect(ru.legal.privacy.sections.payments.body).toContain("не подключена");
  });

  it("does not claim automatic deletion in privacy copy", () => {
    expect(en.legal.privacy.sections.deletion.body).toMatch(/not available|contact support/i);
    expect(ru.legal.privacy.sections.deletion.body).toMatch(/недоступно|поддержк/i);
  });
});

describe("Phase 12F — terms EN/RU", () => {
  it("includes prototype terms sections in EN and RU", () => {
    expect(en.legal.terms.sections.reflection.body).toContain("supportive tools");
    expect(ru.legal.terms.sections.reflection.body).toContain("вспомогательные");
    expect(en.legal.terms.sections.payments.body).toContain("not active");
    expect(ru.legal.terms.sections.payments.body).toContain("не активны");
  });
});

describe("Phase 12F — support page", () => {
  it("includes support email and mailto link", () => {
    expect(SUPPORT_EMAIL).toBe("vedunyamaria@gmail.com");
    const source = readSource("src/app/[locale]/support/page.tsx");
    expect(source).toContain("mailto:");
    expect(source).toContain("SUPPORT_EMAIL");
    expect(en.support.intro).toContain("Contact support");
    expect(ru.support.intro).toContain("напишите в поддержку");
  });
});

describe("Phase 12F — about page", () => {
  it("positions Mystic calmly in EN and RU", () => {
    expect(en.about.intro).toContain("daily spiritual practice");
    expect(ru.about.intro).toContain("ежедневной духовной практики");
    expect(en.about.title).toContain("Vedunya Maria");
    expect(ru.about.title).toContain("Vedunya Maria");
  });
});

describe("Phase 12F — data deletion page", () => {
  it("describes manual deletion request in EN and RU", () => {
    expect(en.dataDeletion.requestBody).toContain("contact support");
    expect(ru.dataDeletion.requestBody).toContain("напишите в поддержку");
    expect(en.dataDeletion.manualNote).toMatch(/not available|manual/i);
    expect(ru.dataDeletion.manualNote).toMatch(/недоступно|вручную/i);
  });
});

describe("Phase 12F — Profile legal/support links", () => {
  it("links Profile legal section to all trust routes", () => {
    const source = readSource("src/features/profile/components/profile-legal-section.tsx");
    expect(source).toContain("TRUST_ROUTES");
    expect(source).toContain('href={item.href}');
    expect(source).not.toContain("comingSoon");

    for (const key of Object.keys(TRUST_ROUTES)) {
      expect(source).toContain(`TRUST_ROUTES.${key}`);
    }
  });

  it("includes Profile legal labels in EN and RU", () => {
    expect(en.profile.legal.disclaimer).toBe("Disclaimer");
    expect(ru.profile.legal.disclaimer).toBe("Дисклеймер");
    expect(en.profile.legal.privacy).toBe("Privacy Policy");
    expect(ru.profile.legal.privacy).toBe("Политика конфиденциальности");
    expect(en.profile.legal.terms).toBe("Terms of Use");
    expect(ru.profile.legal.terms).toBe("Условия использования");
    expect(en.profile.legal.support).toBe("Support");
    expect(ru.profile.legal.support).toBe("Поддержка");
    expect(en.profile.legal.about).toBe("About");
    expect(ru.profile.legal.about).toBe("О приложении");
    expect(en.profile.legal.dataDeletion).toBe("Data deletion");
    expect(ru.profile.legal.dataDeletion).toBe("Удаление данных");
  });

  it("links Profile support section to support page", () => {
    const source = readSource("src/features/profile/components/profile-support-section.tsx");
    expect(source).toContain("TRUST_ROUTES.support");
    expect(source).toContain("mailto:");
    expect(source).toContain("openPage");
  });
});

describe("Phase 12F — localization quality", () => {
  it("RU trust pages avoid known EN fallback strings", () => {
    const ruTrust = trustMessages(ru);
    expect(ruTrust).not.toContain("Back to Profile");
    expect(ruTrust).not.toContain("Privacy Policy");
    expect(ruTrust).not.toContain("Terms of Use");
    expect(ruTrust).not.toContain("Contact support");
    expect(ruTrust).not.toContain("Data deletion");
  });

  it("includes back to profile labels in EN and RU", () => {
    expect(en.legal.common.backToProfile).toBe("Back to Profile");
    expect(ru.legal.common.backToProfile).toBe("Назад в профиль");
  });
});

describe("Phase 12F — forbidden claims", () => {
  it("does not include fake compliance or payment claims in trust copy", () => {
    const combined = `${trustMessages(en)} ${trustMessages(ru)}`.toLowerCase();
    for (const claim of FORBIDDEN_CLAIMS) {
      expect(combined).not.toContain(claim.toLowerCase());
    }
    expect(combined).not.toMatch(/hipaa/);
    expect(combined).not.toMatch(/gdpr certified/);
  });
});
