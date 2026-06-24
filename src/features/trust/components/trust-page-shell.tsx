import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { MobilePage } from "@/components/layout/mobile-page";
import { Link } from "@/i18n/navigation";

type TrustPageShellProps = {
  title: string;
  description?: string;
  backLabel: string;
  children: ReactNode;
};

export function TrustPageShell({
  title,
  description,
  backLabel,
  children,
}: TrustPageShellProps) {
  return (
    <>
      <AppHeader showLogin={false} />
      <AppShell>
        <MobilePage
          className="mystic-reading-column pt-safe-top pb-8"
          title={title}
          description={description}
        >
          <div className="space-y-4">{children}</div>
          <p className="mt-8 border-t border-border-subtle/60 pt-6">
            <Link
              href="/profile"
              className="text-sm text-text-muted underline-offset-4 hover:text-text-primary hover:underline"
            >
              {backLabel}
            </Link>
          </p>
        </MobilePage>
      </AppShell>
    </>
  );
}
