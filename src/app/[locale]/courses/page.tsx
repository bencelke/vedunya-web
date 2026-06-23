import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { CoursesScreen } from "@/features/courses/components/courses-screen";
import { loadCourseCatalog } from "@/features/courses/services/load-course-catalog";
import type { SupportedLocale } from "@/config/app-config";

type CoursesPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: CoursesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "courses" });
  return { title: t("metaTitle") };
}

export default async function CoursesPage({ params }: CoursesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("courses");

  let items = null;
  let loadFailed = false;

  try {
    items = await loadCourseCatalog(locale as SupportedLocale);
  } catch {
    loadFailed = true;
  }

  return (
    <CoursesScreen
      courses={loadFailed ? null : items}
      eyebrow={t("catalogEyebrow")}
      title={t("heading")}
      description={t("description")}
      errorMessage={loadFailed ? t("loadError") : undefined}
    />
  );
}
