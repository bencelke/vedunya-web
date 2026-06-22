"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";

type LessonCompleteButtonProps = {
  courseId: string;
  lessonId: string;
  completed: boolean;
  locked: boolean;
};

export function LessonCompleteButton({
  courseId,
  lessonId,
  completed,
  locked,
}: LessonCompleteButtonProps) {
  const t = useTranslations("courses");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(completed);
  const disabled = locked || isCompleted || isSubmitting;

  async function handleComplete() {
    if (disabled) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/courses/${courseId}/progress/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ lessonId }),
        },
      );

      if (!response.ok) {
        return;
      }

      setIsCompleted(true);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  const label = isCompleted
    ? t("markCompleteDone")
    : isSubmitting
      ? t("markCompleteSubmitting")
      : t("markComplete");

  return (
    <Button
      type="button"
      className="w-full"
      disabled={disabled}
      aria-disabled={disabled}
      onClick={handleComplete}
    >
      {label}
    </Button>
  );
}
