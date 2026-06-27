"use client";

import { useState } from "react";
import {
  BookOpen,
  Moon,
  Sun,
  User,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { bottomNavItems, type BottomNavItem } from "@/config/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const iconMap: Record<BottomNavItem["icon"], LucideIcon> = {
  sun: Sun,
  moon: Moon,
  "book-open": BookOpen,
  user: User,
};

export function BottomNavigation() {
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const tA11y = useTranslations("a11y");
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const activePendingHref =
    pendingHref &&
    pathname !== pendingHref &&
    !pathname.startsWith(`${pendingHref}/`)
      ? pendingHref
      : null;

  return (
    <nav
      aria-label={tA11y("bottomNavigation")}
      className="mystic-chrome-nav mystic-chrome-nav--floating fixed inset-x-0 bottom-nav-offset z-50 px-3"
    >
      <ul className="mystic-chrome-nav-inner flex h-[var(--bottom-nav-height)] items-stretch">
        {bottomNavItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isPending = activePendingHref === item.href;
          const label = t(item.key);

          return (
            <li key={item.key} className="flex flex-1">
              <Link
                href={item.href}
                prefetch={false}
                onClick={() => {
                  if (!isActive) {
                    setPendingHref(item.href);
                  }
                }}
                className={cn(
                  "touch-manipulation relative flex h-full w-full flex-col items-center justify-center gap-1 rounded-[0.75rem] px-1 text-[0.6875rem] font-medium tracking-[0.02em] transition-[color,opacity,transform] duration-100 active:scale-[0.97] active:duration-0",
                  isActive
                    ? "mystic-nav-active-pill text-[var(--nav-active)]"
                    : "text-[var(--nav-inactive)] hover:text-text-muted",
                  isPending && !isActive && "opacity-75 brightness-110",
                )}
                aria-current={isActive ? "page" : undefined}
                aria-busy={isPending || undefined}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "[filter:var(--nav-icon-glow)]" : "",
                  )}
                  strokeWidth={isActive ? 2.25 : 1.75}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
