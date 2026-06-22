let lastSyncedToken: string | null = null;
let syncPromise: Promise<boolean> | null = null;

export async function createServerSession(idToken: string): Promise<boolean> {
  if (!idToken) {
    return false;
  }

  if (lastSyncedToken === idToken && syncPromise) {
    return syncPromise;
  }

  syncPromise = fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  })
    .then((response) => response.ok)
    .finally(() => {
      syncPromise = null;
    });

  lastSyncedToken = idToken;
  return syncPromise;
}

export async function clearServerSession(): Promise<void> {
  lastSyncedToken = null;
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function fetchSessionUser(): Promise<{
  uid: string;
  email: string | null;
  emailVerified: boolean;
} | null> {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    user: {
      uid: string;
      email: string | null;
      emailVerified: boolean;
    } | null;
  };

  return payload.user;
}

export function resetSessionSyncState(): void {
  lastSyncedToken = null;
  syncPromise = null;
}
