"use client";

import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  OAuthProvider,
  FacebookAuthProvider,
  getRedirectResult,
  type User,
  type UserCredential,
  type AuthProvider,
  type AuthError,
} from "firebase/auth";

import { getFirebaseAuth, ensureAuthPersistence } from "@/lib/firebase/auth";
import { logGoogleAuth } from "@/features/auth/utils/google-auth-debug";
import { shouldUseRedirectForGoogleAuth } from "@/features/auth/utils/google-oauth-strategy";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

function shouldUseRedirectFlow(): boolean {
  return shouldUseRedirectForGoogleAuth();
}

export async function registerWithEmail(
  email: string,
  password: string,
): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error("configuration");
  }

  await ensureAuthPersistence();
  return createUserWithEmailAndPassword(auth, email.trim(), password);
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error("configuration");
  }

  await ensureAuthPersistence();
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function loginWithGoogle(): Promise<UserCredential | null> {
  logGoogleAuth("click");
  if (shouldUseRedirectFlow()) {
    logGoogleAuth("method", { method: "redirect" });
    logGoogleAuth("redirect-start");
  } else {
    logGoogleAuth("method", { method: "popup" });
  }

  return signInWithOAuthProvider(googleProvider);
}

export async function loginWithApple(): Promise<UserCredential | null> {
  const provider = new OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");
  return signInWithOAuthProvider(provider);
}

export async function loginWithFacebook(): Promise<UserCredential | null> {
  const provider = new FacebookAuthProvider();
  provider.addScope("email");
  return signInWithOAuthProvider(provider);
}

async function signInWithOAuthProvider(
  provider: AuthProvider,
): Promise<UserCredential | null> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error("configuration");
  }

  await ensureAuthPersistence();

  if (shouldUseRedirectFlow()) {
    await signInWithRedirect(auth, provider);
    return null;
  }

  try {
    return await signInWithPopup(auth, provider);
  } catch (error) {
    const code = (error as AuthError)?.code ?? "";
    if (code === "auth/popup-blocked") {
      await signInWithRedirect(auth, provider);
      return null;
    }

    throw error;
  }
}

export async function resolveOAuthRedirectResult(): Promise<UserCredential | null> {
  const auth = getFirebaseAuth();
  if (!auth) {
    return null;
  }

  return getRedirectResult(auth);
}

/** @deprecated Use resolveOAuthRedirectResult */
export async function resolveGoogleRedirectResult(): Promise<UserCredential | null> {
  return resolveOAuthRedirectResult();
}

export async function sendPasswordReset(email: string): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error("configuration");
  }

  await sendPasswordResetEmail(auth, email.trim());
}

export async function signOutFromFirebase(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) {
    return;
  }

  await auth.signOut();
}

export { shouldUseRedirectForGoogleAuth } from "@/features/auth/utils/google-oauth-strategy";

export function getCurrentFirebaseUser(): User | null {
  return getFirebaseAuth()?.currentUser ?? null;
}

export function getAuthProviderIds(user: User): string[] {
  return user.providerData
    .map((provider) => provider.providerId)
    .filter((providerId) => providerId.length > 0);
}

export function userHasPasswordProvider(user: User): boolean {
  return getAuthProviderIds(user).includes("password");
}
