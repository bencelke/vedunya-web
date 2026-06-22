import {
  OWNER_SAFE_PUBLIC_FIELDS,
  PROTECTED_PUBLIC_FIELDS,
} from "@/features/profile/constants";

type StringRecord = Record<string, unknown>;

const ownerSafeSet = new Set<string>(OWNER_SAFE_PUBLIC_FIELDS);
const protectedSet = new Set<string>(PROTECTED_PUBLIC_FIELDS);

export function sanitizePublicProfilePatch(
  patch: StringRecord,
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(patch)) {
    if (!ownerSafeSet.has(key) || protectedSet.has(key)) {
      continue;
    }

    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value === "string" && value.trim().length === 0) {
      continue;
    }

    sanitized[key] = value;
  }

  return sanitized;
}

export function isShellDisplayName(value: string | null | undefined): boolean {
  if (!value) {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  return (
    normalized.length === 0 ||
    normalized === "mystic member" ||
    normalized === "vedunya maria member"
  );
}

export function mergeAuthProviders(
  existing: unknown,
  providerIds: string[],
): string[] {
  const merged = new Set<string>();

  if (Array.isArray(existing)) {
    for (const item of existing) {
      if (typeof item === "string" && item.trim().length > 0) {
        merged.add(item.trim());
      }
    }
  }

  for (const providerId of providerIds) {
    if (providerId.trim().length > 0) {
      merged.add(providerId.trim());
    }
  }

  return [...merged].sort();
}
