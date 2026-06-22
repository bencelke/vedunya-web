export type CourseProgress = {
  courseId: string;
  completedLessonIds: string[];
  lastOpenedLessonId: string | null;
  completedAt: string | null;
  updatedAt: string | null;
  progressPercent: number;
  isCompleted: boolean;
  isEnrolled: boolean;
};

export type SafeCourseProgress = CourseProgress;
