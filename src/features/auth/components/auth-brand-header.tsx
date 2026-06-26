"use client";

import { useTranslations } from "next-intl";

import { MysticBrandHeader } from "@/components/brand/mystic-brand-header";
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
    <header className={cn("auth-brand-header space-y-5 text-center", className)}>
      {showWordmark ? (
        <MysticBrandHeader wordmark={t("brandWordmark")} size="md" />
      ) : (
        <MysticLogo className="mx-auto" showWordmark={false} size="md" />
      )}
      <div className="mx-auto max-w-[22rem] space-y-3">
        <h1 className="auth-mode-title text-[1.375rem] font-medium leading-[1.2] tracking-[-0.01em] text-auth-text-primary sm:text-2xl">
          {headline}
        </h1>
        <p className="text-sm leading-[1.66] text-auth-text-muted">{subtitle}</p>
      </div>
    </header>
  );
}
