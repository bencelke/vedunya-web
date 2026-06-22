import { z } from "zod";

const localizedPhaseFields = z.object({
  titleRu: z.string().optional(),
  titleEn: z.string().optional(),
  shortRu: z.string().optional(),
  shortEn: z.string().optional(),
  deepRu: z.string().optional(),
  deepEn: z.string().optional(),
  actionRu: z.string().optional(),
  actionEn: z.string().optional(),
  warningRu: z.string().optional(),
  warningEn: z.string().optional(),
});

export const moonPhaseFirestoreSchema = localizedPhaseFields;

const lunarDayTranslationSchema = z.object({
  title: z.string(),
  short: z.string(),
  deep: z.string(),
  focus: z.string(),
  action: z.string(),
  warning: z.string(),
  ritual: z.string(),
  reflection: z.string(),
});

export const lunarDayFirestoreSchema = z.object({
  day: z.number().int().min(1).max(30).optional(),
  energyLevel: z.string().optional(),
  focusKey: z.string().optional(),
  translations: z
    .object({
      ru: lunarDayTranslationSchema.partial().optional(),
      en: lunarDayTranslationSchema.partial().optional(),
    })
    .optional(),
  ru: lunarDayTranslationSchema.partial().optional(),
  en: lunarDayTranslationSchema.partial().optional(),
});

export type MoonPhaseFirestoreDocument = z.infer<typeof moonPhaseFirestoreSchema>;
export type LunarDayFirestoreDocument = z.infer<typeof lunarDayFirestoreSchema>;
