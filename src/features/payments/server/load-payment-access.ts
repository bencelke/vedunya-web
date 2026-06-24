import "server-only";

import { loadUserEntitlements } from "@/features/payments/server/entitlement-repository";

export async function loadOwnedCourseIds(uid: string): Promise<ReadonlySet<string>> {
  const entitlements = await loadUserEntitlements(uid);
  return entitlements.ownedCourseIds;
}
