import { z } from "zod";

export const profileLocaleSchema = z.enum(["en", "ru"]);

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "nameRequired")
  .max(100, "nameTooLong");

export const dateOfBirthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "dobFormat")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }, "dobInvalid")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date <= today;
  }, "dobFuture")
  .refine((value) => {
    const year = Number(value.split("-")[0]);
    return year >= 1900;
  }, "dobTooOld")
  .refine((value) => {
    const year = Number(value.split("-")[0]);
    return year <= new Date().getFullYear();
  }, "dobTooNew");

export const onboardingNameSchema = z.object({
  displayName: displayNameSchema,
});

export const onboardingDobSchema = z.object({
  dateOfBirth: dateOfBirthSchema,
});

export const onboardingLanguageSchema = z.object({
  language: profileLocaleSchema,
});

export const onboardingCompleteSchema = z.object({
  displayName: displayNameSchema,
  dateOfBirth: dateOfBirthSchema,
  language: profileLocaleSchema,
});

export const profileUpdateSchema = onboardingCompleteSchema;

export type OnboardingCompleteInput = z.infer<typeof onboardingCompleteSchema>;
export type ProfileUpdateInputValidated = z.infer<typeof profileUpdateSchema>;

export function parseDateOfBirth(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateOfBirth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
