"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import { fetchProfileStatusCached } from "@/features/auth/services/profile-status-cache";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { IntroOnboardingGate } from "@/features/onboarding/components/intro-onboarding-gate";
import { OnboardingFlow } from "@/features/onboarding/components/onboarding-flow";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { SupportedLocale } from "@/config/app-config";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";

type OnboardingRouteProps = {
  locale: SupportedLocale;
  serverAuthenticated: boolean;
  initialProfile: ProfileSnapshot | null;
};

function OnboardingRouteLoading() {
  const t = useTranslations("auth");

  return (
    <div className="mystic-auth-page">
      <div className="mystic-shell flex min-h-[50vh] items-center justify-center px-[var(--spacing-page)]">
        <p className="text-sm text-auth-text-muted">{t("loading")}</p>
      </div>
    </div>
  );
}

export function OnboardingRoute({
  locale,
  serverAuthenticated,
  initialProfile,
}: OnboardingRouteProps) {
  const { user, loading, sessionReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const completeRedirectRef = useRef(false);

  const signedIn = Boolean(user) || serverAuthenticated;

  useEffect(() => {
    if (!signedIn || !sessionReady || completeRedirectRef.current) {
      return;
    }

    let active = true;

    async function checkCompleteProfile() {
      const payload = await fetchProfileStatusCached();

      if (!active) {
        return;
      }

      if (payload.profileComplete !== true) {
        return;
      }

      completeRedirectRef.current = true;
      if (pathname !== "/today") {
        router.replace("/today");
      }
    }

    void checkCompleteProfile();

    return () => {
      active = false;
    };
  }, [pathname, router, sessionReady, signedIn]);

  if (loading && !serverAuthenticated) {
    return <OnboardingRouteLoading />;
  }

  if (signedIn) {
    return <OnboardingFlow locale={locale} initialProfile={initialProfile} />;
  }

  return <IntroOnboardingGate />;
}
