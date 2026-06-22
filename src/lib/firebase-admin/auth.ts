import "server-only";

import { getAuth, type Auth } from "firebase-admin/auth";

import { getFirebaseAdminApp } from "./app";

export function getFirebaseAdminAuth(): Auth | null {
  const app = getFirebaseAdminApp();
  if (!app) {
    return null;
  }

  return getAuth(app);
}
