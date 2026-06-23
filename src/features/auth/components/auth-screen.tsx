"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { AuthBrandHeader } from "@/features/auth/components/auth-brand-header";
import { AuthLanguageBar } from "@/features/auth/components/auth-language-bar";
import { AuthProviderButtons } from "@/features/auth/components/auth-provider-buttons";
import { AuthShell } from "@/features/auth/components/auth-shell";
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

  const topBar = (
    <AuthLanguageBar
      backHref="/"
      backLabel={t("backToLanding")}
      tone="auth"
    />
  );

  if (loading) {
    return (
      <AuthShell topBar={topBar}>
        <div className="space-y-6 py-10 text-center">
          <AuthBrandHeader
            headline={t("welcomeHeadline")}
            subtitle={t("loading")}
            showWordmark={false}
          />
        </div>
      </AuthShell>
    );
  }

  if (!configured || !adminConfigured) {
    return (
      <AuthShell topBar={topBar}>
        <div className="space-y-6 py-4">
          <AuthBrandHeader
            headline={t("configuration.title")}
            subtitle={t("configuration.body")}
            showWordmark={false}
          />
        </div>
      </AuthShell>
    );
  }

  const isLogin = mode === "login";

  return (
    <AuthShell topBar={topBar}>
      <div className="space-y-8">
        <AuthBrandHeader
          headline={isLogin ? t("loginTitle") : t("registerTitle")}
          subtitle={isLogin ? t("loginDescription") : t("registerDescription")}
        />

        <AuthProviderButtons locale={locale} onSuccess={handleAuthSuccess} />

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-auth-border" />
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-auth-text-subtle">
            {t("divider")}
          </span>
          <div className="h-px flex-1 bg-auth-border" />
        </div>

        {isLogin ? (
          <LoginForm locale={locale} onSuccess={handleAuthSuccess} />
        ) : (
          <RegisterForm locale={locale} onSuccess={handleAuthSuccess} />
        )}

        <div className="space-y-4 border-t border-auth-border/80 pt-6 text-center text-sm">
          <button
            type="button"
            onClick={() => setMode(isLogin ? "register" : "login")}
            className="font-medium tracking-[0.01em] text-auth-text-muted transition-colors hover:text-auth-text-primary"
          >
            {isLogin ? t("switchToRegister") : t("switchToLogin")}
          </button>
          {isLogin ? (
            <p>
              <Link
                href="/forgot-password"
                className="text-auth-text-muted underline-offset-4 hover:text-auth-text-primary hover:underline"
              >
                {t("forgotPasswordLink")}
              </Link>
            </p>
          ) : null}
          <p className="text-xs leading-relaxed text-auth-text-subtle">
            {t("legalNotice")}
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
