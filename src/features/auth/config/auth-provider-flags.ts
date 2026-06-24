function isEnabledFlag(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

export function isAppleLoginEnabled(): boolean {
  return isEnabledFlag(process.env.NEXT_PUBLIC_ENABLE_APPLE_LOGIN);
}

export function isFacebookLoginEnabled(): boolean {
  return isEnabledFlag(process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN);
}
