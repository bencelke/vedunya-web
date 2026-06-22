import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal(): void {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    return;
  }

  const content = readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

type SafeCollectionStatus = {
  name: string;
  accessible: boolean;
  exists: boolean | null;
  error?: string;
};

type VerificationReport = {
  ok: boolean;
  clientConfigured: boolean;
  adminConfigured: boolean;
  projectIdsMatch: boolean | null;
  missingClientKeys: string[];
  missingAdminKeys: string[];
  adminInitialized: boolean;
  firestoreReachable: boolean;
  authReachable: boolean;
  collections: SafeCollectionStatus[];
  message: string;
};

const EXPECTED_COLLECTIONS = [
  "users",
  "user_private",
  "runes",
  "moon_phases",
  "lunar_days",
  "notification_copy",
] as const;

async function main(): Promise<number> {
  const report = await verifyFirebaseConnection();
  console.log(JSON.stringify(report, null, 2));

  if (!report.ok) {
    console.error(report.message);
    return 1;
  }

  console.log(report.message);
  return 0;
}

async function verifyFirebaseConnection(): Promise<VerificationReport> {
  const missingClientKeys: string[] = [];
  const missingAdminKeys: string[] = [];

  const clientKeys = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ] as const;

  for (const key of clientKeys) {
    if (!process.env[key]?.trim()) {
      missingClientKeys.push(key);
    }
  }

  for (const key of [
    "FIREBASE_ADMIN_PROJECT_ID",
    "FIREBASE_ADMIN_CLIENT_EMAIL",
    "FIREBASE_ADMIN_PRIVATE_KEY",
  ] as const) {
    if (!process.env[key]?.trim()) {
      missingAdminKeys.push(key);
    }
  }

  const clientProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const adminProjectId = process.env.FIREBASE_ADMIN_PROJECT_ID?.trim();
  const projectIdsMatch =
    clientProjectId && adminProjectId
      ? clientProjectId === adminProjectId
      : null;

  const clientConfigured = missingClientKeys.length === 0;
  const adminConfigured = missingAdminKeys.length === 0;

  if (!clientConfigured || !adminConfigured) {
    return {
      ok: false,
      clientConfigured,
      adminConfigured,
      projectIdsMatch,
      missingClientKeys,
      missingAdminKeys,
      adminInitialized: false,
      firestoreReachable: false,
      authReachable: false,
      collections: [],
      message:
        "Firebase verification blocked until missing environment variables are supplied.",
    };
  }

  if (projectIdsMatch === false) {
    return {
      ok: false,
      clientConfigured,
      adminConfigured,
      projectIdsMatch,
      missingClientKeys,
      missingAdminKeys,
      adminInitialized: false,
      firestoreReachable: false,
      authReachable: false,
      collections: [],
      message:
        "Firebase client and Admin project IDs do not match. Update `.env.local` before live verification.",
    };
  }

  const { initializeApp, cert, getApps } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");
  const { getAuth } = await import("firebase-admin/auth");

  let adminInitialized = false;
  let firestoreReachable = false;
  let authReachable = false;
  const collections: SafeCollectionStatus[] = [];

  try {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(
      /\\n/g,
      "\n",
    );

    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId: adminProjectId!,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!.trim(),
          privateKey,
        }),
      });
    }

    adminInitialized = true;

    const db = getFirestore();
    await db.listCollections();
    firestoreReachable = true;

    const auth = getAuth();
    await auth.listUsers(1);
    authReachable = true;

    for (const name of EXPECTED_COLLECTIONS) {
      try {
        const snapshot = await db.collection(name).limit(1).get();
        collections.push({
          name,
          accessible: true,
          exists: !snapshot.empty,
        });
      } catch (error) {
        collections.push({
          name,
          accessible: false,
          exists: null,
          error:
            error instanceof Error ? error.message : "collection-query-failed",
        });
      }
    }
  } catch (error) {
    return {
      ok: false,
      clientConfigured,
      adminConfigured,
      projectIdsMatch,
      missingClientKeys,
      missingAdminKeys,
      adminInitialized,
      firestoreReachable,
      authReachable,
      collections,
      message:
        error instanceof Error
          ? `Firebase verification failed: ${error.message}`
          : "Firebase verification failed.",
    };
  }

  const inaccessible = collections.filter((item) => !item.accessible);

  return {
    ok: inaccessible.length === 0,
    clientConfigured,
    adminConfigured,
    projectIdsMatch,
    missingClientKeys,
    missingAdminKeys,
    adminInitialized,
    firestoreReachable,
    authReachable,
    collections,
    message:
      inaccessible.length === 0
        ? "Firebase verification passed (read-only checks, no writes performed)."
        : "Firebase verification completed with collection access warnings.",
  };
}

main()
  .then((code) => {
    process.exit(code);
  })
  .catch((error) => {
    console.error(
      error instanceof Error ? error.message : "Unexpected verification failure.",
    );
    process.exit(1);
  });

export { verifyFirebaseConnection };
