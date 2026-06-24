"use client";

import { useRouter } from "@/i18n/navigation";

import { CoursePayPalButton } from "@/features/payments/components/CoursePayPalButton";
import type { SupportedLocale } from "@/config/app-config";

type CoursePurchaseSectionProps = {
  locale: SupportedLocale;
  courseId: string;
};

export function CoursePurchaseSection({
  locale,
  courseId,
}: CoursePurchaseSectionProps) {
  const router = useRouter();

  return (
    <CoursePayPalButton
      locale={locale}
      courseId={courseId}
      onVerified={() => {
        router.refresh();
      }}
    />
  );
}
