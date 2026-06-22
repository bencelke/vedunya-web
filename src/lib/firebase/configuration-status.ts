import {
  firebaseConfig,
  validateFirebaseConfig,
  type FirebasePublicConfig,
} from "@/lib/firebase/config";
import { validateFirebaseAdminConfig } from "@/lib/firebase-admin/config";

const CLIENT_ENV_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

const ADMIN_ENV_KEYS = [
  "FIREBASE_ADMIN_PROJECT_ID",
  "FIREBASE_ADMIN_CLIENT_EMAIL",
  "FIREBASE_ADMIN_PRIVATE_KEY",
] as const;

export type FirebaseConfigurationStatus = {
  clientConfigured: boolean;
  adminConfigured: boolean;
  projectIdsMatch: boolean | null;
  missingClientKeys: string[];
  missingAdminKeys: string[];
};

function mapClientMissingKeys(
  missingKeys: (keyof FirebasePublicConfig)[],
): string[] {
  const keyMap: Record<keyof FirebasePublicConfig, string> = {
    apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY",
    authDomain: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    projectId: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    storageBucket: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    appId: "NEXT_PUBLIC_FIREBASE_APP_ID",
  };

  return missingKeys.map((key) => keyMap[key]);
}

export function getFirebaseConfigurationStatus(): FirebaseConfigurationStatus {
  const clientValidation = validateFirebaseConfig(firebaseConfig);
  const adminValidation = validateFirebaseAdminConfig();

  const clientProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const adminProjectId = process.env.FIREBASE_ADMIN_PROJECT_ID?.trim();

  let projectIdsMatch: boolean | null = null;
  if (clientProjectId && adminProjectId) {
    projectIdsMatch = clientProjectId === adminProjectId;
  }

  return {
    clientConfigured: clientValidation.configured,
    adminConfigured: adminValidation.configured,
    projectIdsMatch,
    missingClientKeys: clientValidation.configured
      ? []
      : mapClientMissingKeys(clientValidation.missingKeys),
    missingAdminKeys: adminValidation.missingKeys,
  };
}

export function getMissingFirebaseEnvKeys(): string[] {
  const status = getFirebaseConfigurationStatus();
  return [...status.missingClientKeys, ...status.missingAdminKeys];
}

export function isFirebaseFullyConfigured(): boolean {
  const status = getFirebaseConfigurationStatus();
  return (
    status.clientConfigured &&
    status.adminConfigured &&
    status.projectIdsMatch !== false
  );
}

export { CLIENT_ENV_KEYS, ADMIN_ENV_KEYS };
