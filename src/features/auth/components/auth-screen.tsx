"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { AuthBrandHeader } from "@/features/auth/components/auth-brand-header";
import { AuthLanguageBar } from "@/features/auth/components/auth-language-bar";
import { AuthProviderButtons } from "@/features/auth/components/auth-provider-buttons";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";
import { RegisterForm } from "@/features/auth/components/register-form";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
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
  const pathname = usePathname();
  const { configured, adminConfigured, loading, user, sessionReady } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const redirectStartedRef = useRef(false);
  const pendingRedirectRef = useRef<"login" | "register" | null>(null);

  const redirectAfterAuth = useCallback(
    async (forceOnboarding = false) => {
      if (redirectStartedRef.current) {
        return;
      }

      redirectStartedRef.current = true;

      const destination = forceOnboarding
        ? "/onboarding"
        : (await fetchProfileComplete())
          ? "/today"
          : "/onboarding";

      if (pathname !== destination) {
        router.replace(destination);
        router.refresh();
      }
    },
    [pathname, router],
  );

  useEffect(() => {
    if (!loading && user && sessionReady) {
      if (pendingRedirectRef.current === "register") {
        pendingRedirectRef.current = null;
        void redirectAfterAuth(true);
        return;
      }

      if (pendingRedirectRef.current === "login") {
        pendingRedirectRef.current = null;
        void redirectAfterAuth();
        return;
      }

      void redirectAfterAuth();
    }
  }, [loading, redirectAfterAuth, sessionReady, user]);

  function handleAuthSuccess() {
    pendingRedirectRef.current = "login";
    if (sessionReady) {
      void redirectAfterAuth();
    }
  }

  function handleRegisterSuccess() {
    pendingRedirectRef.current = "register";
    if (sessionReady) {
      void redirectAfterAuth(true);
    }
  }

  const topBar = <AuthLanguageBar tone="auth" />;

  if (loading) {
    return (
      <AuthShell topBar={topBar} layout="login">
        <div className="space-y-6 py-8 text-center">
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
      <AuthShell topBar={topBar} layout="login">
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
    <AuthShell topBar={topBar} layout="login">
      <div className="space-y-7">
        <AuthBrandHeader
          headline={isLogin ? t("loginTitle") : t("registerTitle")}
          subtitle={isLogin ? t("loginDescription") : t("registerDescription")}
        />

        <AuthProviderButtons
          locale={locale}
          firebaseConfigured={configured}
          onSuccess={handleAuthSuccess}
        />

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-auth-border/90" />
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-auth-text-subtle">
            {t("divider")}
          </span>
          <div className="h-px flex-1 bg-auth-border/90" />
        </div>

        {isLogin ? (
          <LoginForm locale={locale} onSuccess={handleAuthSuccess} />
        ) : (
          <RegisterForm locale={locale} onSuccess={handleRegisterSuccess} />
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
