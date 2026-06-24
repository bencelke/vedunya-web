import "server-only";

function readConfiguredSecrets(): string[] {
  const values = [
    process.env.SCHEDULED_REMINDERS_SECRET,
    process.env.CRON_SECRET,
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0);

  return [...new Set(values)];
}

export function isScheduledRemindersAuthConfigured(): boolean {
  return readConfiguredSecrets().length > 0;
}

export function verifyScheduledRemindersAuthorization(
  authorizationHeader: string | null,
): boolean {
  const secrets = readConfiguredSecrets();
  if (secrets.length === 0) {
    return false;
  }

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return false;
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();
  if (!token) {
    return false;
  }

  return secrets.includes(token);
}
