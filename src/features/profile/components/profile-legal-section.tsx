"use client";

import { useTranslations } from "next-intl";

import { ProfileSectionCard } from "@/features/profile/components/profile-section-card";
import { TRUST_ROUTES } from "@/features/trust/constants";
import { Link } from "@/i18n/navigation";

const TRUST_LINKS = [
  { key: "disclaimer", href: TRUST_ROUTES.disclaimer },
  { key: "privacy", href: TRUST_ROUTES.privacy },
  { key: "terms", href: TRUST_ROUTES.terms },
  { key: "support", href: TRUST_ROUTES.support },
  { key: "about", href: TRUST_ROUTES.about },
  { key: "dataDeletion", href: TRUST_ROUTES.dataDeletion },
] as const;

export function ProfileLegalSection() {
  const t = useTranslations("profile.legal");

  return (
    <ProfileSectionCard label={t("label")} title={t("title")}>
      <p className="text-sm leading-relaxed text-text-muted">{t("disclaimerText")}</p>

      <ul className="mt-4 space-y-1">
        {TRUST_LINKS.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href}
              className="flex min-h-11 items-center justify-between gap-3 border-b border-border-subtle/60 py-3 text-sm text-text-primary transition-colors last:border-b-0 hover:text-accent-gold"
            >
              <span>{t(item.key)}</span>
              <span className="text-text-subtle" aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </ProfileSectionCard>
  );
}
