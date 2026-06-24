export function hasPublicPayPalClientId(): boolean {
  const value = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  return typeof value === "string" && value.trim().length > 0;
}

export function getPublicPayPalClientId(): string | null {
  if (!hasPublicPayPalClientId()) {
    return null;
  }
  return process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!.trim();
}
