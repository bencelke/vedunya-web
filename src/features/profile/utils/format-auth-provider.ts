export function formatAuthProviderLabel(providerId: string): string {
  switch (providerId) {
    case "password":
      return "Email";
    case "google.com":
      return "Google";
    case "apple.com":
      return "Apple";
    default:
      return providerId;
  }
}
