import type { ProfileStatusResponse } from "@/features/profile/utils/resolve-profile-status";

const PROFILE_STATUS_CACHE_MS = 30_000;

let cachedStatus: ProfileStatusResponse | null = null;
let cacheTimestamp = 0;
let inflightPromise: Promise<ProfileStatusResponse> | null = null;

async function fetchProfileStatusFromApi(): Promise<ProfileStatusResponse> {
  const response = await fetch("/api/auth/profile-status", {
    cache: "no-store",
    credentials: "same-origin",
  });

  if (!response.ok) {
    return {
      authenticated: false,
      profileComplete: false,
      missing: ["displayName", "language", "dob"],
    };
  }

  return (await response.json()) as ProfileStatusResponse;
}

export async function fetchProfileStatusCached(): Promise<ProfileStatusResponse> {
  const now = Date.now();

  if (cachedStatus && now - cacheTimestamp < PROFILE_STATUS_CACHE_MS) {
    return cachedStatus;
  }

  if (inflightPromise) {
    return inflightPromise;
  }

  inflightPromise = fetchProfileStatusFromApi()
    .then((status) => {
      cachedStatus = status;
      cacheTimestamp = Date.now();
      return status;
    })
    .finally(() => {
      inflightPromise = null;
    });

  return inflightPromise;
}

export function invalidateProfileStatusCache(): void {
  cachedStatus = null;
  cacheTimestamp = 0;
  inflightPromise = null;
}
