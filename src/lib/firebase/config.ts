export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "",
} as const;

export type FirebasePublicConfig = typeof firebaseConfig;

const REQUIRED_FIREBASE_KEYS = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
] as const satisfies readonly (keyof FirebasePublicConfig)[];

export type FirebaseConfigValidation = {
  configured: boolean;
  missingKeys: (keyof FirebasePublicConfig)[];
};

export function validateFirebaseConfig(
  config: FirebasePublicConfig = firebaseConfig,
): FirebaseConfigValidation {
  const missingKeys = REQUIRED_FIREBASE_KEYS.filter((key) => {
    const value = config[key];
    return typeof value !== "string" || value.length === 0;
  });

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
