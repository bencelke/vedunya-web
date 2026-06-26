import {
  isAppleLoginEnabled,
  isFacebookLoginEnabled,
} from "@/features/auth/config/auth-provider-flags";

export type SocialAuthProviderId = "google" | "apple" | "facebook";

export type SocialAuthProviderAvailability = Record<SocialAuthProviderId, boolean>;

export function getSocialAuthProviderAvailability(
  firebaseConfigured = true,
): SocialAuthProviderAvailability {
  return {
    google: firebaseConfigured,
    apple: isAppleLoginEnabled(),
    facebook: isFacebookLoginEnabled(),
  };
}

export function getEnabledSocialAuthProviders(
  availability: SocialAuthProviderAvailability,
): SocialAuthProviderId[] {
  return (Object.keys(availability) as SocialAuthProviderId[]).filter(
    (providerId) => availability[providerId],
  );
}

export const SOCIAL_AUTH_PROVIDER_ORDER: SocialAuthProviderId[] = [
  "google",
  "apple",
  "facebook",
];
