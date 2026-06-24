"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { onIdTokenChanged, type User } from "firebase/auth";
import { useLocale } from "next-intl";

import type { AuthContextValue } from "@/features/auth/types/auth-state";
import {
  resolveOAuthRedirectResult,
  signOutFromFirebase,
} from "@/features/auth/services/auth-service";
import {
  clearServerSession,
  createServerSession,
  resetSessionSyncState,
} from "@/features/auth/services/session-service";
import { bootstrapUserProfile } from "@/features/profile/services/profile-bootstrap-service";
import type { SupportedLocale } from "@/config/app-config";
import { getFirebaseAuth } from "@/lib/firebase/auth";

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
  configured: boolean;
  adminConfigured: boolean;
};

export function AuthProvider({
  children,
  configured,
  adminConfigured,
}: AuthProviderProps) {
  const locale = useLocale() as SupportedLocale;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);
  const [sessionReady, setSessionReady] = useState(false);
  const syncingRef = useRef(false);
  const redirectHandledRef = useRef(false);
  const bootstrappedRedirectRef = useRef(false);
  const hadFirebaseUserRef = useRef(false);

  const syncSession = useCallback(async (nextUser: User | null) => {
    if (!adminConfigured) {
      setSessionReady(false);
      return;
    }

    if (!nextUser) {
      if (hadFirebaseUserRef.current) {
        await clearServerSession();
        resetSessionSyncState();
      }

      hadFirebaseUserRef.current = false;
      setSessionReady(false);
      return;
    }

    hadFirebaseUserRef.current = true;

    if (syncingRef.current) {
      return;
    }

    syncingRef.current = true;
    try {
      const token = await nextUser.getIdToken();
      const ok = await createServerSession(token);
      setSessionReady(ok);
    } finally {
      syncingRef.current = false;
    }
  }, [adminConfigured]);

  useEffect(() => {
    if (!configured) {
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      queueMicrotask(() => {
        setLoading(false);
      });
      return;
    }

    let active = true;

    const bootstrap = async () => {
      if (!redirectHandledRef.current) {
        redirectHandledRef.current = true;
        try {
          const redirectResult = await resolveOAuthRedirectResult();
          if (
            redirectResult?.user &&
            !bootstrappedRedirectRef.current
          ) {
            bootstrappedRedirectRef.current = true;
            await bootstrapUserProfile(redirectResult.user, locale);
          }
        } catch {
          // Redirect errors are surfaced by the auth page when needed.
        }
      }
    };

    void bootstrap();

    const unsubscribe = onIdTokenChanged(auth, (nextUser) => {
      if (!active) {
        return;
      }

      setUser(nextUser);
      void syncSession(nextUser).finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [configured, locale, syncSession]);

  const signOut = useCallback(async () => {
    await signOutFromFirebase();
    await clearServerSession();
    resetSessionSyncState();
    setUser(null);
    setSessionReady(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      configured,
      adminConfigured,
      user,
      sessionReady,
      signOut,
    }),
    [adminConfigured, configured, loading, sessionReady, signOut, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider.");
  }
  return context;
}
