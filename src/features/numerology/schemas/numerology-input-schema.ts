import { z } from "zod";

export const supportedNumerologyLocaleSchema = z.enum(["en", "ru"]);

export const personalDayInputSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  calculationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  locale: supportedNumerologyLocaleSchema,
  userSeed: z.string().optional(),
});

export type PersonalDayInputValidated = z.infer<typeof personalDayInputSchema>;
