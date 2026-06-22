"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { BrandMark } from "@/components/brand/brand-mark";
import { Container } from "@/components/ui/container";
import { AppHeader } from "@/components/layout/app-header";
import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button";
import { LoginForm } from "@/features/auth/components/login-form";
import { RegisterForm } from "@/features/auth/components/register-form";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Link, useRouter } from "@/i18n/navigation";
import type { SupportedLocale } from "@/config/app-config";

type AuthMode = "login" | "register";

type AuthScreenProps = {
  locale: SupportedLocale;
  initialMode?: AuthMode;
};

async function fetchProfileComplete(): Promise<boolean> {
  const response = await fetch("/api/auth/profile-status", { cache: "no-store" });
  if (!response.ok) {
    return false;
  }

  const payload = (await response.json()) as { profileComplete?: boolean };
  return payload.profileComplete === true;
}

export function AuthScreen({ locale, initialMode = "login" }: AuthScreenProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const { configured, adminConfigured, loading, user, sessionReady } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const redirectAfterAuth = useCallback(async () => {
    const complete = await fetchProfileComplete();
    router.replace(complete ? "/today" : "/onboarding");
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (!loading && user && sessionReady) {
      void redirectAfterAuth();
    }
  }, [loading, redirectAfterAuth, sessionReady, user]);

  function handleAuthSuccess() {
    void redirectAfterAuth();
  }

  if (loading) {
    return (
      <>
        <AppHeader showLogin={false} />
        <Container narrow className="py-16">
          <p className="text-sm text-text-muted">{t("loading")}</p>
        </Container>
      </>
    );
  }

  if (!configured || !adminConfigured) {
    return (
      <>
        <AppHeader showLogin={false} />
        <Container narrow className="space-y-4 py-16">
          <h1 className="text-2xl font-medium text-text-primary">
            {t("configuration.title")}
          </h1>
          <p className="text-sm leading-relaxed text-text-muted">
            {t("configuration.body")}
          </p>
        </Container>
      </>
    );
  }

  return (
    <>
      <AppHeader showLogin={false} />
      <Container narrow className="space-y-8 py-8">
        <header className="space-y-3">
          <BrandMark />
          <div className="space-y-2">
            <h1 className="text-2xl font-medium text-text-primary">
              {mode === "login" ? t("loginTitle") : t("registerTitle")}
            </h1>
            <p className="text-sm leading-relaxed text-text-muted">
              {mode === "login" ? t("loginDescription") : t("registerDescription")}
            </p>
          </div>
        </header>

        <GoogleSignInButton locale={locale} onSuccess={handleAuthSuccess} />

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border-subtle" />
          <span className="text-xs uppercase tracking-[0.12em] text-text-subtle">
            {t("divider")}
          </span>
          <div className="h-px flex-1 bg-border-subtle" />
        </div>

        {mode === "login" ? (
          <LoginForm locale={locale} onSuccess={handleAuthSuccess} />
        ) : (
          <RegisterForm locale={locale} onSuccess={handleAuthSuccess} />
        )}

        <div className="space-y-3 text-sm text-text-muted">
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-accent-gold underline-offset-4 hover:underline"
          >
            {mode === "login" ? t("switchToRegister") : t("switchToLogin")}
          </button>
          {mode === "login" ? (
            <p>
              <Link href="/forgot-password" className="text-text-muted underline-offset-4 hover:underline">
                {t("forgotPasswordLink")}
              </Link>
            </p>
          ) : null}
          <p>
            <Link href="/" className="text-text-muted underline-offset-4 hover:underline">
              {t("backToLanding")}
            </Link>
          </p>
          <p className="text-xs leading-relaxed text-text-subtle">{t("legalNotice")}</p>
          <p className="text-xs leading-relaxed text-text-subtle">{t("applePlaceholder")}</p>
        </div>
      </Container>
    </>
  );
}
