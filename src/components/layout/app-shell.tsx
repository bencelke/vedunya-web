"use client";

import { type ReactNode } from "react";

import { shouldShowBottomNav } from "@/config/navigation";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

import { BottomNavigation } from "./bottom-navigation";

type AppShellProps = {
  children: ReactNode;
  className?: string;
};

export function AppShell({ children, className }: AppShellProps) {
  const pathname = usePathname();
  const showBottomNav = shouldShowBottomNav(pathname);

  return (
    <div className={cn("flex min-h-dvh flex-col", className)}>
      <main
        className={cn(
          "flex-1",
          showBottomNav && "pb-safe-nav",
        )}
      >
        {children}
      </main>
      {showBottomNav ? <BottomNavigation /> : null}
    </div>
  );
}
