import fs from "node:fs";
import path from "node:path";

const WEB_ROOT = path.resolve(import.meta.dirname, "..");
const PUBLIC_ASSETS = path.join(WEB_ROOT, "public", "assets");
const PUBLIC_DIR = path.join(WEB_ROOT, "public");

const CANONICAL_RUNES = [
  "fehu", "uruz", "thurisaz", "ansuz", "raido", "kenaz", "gebo", "wunjo",
  "hagalaz", "nauthiz", "isa", "jera", "eihwaz", "perthro", "algiz", "sowilo",
  "tiwaz", "berkano", "ehwaz", "mannaz", "laguz", "ingwaz", "dagaz", "othala",
];

const MOON_PHASE_FILES = [
  "moon_new.png",
  "moon_waxing_crescent.png",
  "moon_first_quarter.png",
  "moon_waxing_gibbous.png",
  "moon_full.png",
  "moon_waning_gibbous.png",
  "moon_waning_crescent.png",
];

const ALLOWED_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".svg",
  ".ico",
]);

const FORBIDDEN_EXTENSIONS = new Set([
  ".ttf",
  ".otf",
  ".woff",
  ".woff2",
  ".env",
  ".plist",
  ".dart",
  ".ts",
  ".js",
  ".map",
  ".lock",
]);

const FORBIDDEN_NAME_PATTERNS = [
  /service[-_]?account/i,
  /google-services\.json$/i,
  /GoogleService-Info\.plist$/i,
  /\.env(\.|$)/i,
];

type CheckResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

function relativeFromPublic(filePath: string): string {
  return filePath.replace(WEB_ROOT + path.sep, "").replace(/\\/g, "/");
}

function validateAssets(): CheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const runeId of CANONICAL_RUNES) {
    const file = path.join(PUBLIC_ASSETS, "runes", "symbols", `${runeId}.svg`);
    if (!fs.existsSync(file)) {
      errors.push(`Missing rune SVG: ${relativeFromPublic(file)}`);
    }
  }

  const raidhoPath = path.join(PUBLIC_ASSETS, "runes", "symbols", "raidho.svg");
  if (fs.existsSync(raidhoPath)) {
    warnings.push(
      "Legacy raidho.svg present — canonical ID is raido.svg only",
    );
  }

  const livingCover = path.join(
    PUBLIC_ASSETS,
    "courses",
    "living-the-runes",
    "prozhivanie.png",
  );
  const livingCoverAlt = path.join(
    PUBLIC_ASSETS,
    "courses",
    "living-the-runes",
    "cover.png",
  );
  if (!fs.existsSync(livingCover) && !fs.existsSync(livingCoverAlt)) {
    errors.push(
      "Missing Living the Runes cover (prozhivanie.png or cover.png)",
    );
  }

  for (const moonFile of MOON_PHASE_FILES) {
    const file = path.join(PUBLIC_ASSETS, "moon", "phases", moonFile);
    if (!fs.existsSync(file)) {
      errors.push(`Missing moon phase asset: ${relativeFromPublic(file)}`);
    }
  }

  const pwaIcons = [
    "public/icons/icon-192x192.png",
    "public/icons/icon-512x512.png",
    "public/icons/icon-512x512-maskable.png",
    "public/icons/apple-touch-icon.png",
  ];
  for (const iconRel of pwaIcons) {
    const iconPath = path.join(WEB_ROOT, iconRel);
    if (!fs.existsSync(iconPath)) {
      errors.push(`Missing PWA icon: ${iconRel}`);
    }
  }

  if (!fs.existsSync(path.join(WEB_ROOT, "public/sw.js"))) {
    errors.push("Missing service worker: public/sw.js");
  }

  const assetFiles = walkFiles(PUBLIC_ASSETS);
  for (const file of assetFiles) {
    const rel = relativeFromPublic(file);
    const ext = path.extname(file).toLowerCase();
    const base = path.basename(file);

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      errors.push(`Disallowed extension under public/assets: ${rel}`);
    }

    if (FORBIDDEN_EXTENSIONS.has(ext)) {
      errors.push(`Forbidden file type under public/assets: ${rel}`);
    }

    if (/\s/.test(rel)) {
      errors.push(`Asset path contains spaces: ${rel}`);
    }

    if (/[А-Яа-яЁё]/.test(rel)) {
      errors.push(`Asset path contains Cyrillic characters: ${rel}`);
    }

    if (rel.includes("\\")) {
      errors.push(`Asset path contains backslashes: ${rel}`);
    }

    for (const pattern of FORBIDDEN_NAME_PATTERNS) {
      if (pattern.test(base) || pattern.test(rel)) {
        errors.push(`Forbidden secret/config pattern in public assets: ${rel}`);
      }
    }
  }

  const publicFiles = walkFiles(PUBLIC_DIR);
  for (const file of publicFiles) {
    const rel = relativeFromPublic(file);
    const ext = path.extname(file).toLowerCase();
    const base = path.basename(file);

    if (ext === ".json" && /service|firebase|google-services/i.test(base)) {
      errors.push(`Suspicious JSON in public/: ${rel}`);
    }

    if (FORBIDDEN_EXTENSIONS.has(ext) && rel.startsWith("public/assets/")) {
      errors.push(`Font or forbidden file in public/assets: ${rel}`);
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

function main() {
  const result = validateAssets();
  const payload = {
    ok: result.ok,
    runeCount: CANONICAL_RUNES.length,
    moonPhaseCount: MOON_PHASE_FILES.length,
    assetFileCount: walkFiles(PUBLIC_ASSETS).length,
    errors: result.errors,
    warnings: result.warnings,
  };

  console.log(JSON.stringify(payload, null, 2));
  if (!result.ok) {
    process.exit(1);
  }
}

main();
