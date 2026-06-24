let lastSyncedToken: string | null = null;
let lastSyncSucceeded = false;
let syncPromise: Promise<boolean> | null = null;
let logoutPromise: Promise<void> | null = null;
let serverSessionCleared = false;

export async function createServerSession(idToken: string): Promise<boolean> {
  if (!idToken) {
    return false;
  }

  if (lastSyncedToken === idToken) {
    if (syncPromise) {
      return syncPromise;
    }

    if (lastSyncSucceeded) {
      return true;
    }
  }

  serverSessionCleared = false;

  syncPromise = fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  })
    .then((response) => {
      lastSyncSucceeded = response.ok;
      if (response.ok) {
        serverSessionCleared = false;
      }
      return response.ok;
    })
    .finally(() => {
      syncPromise = null;
    });

  lastSyncedToken = idToken;
  return syncPromise;
}

export async function syncServerSession(
  idToken: string,
  firebaseUid: string,
): Promise<boolean> {
  if (!idToken || !firebaseUid) {
    return false;
  }

  if (lastSyncedToken === idToken) {
    if (syncPromise) {
      return syncPromise;
    }

    if (lastSyncSucceeded) {
      return true;
    }
  }

  const existingUser = await fetchSessionUser();
  if (existingUser?.uid === firebaseUid) {
    lastSyncedToken = idToken;
    lastSyncSucceeded = true;
    return true;
  }

  return createServerSession(idToken);
}

export async function clearServerSession(): Promise<void> {
  lastSyncedToken = null;
  lastSyncSucceeded = false;

  if (serverSessionCleared) {
    return;
  }

  if (logoutPromise) {
    return logoutPromise;
  }

  logoutPromise = fetch("/api/auth/logout", { method: "POST" })
    .then(() => {
      serverSessionCleared = true;
    })
    .finally(() => {
      logoutPromise = null;
    });

  return logoutPromise;
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
  lastSyncSucceeded = false;
  syncPromise = null;
  logoutPromise = null;
  serverSessionCleared = false;
}
