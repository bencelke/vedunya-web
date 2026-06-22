export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
} as const;

export type FirebasePublicConfig = typeof firebaseConfig;

export type FirebaseConfigValidation = {
  configured: boolean;
  missingKeys: (keyof FirebasePublicConfig)[];
};

export function validateFirebaseConfig(
  config: FirebasePublicConfig = firebaseConfig,
): FirebaseConfigValidation {
  const missingKeys = (
    Object.entries(config) as [keyof FirebasePublicConfig, string][]
  )
    .filter(([, value]) => typeof value !== "string" || value.length === 0)
    .map(([key]) => key);

  return {
    configured: missingKeys.length === 0,
    missingKeys,
  };
}

export function isFirebaseConfigured(
  config: FirebasePublicConfig = firebaseConfig,
): boolean {
  return validateFirebaseConfig(config).configured;
}
