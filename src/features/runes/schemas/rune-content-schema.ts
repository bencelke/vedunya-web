import { z } from "zod";

const translationField = z.union([z.string(), z.array(z.string())]).optional();

export const runeTranslationSchema = z.object({
  title: translationField,
  short: translationField,
  deep: translationField,
  action: translationField,
  warning: translationField,
  affirmation: translationField,
  reflection: translationField,
});

export const runeFirestoreSchema = z.object({
  tags: z.array(z.string()).optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
  translations: z
    .object({
      en: runeTranslationSchema.optional(),
      ru: runeTranslationSchema.optional(),
    })
    .optional(),
});

export type RuneFirestoreDocument = z.infer<typeof runeFirestoreSchema>;
