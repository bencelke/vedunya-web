"use client";

import { useEffect, useSyncExternalStore } from "react";

import { IntroOnboardingFlow } from "@/features/onboarding/components/intro-onboarding-flow";
import { isIntroOnboardingSeen } from "@/features/onboarding/utils/intro-onboarding-storage";
import { usePathname, useRouter } from "@/i18n/navigation";

function subscribeToIntroStorage(): () => void {
  return () => {};
}

export function IntroOnboardingGate() {
  const router = useRouter();
  const pathname = usePathname();
  const seen = useSyncExternalStore(
    subscribeToIntroStorage,
    isIntroOnboardingSeen,
    () => false,
  );

  useEffect(() => {
    if (!seen || pathname === "/login") {
      return;
    }

    router.replace("/login");
  }, [pathname, router, seen]);

  if (seen) {
    return (
      <div className="mystic-auth-page">
        <div className="mystic-shell flex min-h-[50vh] items-center justify-center px-[var(--spacing-page)]">
          <p className="text-sm text-auth-text-muted">…</p>
        </div>
      </div>
    );
  }

  return <IntroOnboardingFlow />;
}
