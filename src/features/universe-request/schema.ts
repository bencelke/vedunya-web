import { z } from "zod";

import { UNIVERSE_REQUEST_CATEGORIES } from "@/features/universe-request/types";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const universeRequestTextSchema = z
  .string()
  .trim()
  .min(1, "textRequired")
  .max(240, "textTooLong");

export const universeRequestCategorySchema = z
  .enum(UNIVERSE_REQUEST_CATEGORIES)
  .optional()
  .nullable();

export const universeRequestUpsertSchema = z.object({
  text: universeRequestTextSchema,
  category: universeRequestCategorySchema,
  reminderEnabled: z.boolean().optional(),
  reminderTime: z
    .string()
    .regex(timePattern, "invalidReminderTime")
    .optional()
    .nullable(),
});

export const universeRequestPatchSchema = z
  .object({
    text: universeRequestTextSchema.optional(),
    category: universeRequestCategorySchema,
    reminderEnabled: z.boolean().optional(),
    reminderTime: z
      .string()
      .regex(timePattern, "invalidReminderTime")
      .optional()
      .nullable(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "emptyPatch",
  });

export type UniverseRequestUpsertInput = z.infer<typeof universeRequestUpsertSchema>;
export type UniverseRequestPatchInput = z.infer<typeof universeRequestPatchSchema>;
