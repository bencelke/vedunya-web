"use client";

import { useEffect } from "react";

import { isIntroOnboardingSeen } from "@/features/onboarding/utils/intro-onboarding-storage";
import { usePathname, useRouter } from "@/i18n/navigation";

export function SignedOutRootRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const destination = isIntroOnboardingSeen() ? "/login" : "/onboarding";
    if (pathname === destination) {
      return;
    }

    router.replace(destination);
  }, [pathname, router]);

  return (
    <div className="mystic-auth-page">
      <div className="mystic-shell flex min-h-[50vh] items-center justify-center px-[var(--spacing-page)]">
        <p className="text-sm text-auth-text-muted">…</p>
      </div>
    </div>
  );
}
