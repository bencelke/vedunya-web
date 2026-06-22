"use client";

import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  getRedirectResult,
  type User,
  type UserCredential,
} from "firebase/auth";

import { getFirebaseAuth, ensureAuthPersistence } from "@/lib/firebase/auth";
import { isLikelyIOSPlatform, isStandaloneDisplayMode } from "@/lib/pwa/install";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

function shouldUseRedirectFlow(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  return isMobile || isLikelyIOSPlatform() || isStandaloneDisplayMode();
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
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error("configuration");
  }

  await ensureAuthPersistence();

  if (shouldUseRedirectFlow()) {
    await signInWithRedirect(auth, googleProvider);
    return null;
  }

  return signInWithPopup(auth, googleProvider);
}

export async function resolveGoogleRedirectResult(): Promise<UserCredential | null> {
  const auth = getFirebaseAuth();
  if (!auth) {
    return null;
  }

  return getRedirectResult(auth);
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
