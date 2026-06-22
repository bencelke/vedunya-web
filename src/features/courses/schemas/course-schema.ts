import { z } from "zod";

export const courseContentBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), text: z.string().min(1) }),
  z.object({ type: z.literal("paragraph"), text: z.string().min(1) }),
  z.object({
    type: z.literal("bullet-list"),
    items: z.array(z.string().min(1)).min(1),
  }),
  z.object({
    type: z.literal("numbered-list"),
    items: z.array(z.string().min(1)).min(1),
  }),
  z.object({ type: z.literal("quote"), text: z.string().min(1) }),
  z.object({
    type: z.literal("practice"),
    title: z.string().min(1),
    text: z.string().min(1),
  }),
  z.object({
    type: z.literal("reflection"),
    prompt: z.string().min(1),
  }),
]);

export const courseLessonSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  runeId: z.string().optional(),
  body: z.array(courseContentBlockSchema).min(1),
});

export const courseSummarySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  coverAssetPath: z.string().nullable(),
  lessonCount: z.number().int().positive(),
  estimatedDuration: z.string().optional(),
  language: z.enum(["en", "ru"]),
  accessType: z.enum(["free", "paid", "premium"]),
  status: z.enum(["available", "coming-soon"]),
  productId: z.string().optional(),
});

export const sanityCatalogItemSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  titleEn: z.string().min(1),
  titleRu: z.string().min(1),
  excerptEn: z.string(),
  excerptRu: z.string(),
  accessType: z.string(),
  productId: z.string().nullable().optional(),
  lessonCount: z.number().int().positive().nullable().optional(),
  published: z.boolean().optional(),
  isComingSoon: z.boolean().optional(),
});

export const sanityCatalogSchema = z.array(sanityCatalogItemSchema);

export type SanityCatalogItem = z.infer<typeof sanityCatalogItemSchema>;
