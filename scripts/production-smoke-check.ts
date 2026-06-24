/**
 * Post-deploy smoke check for Vedunya Web / Mystic on Vercel.
 *
 * Usage:
 *   PRODUCTION_URL=https://your-project.vercel.app npm run smoke:production
 *
 * Does not use secrets. Checks HTTP status and basic response shape only.
 */

const baseUrl = process.env.PRODUCTION_URL?.trim().replace(/\/$/, "");

if (!baseUrl) {
  console.error("Set PRODUCTION_URL, e.g. PRODUCTION_URL=https://vedunya-web.vercel.app");
  process.exit(1);
}

const PAGE_ROUTES = [
  "/en",
  "/ru",
  "/en/login",
  "/ru/login",
  "/en/today",
  "/ru/today",
  "/en/moon",
  "/ru/moon",
  "/en/runes/raido",
  "/ru/runes/raido",
  "/en/courses",
  "/ru/courses",
  "/en/courses/living-the-runes",
  "/ru/courses/living-the-runes",
  "/en/profile",
  "/ru/profile",
  "/en/offline",
  "/ru/offline",
  "/en/legal/disclaimer",
  "/ru/legal/disclaimer",
  "/en/legal/privacy",
  "/ru/legal/privacy",
  "/en/legal/terms",
  "/ru/legal/terms",
  "/en/support",
  "/ru/support",
  "/en/about",
  "/ru/about",
  "/en/account/data-deletion",
  "/ru/account/data-deletion",
] as const;

type CheckResult = {
  path: string;
  status: number;
  ok: boolean;
  note?: string;
};

async function checkPath(path: string): Promise<CheckResult> {
  const url = `${baseUrl}${path}`;
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { Accept: "text/html,application/json" },
    });
    const ok = response.status >= 200 && response.status < 400;
    return { path, status: response.status, ok };
  } catch (error) {
    return {
      path,
      status: 0,
      ok: false,
      note: error instanceof Error ? error.message : "fetch failed",
    };
  }
}

async function checkManifest(): Promise<CheckResult> {
  const path = "/manifest.webmanifest";
  const url = `${baseUrl}${path}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { path, status: response.status, ok: false, note: "manifest not ok" };
    }
    const data = (await response.json()) as { name?: string };
    const hasName = typeof data.name === "string" && data.name.includes("Mystic");
    return {
      path,
      status: response.status,
      ok: hasName,
      note: hasName ? undefined : "missing Mystic name in manifest",
    };
  } catch (error) {
    return {
      path,
      status: 0,
      ok: false,
      note: error instanceof Error ? error.message : "manifest fetch failed",
    };
  }
}

async function checkServiceWorker(): Promise<CheckResult> {
  const path = "/sw.js";
  const url = `${baseUrl}${path}`;
  try {
    const response = await fetch(url);
    const body = await response.text();
    const ok =
      response.ok &&
      body.includes("addEventListener") &&
      body.includes("NEVER_CACHE_PATTERNS");
    return {
      path,
      status: response.status,
      ok,
      note: ok ? undefined : "sw.js missing expected patterns",
    };
  } catch (error) {
    return {
      path,
      status: 0,
      ok: false,
      note: error instanceof Error ? error.message : "sw fetch failed",
    };
  }
}

async function main() {
  console.log(JSON.stringify({ baseUrl, startedAt: new Date().toISOString() }, null, 2));

  const results: CheckResult[] = [];
  for (const path of PAGE_ROUTES) {
    results.push(await checkPath(path));
  }
  results.push(await checkManifest());
  results.push(await checkServiceWorker());

  const failed = results.filter((r) => !r.ok);
  const summary = {
    baseUrl,
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    failures: failed.map((r) => ({
      path: r.path,
      status: r.status,
      note: r.note,
    })),
  };

  console.log(JSON.stringify(summary, null, 2));
  process.exit(failed.length > 0 ? 1 : 0);
}

void main();
