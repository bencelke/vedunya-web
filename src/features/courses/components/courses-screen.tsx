import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { MobilePage } from "@/components/layout/mobile-page";
import { CourseCatalog } from "@/features/courses/components/course-catalog";
import { CourseCatalogHeader } from "@/features/courses/components/course-catalog-header";
import { CourseErrorState } from "@/features/courses/components/course-error-state";
import type { CourseCatalogItem } from "@/features/courses/types/course";

type CoursesScreenProps = {
  courses: CourseCatalogItem[] | null;
  eyebrow: string;
  title: string;
  description: string;
  errorMessage?: string;
};

export function CoursesScreen({
  courses,
  eyebrow,
  title,
  description,
  errorMessage,
}: CoursesScreenProps) {
  return (
    <>
      <AppHeader showLogin={false} />
      <AppShell>
        <MobilePage className="mystic-today-column py-6 pt-safe-top">
          <CourseCatalogHeader
            eyebrow={eyebrow}
            title={title}
            description={description}
          />
          {courses ? (
            <CourseCatalog courses={courses} />
          ) : (
            <CourseErrorState message={errorMessage ?? ""} />
          )}
        </MobilePage>
      </AppShell>
    </>
  );
}
