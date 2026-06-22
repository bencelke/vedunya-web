import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("emailInvalid"),
  password: z.string().min(1, "passwordRequired"),
});

export const registerSchema = z
  .object({
    email: z.email("emailInvalid"),
    password: z.string().min(8, "passwordTooShort"),
    confirmPassword: z.string().min(1, "confirmPasswordRequired"),
    acceptTerms: z.literal(true, "termsRequired"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "passwordMismatch",
  });

export const forgotPasswordSchema = z.object({
  email: z.email("emailInvalid"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
