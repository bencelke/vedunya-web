"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type ProfileActionRowProps = {
  icon: LucideIcon;
  label: string;
  subtitle?: string;
  href?: string;
  onClick?: () => void;
  showChevron?: boolean;
  isDestructive?: boolean;
  disabled?: boolean;
  trailing?: ReactNode;
};

export function ProfileActionRow({
  icon: Icon,
  label,
  subtitle,
  href,
  onClick,
  showChevron = true,
  isDestructive = false,
  disabled = false,
  trailing,
}: ProfileActionRowProps) {
  const interactive = !disabled && (href || onClick);
  const className = cn(
    "mystic-profile-action-row touch-manipulation",
    interactive && "mystic-profile-action-row-interactive",
    disabled && "mystic-profile-action-row-disabled",
    isDestructive && "mystic-profile-action-row-destructive",
  );

  const content = (
    <>
      <Icon
        className="mystic-profile-action-row-icon size-[22px] shrink-0"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="mystic-profile-action-row-label text-[0.9375rem] font-medium leading-snug">
          {label}
        </p>
        {subtitle ? (
          <p className="mystic-profile-action-row-subtitle mt-1 text-[0.78rem] leading-snug">
            {subtitle}
          </p>
        ) : null}
      </div>
      {trailing}
      {showChevron && interactive ? (
        <ChevronRight
          className="size-[22px] shrink-0 text-text-subtle/65"
          aria-hidden="true"
        />
      ) : null}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={className} prefetch={false}>
        {content}
      </Link>
    );
  }

  if (onClick && !disabled) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
