"use client";

import { useTranslations } from "next-intl";

import { MysticLogo } from "@/components/brand/mystic-logo";
import { cn } from "@/lib/utils";

type AuthBrandHeaderProps = {
  headline: string;
  subtitle: string;
  showWordmark?: boolean;
  className?: string;
};

export function AuthBrandHeader({
  headline,
  subtitle,
  showWordmark = true,
  className,
}: AuthBrandHeaderProps) {
  const t = useTranslations("auth");

  return (
    <header className={cn("space-y-6 text-center", className)}>
      {showWordmark ? (
        <p className="mystic-auth-wordmark" aria-hidden="true">
          {t("brandWordmark")}
        </p>
      ) : null}
      <MysticLogo className="mx-auto" showWordmark={false} size="lg" />
      <div className="mx-auto max-w-[22rem] space-y-4">
        <h1 className="text-[clamp(1.625rem,5vw,1.875rem)] font-normal leading-[1.1] tracking-[-0.02em] text-auth-text-primary">
          {headline}
        </h1>
        <div className="mystic-auth-divider" aria-hidden="true" />
        <p className="text-sm leading-[1.66] text-auth-text-muted">{subtitle}</p>
      </div>
    </header>
  );
}
