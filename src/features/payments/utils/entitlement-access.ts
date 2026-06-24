import type { MysticPlusEntitlement } from "@/features/payments/types/payment";

export function hasActiveMysticPlusEntitlement(
  entitlement: MysticPlusEntitlement | null,
): boolean {
  return entitlement?.status === "active";
}

export function isMysticPlusPending(entitlement: MysticPlusEntitlement | null): boolean {
  return entitlement?.status === "pending";
}
