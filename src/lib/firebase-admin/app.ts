import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";

import {
  getFirebaseAdminConfig,
  isFirebaseAdminConfigured,
} from "./config";

let adminApp: App | null = null;

export function getFirebaseAdminApp(): App | null {
  if (!isFirebaseAdminConfigured()) {
    return null;
  }

  if (adminApp) {
    return adminApp;
  }

  const existing = getApps();
  if (existing.length > 0) {
    adminApp = existing[0] ?? null;
    return adminApp;
  }

  const config = getFirebaseAdminConfig();
  if (!config) {
    return null;
  }

  adminApp = initializeApp({
    credential: cert({
      projectId: config.projectId,
      clientEmail: config.clientEmail,
      privateKey: config.privateKey,
    }),
    projectId: config.projectId,
  });

  return adminApp;
}
