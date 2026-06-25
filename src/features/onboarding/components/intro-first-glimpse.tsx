"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";

import { getFirstGlimpseNote } from "@/features/onboarding/services/first-glimpse-content";
import { Button } from "@/components/ui/button";
import type { SupportedLocale } from "@/config/app-config";

type IntroFirstGlimpseProps = {
  onLogin: () => void;
  onRegister: () => void;
};

export function IntroFirstGlimpse({ onLogin, onRegister }: IntroFirstGlimpseProps) {
  const t = useTranslations("auth.intro.glimpse");
  const locale = useLocale() as SupportedLocale;

  const note = useMemo(() => getFirstGlimpseNote(locale), [locale]);

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto max-w-[22rem] space-y-3 text-center">
        <h1 className="text-[clamp(1.625rem,5vw,2rem)] font-normal leading-[1.08] tracking-[-0.03em] text-auth-text-primary">
          {t("title")}
        </h1>
        <p className="text-sm leading-[1.72] text-auth-text-muted">{t("subtitle")}</p>
      </header>

      <div className="mt-8 flex-1">
        <div className="rounded-[var(--radius-lg)] border border-auth-border bg-auth-surface-muted/70 px-5 py-5">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-auth-text-subtle">
            {t("noteLabel")}
          </p>
          <p className="mt-3 text-sm leading-[1.72] text-auth-text-primary">{note}</p>
        </div>
        <p className="mt-4 text-center text-xs leading-relaxed text-auth-text-subtle">
          {t("disclaimer")}
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-10">
        <Button type="button" variant="authPrimary" className="w-full" onClick={onRegister}>
          {t("createAccount")}
        </Button>
        <Button type="button" variant="authOutline" className="w-full" onClick={onLogin}>
          {t("login")}
        </Button>
      </div>
    </div>
  );
}
