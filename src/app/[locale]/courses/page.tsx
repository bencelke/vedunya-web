import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { MobilePage } from "@/components/layout/mobile-page";
import { CourseCatalog } from "@/features/courses/components/course-catalog";
import { CourseErrorState } from "@/features/courses/components/course-error-state";
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

  let items = [];
  try {
    items = await loadCourseCatalog(locale as SupportedLocale);
  } catch {
    return (
      <>
        <AppHeader showLogin={false} />
        <AppShell>
          <MobilePage title={t("heading")} description={t("description")}>
            <CourseErrorState message={t("loadError")} />
          </MobilePage>
        </AppShell>
      </>
    );
  }

  return (
    <>
      <AppHeader showLogin={false} />
      <AppShell>
        <MobilePage title={t("heading")} description={t("description")}>
          <CourseCatalog courses={items} />
        </MobilePage>
      </AppShell>
    </>
  );
}
