"use client";

import { LanguageDropdown } from "@/components/i18n/language-dropdown";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type AuthLanguageBarProps = {
  backHref?: string;
  backLabel?: string;
  tone?: "auth" | "app";
};

export function AuthLanguageBar({
  backHref,
  backLabel,
  tone = "auth",
}: AuthLanguageBarProps) {
  const isAuth = tone === "auth";

  return (
    <div className="flex items-center justify-between gap-3">
      {backHref && backLabel ? (
        <Link
          href={backHref}
          className={cn(
            "inline-flex min-h-10 items-center text-sm underline-offset-4 hover:underline",
            isAuth ? "text-auth-text-muted" : "text-text-muted",
          )}
        >
          {backLabel}
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}

      <LanguageDropdown tone={tone} />
    </div>
  );
}
