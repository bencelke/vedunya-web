export type FirebaseAdminConfig = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  sessionCookieName: string;
};

export type FirebaseAdminValidation = {
  configured: boolean;
  missingKeys: string[];
};

const SESSION_COOKIE_DEFAULT = "vedunya_session";

export function getSessionCookieName(): string {
  return process.env.FIREBASE_SESSION_COOKIE_NAME?.trim() || SESSION_COOKIE_DEFAULT;
}

export function validateFirebaseAdminConfig(): FirebaseAdminValidation {
  const missingKeys: string[] = [];

  if (!process.env.FIREBASE_ADMIN_PROJECT_ID?.trim()) {
    missingKeys.push("FIREBASE_ADMIN_PROJECT_ID");
  }
  if (!process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim()) {
    missingKeys.push("FIREBASE_ADMIN_CLIENT_EMAIL");
  }
  if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY?.trim()) {
    missingKeys.push("FIREBASE_ADMIN_PRIVATE_KEY");
  }

  return {
    configured: missingKeys.length === 0,
    missingKeys,
  };
}

export function getFirebaseAdminConfig(): FirebaseAdminConfig | null {
  const validation = validateFirebaseAdminConfig();
  if (!validation.configured) {
    return null;
  }

  return {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!.trim(),
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!.trim(),
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    sessionCookieName: getSessionCookieName(),
  };
}

export function isFirebaseAdminConfigured(): boolean {
  return validateFirebaseAdminConfig().configured;
}

/** Five days — matches Firebase session cookie guidance for web apps. */
export const SESSION_COOKIE_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000;

export const SESSION_COOKIE_MAX_AGE_SECONDS = Math.floor(
  SESSION_COOKIE_MAX_AGE_MS / 1000,
);
