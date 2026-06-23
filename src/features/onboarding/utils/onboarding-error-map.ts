import type { ZodIssue } from "zod";

export type OnboardingErrorKey =
  | "nameRequired"
  | "nameTooLong"
  | "dobRequired"
  | "dobFormat"
  | "dobInvalid"
  | "dobFuture"
  | "dobTooOld"
  | "generic";

export function mapOnboardingZodIssue(issue: ZodIssue | undefined): OnboardingErrorKey {
  const message = issue?.message ?? "generic";

  switch (message) {
    case "nameRequired":
      return "nameRequired";
    case "nameTooLong":
      return "nameTooLong";
    case "dobFormat":
      return "dobFormat";
    case "dobInvalid":
      return "dobInvalid";
    case "dobFuture":
      return "dobFuture";
    case "dobTooOld":
      return "dobTooOld";
    default:
      return message === "Required" ? "dobRequired" : "generic";
  }
}
