import type { AuthError } from "firebase/auth";

export type AuthErrorKey =
  | "generic"
  | "invalidEmail"
  | "invalidCredential"
  | "userDisabled"
  | "emailAlreadyInUse"
  | "weakPassword"
  | "tooManyRequests"
  | "popupBlocked"
  | "popupClosed"
  | "network"
  | "unauthorizedDomain"
  | "operationNotAllowed"
  | "configuration"
  | "passwordMismatch"
  | "termsRequired"
  | "googleSignInFailed";

export function mapFirebaseAuthError(error: unknown): AuthErrorKey {
  if (!error || typeof error !== "object") {
    return "generic";
  }

  const authError = error as AuthError;
  const code = authError.code ?? "";

  switch (code) {
    case "auth/invalid-email":
      return "invalidEmail";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "invalidCredential";
    case "auth/user-disabled":
      return "userDisabled";
    case "auth/email-already-in-use":
      return "emailAlreadyInUse";
    case "auth/weak-password":
      return "weakPassword";
    case "auth/too-many-requests":
      return "tooManyRequests";
    case "auth/popup-blocked":
      return "popupBlocked";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "popupClosed";
    case "auth/network-request-failed":
      return "network";
    case "auth/unauthorized-domain":
      return "unauthorizedDomain";
    case "auth/operation-not-allowed":
      return "operationNotAllowed";
    default:
      return "generic";
  }
}

export function mapZodIssueToAuthError(message: string): AuthErrorKey {
  switch (message) {
    case "emailInvalid":
      return "invalidEmail";
    case "passwordMismatch":
      return "passwordMismatch";
    case "termsRequired":
      return "termsRequired";
    case "passwordTooShort":
      return "weakPassword";
    default:
      return "generic";
  }
}
