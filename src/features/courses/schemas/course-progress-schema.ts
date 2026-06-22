import { z } from "zod";

export const courseProgressSchema = z.object({
  courseId: z.string().min(1),
  completedLessonIds: z.array(z.string().min(1)),
  lastOpenedLessonId: z.string().nullable(),
  completedAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
  progressPercent: z.number().min(0).max(100),
  isCompleted: z.boolean(),
  isEnrolled: z.boolean(),
});

export const progressOpenRequestSchema = z.object({
  lessonId: z.string().min(1),
});

export const progressCompleteRequestSchema = z.object({
  lessonId: z.string().min(1),
});
