"use client";

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

  return (
    <nav
      aria-label={tA11y("bottomNavigation")}
      className="fixed inset-x-0 bottom-nav-offset z-50 border-t border-border-subtle bg-surface-primary/95 backdrop-blur-md"
      style={{ height: "var(--bottom-nav-height)" }}
    >
      <ul className="mx-auto flex h-full max-w-lg items-stretch px-2">
        {bottomNavItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const label = t(item.key);

          return (
            <li key={item.key} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 px-2 text-xs transition-colors",
                  isActive
                    ? "text-accent-gold"
                    : "text-text-subtle hover:text-text-muted",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className="h-5 w-5"
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
