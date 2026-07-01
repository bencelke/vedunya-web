"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { AuthBrandHeader } from "@/features/auth/components/auth-brand-header";
import { AuthErrorMessage } from "@/features/auth/components/auth-error-message";
import { AuthLanguageBar } from "@/features/auth/components/auth-language-bar";
import { AuthProviderButtons } from "@/features/auth/components/auth-provider-buttons";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { InstallPagePromo } from "@/features/pwa/components/install-page-promo";
import { LoginForm } from "@/features/auth/components/login-form";
import { RegisterForm } from "@/features/auth/components/register-form";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useOAuthRedirectHandler } from "@/features/auth/hooks/use-oauth-redirect-handler";
import { fetchProfileStatusCached } from "@/features/auth/services/profile-status-cache";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import type { SupportedLocale } from "@/config/app-config";

type AuthMode = "login" | "register";

type AuthScreenProps = {
  locale: SupportedLocale;
  initialMode?: AuthMode;
};

export function AuthScreen({ locale, initialMode = "login" }: AuthScreenProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { configured, adminConfigured, loading, user, sessionReady } = useAuth();
  const mode: AuthMode =
    searchParams.get("mode") === "register" ? "register" : initialMode;
  const redirectStartedRef = useRef(false);
  const pendingRedirectRef = useRef<"login" | "register" | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const setAuthMode = useCallback(
    (nextMode: AuthMode) => {
      router.replace(nextMode === "register" ? "/login?mode=register" : "/login");
    },
    [router],
  );

  const redirectAfterAuth = useCallback(
    async (forceOnboarding = false) => {
      if (redirectStartedRef.current) {
        return;
      }

      redirectStartedRef.current = true;
      setIsRedirecting(true);

      const status = await fetchProfileStatusCached();
      const destination = forceOnboarding
        ? "/onboarding"
        : status.profileComplete
          ? "/today"
          : "/onboarding";

      if (pathname !== destination) {
        router.replace(destination);
      }
    },
    [pathname, router],
  );

  const handleAuthSuccess = useCallback(() => {
    pendingRedirectRef.current = "login";
    if (sessionReady) {
      void redirectAfterAuth(false);
    }
  }, [redirectAfterAuth, sessionReady]);

  const handleRegisterSuccess = useCallback(() => {
    pendingRedirectRef.current = "register";
    if (sessionReady) {
      void redirectAfterAuth(true);
    }
  }, [redirectAfterAuth, sessionReady]);

  const oauthRedirectError = useOAuthRedirectHandler({
    locale,
    mode,
    enabled: configured && adminConfigured,
    onSuccess: mode === "register" ? handleRegisterSuccess : handleAuthSuccess,
  });

  useEffect(() => {
    if (!loading && user && sessionReady) {
      if (pendingRedirectRef.current === "register") {
        pendingRedirectRef.current = null;
        void redirectAfterAuth(true);
        return;
      }

      if (pendingRedirectRef.current === "login") {
        pendingRedirectRef.current = null;
        void redirectAfterAuth(false);
        return;
      }

      void redirectAfterAuth(false);
    }
  }, [loading, redirectAfterAuth, sessionReady, user]);

  const topBar = <AuthLanguageBar tone="auth" />;

  if (loading || isRedirecting) {
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
      <div
        className={isLogin ? "auth-screen auth-screen--login space-y-7" : "auth-screen auth-screen--register space-y-7"}
        data-auth-mode={mode}
      >
        <AuthBrandHeader
          headline={isLogin ? t("loginTitle") : t("registerTitle")}
          subtitle={isLogin ? t("loginDescription") : t("registerDescription")}
        />

        <AuthErrorMessage errorKey={oauthRedirectError} tone="auth" />

        <AuthProviderButtons
          locale={locale}
          mode={mode}
          firebaseConfigured={configured}
          onSuccess={isLogin ? handleAuthSuccess : handleRegisterSuccess}
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

        <InstallPagePromo />

        <div className="space-y-4 border-t border-auth-border/80 pt-6 text-center text-sm">
          <button
            type="button"
            onClick={() => setAuthMode(isLogin ? "register" : "login")}
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
