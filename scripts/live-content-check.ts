import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import type { LiveContentDiagnostic } from "../src/lib/firebase/live-firebase-diagnostic";
import { runeFirestoreSchema } from "../src/features/runes/schemas/rune-content-schema";
import {
  lunarDayFirestoreSchema,
  moonPhaseFirestoreSchema,
} from "../src/features/moon/schemas/moon-content-schema";

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

async function main(): Promise<number> {
  loadEnvLocal();

  const { initializeApp, cert, getApps } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
  const privateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.trim();

  if (!projectId || !clientEmail || !privateKeyRaw) {
    console.error("Admin credentials missing — cannot run live content check.");
    return 1;
  }

  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKeyRaw.replace(/\\n/g, "\n"),
      }),
    });
  }

  const db = getFirestore();
  const result: LiveContentDiagnostic = {
    runeContent: "unavailable",
    moonPhaseContent: "unavailable",
    lunarDayContent: "unavailable",
  };

  try {
    const runeDoc = await db.collection("runes").doc("raido").get();
    if (runeDoc.exists) {
      const parsed = runeFirestoreSchema.safeParse(runeDoc.data());
      result.runeContent = parsed.success ? "firestore" : "fallback";
    } else {
      result.runeContent = "fallback";
    }
  } catch {
    result.runeContent = "unavailable";
  }

  try {
    const phaseDoc = await db.collection("moon_phases").doc("waning").get();
    if (phaseDoc.exists) {
      const parsed = moonPhaseFirestoreSchema.safeParse(phaseDoc.data());
      result.moonPhaseContent = parsed.success ? "firestore" : "fallback";
    } else {
      result.moonPhaseContent = "fallback";
    }
  } catch {
    result.moonPhaseContent = "unavailable";
  }

  try {
    const lunarDoc = await db.collection("lunar_days").doc("1").get();
    if (!lunarDoc.exists) {
      result.lunarDayContent = "missing";
    } else {
      const parsed = lunarDayFirestoreSchema.safeParse(lunarDoc.data());
      result.lunarDayContent = parsed.success ? "firestore" : "fallback";
    }
  } catch {
    result.lunarDayContent = "unavailable";
  }

  console.log(JSON.stringify(result, null, 2));
  return 0;
}

main().then((code) => process.exit(code));
