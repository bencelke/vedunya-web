"use client";

import { useEffect, useRef, useState } from "react";

import type { AuthProviderMode } from "@/features/auth/components/auth-provider-buttons";
import { ensureOAuthRedirectChecked } from "@/features/auth/services/oauth-redirect-gate";
import {
  completeSocialSignIn,
  mapSocialSignInError,
} from "@/features/auth/services/social-sign-in-flow";
import type { AuthErrorKey } from "@/features/auth/utils/auth-error-map";
import { logGoogleAuth } from "@/features/auth/utils/google-auth-debug";
import type { SupportedLocale } from "@/config/app-config";

type UseOAuthRedirectHandlerOptions = {
  locale: SupportedLocale;
  mode: AuthProviderMode;
  enabled: boolean;
  onSuccess: () => void;
};

export function useOAuthRedirectHandler({
  locale,
  mode,
  enabled,
  onSuccess,
}: UseOAuthRedirectHandlerOptions): AuthErrorKey | null {
  const handledRef = useRef(false);
  const [errorKey, setErrorKey] = useState<AuthErrorKey | null>(null);

  useEffect(() => {
    if (!enabled || handledRef.current) {
      return;
    }

    handledRef.current = true;

    void (async () => {
      try {
        const credential = await ensureOAuthRedirectChecked();
        if (!credential) {
          return;
        }

        logGoogleAuth("session-start");
        await completeSocialSignIn(credential, locale, onSuccess);
        logGoogleAuth("route-start");
      } catch (error) {
        setErrorKey(mapSocialSignInError(error, "google"));
      }
    })();
  }, [enabled, locale, mode, onSuccess]);

  return errorKey;
}
