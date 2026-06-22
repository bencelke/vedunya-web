"use client";

import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type Auth,
} from "firebase/auth";

import { getFirebaseApp } from "./client";

let authInstance: Auth | null = null;
let persistencePromise: Promise<void> | null = null;

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) {
    return null;
  }

  if (!authInstance) {
    authInstance = getAuth(app);
    persistencePromise ??= setPersistence(
      authInstance,
      browserLocalPersistence,
    ).catch(() => {
      persistencePromise = null;
    });
  }

  return authInstance;
}

export async function ensureAuthPersistence(): Promise<void> {
  getFirebaseAuth();
  if (persistencePromise) {
    await persistencePromise;
  }
}
