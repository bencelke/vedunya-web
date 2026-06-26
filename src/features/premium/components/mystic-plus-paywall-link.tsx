"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type MysticPlusPaywallLinkProps = {
  className?: string;
  label?: string;
  variant?: "pill" | "text";
};

export function MysticPlusPaywallLink({
  className,
  label,
  variant = "pill",
}: MysticPlusPaywallLinkProps) {
  const t = useTranslations("premium.paywall");
  const text = label ?? t("openInPlus");

  if (variant === "text") {
    return (
      <Link
        href="/plus"
        className={cn(
          "text-sm font-medium text-accent-gold underline-offset-2 hover:underline",
          className,
        )}
      >
        {text}
      </Link>
    );
  }

  return (
    <Link href="/plus" className={cn("mystic-gold-pill-btn w-full text-center", className)}>
      {text}
    </Link>
  );
}
