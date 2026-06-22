import type { CourseCatalogItem } from "@/features/courses/types/course";

import { CourseCard } from "./course-card";

type CourseCatalogProps = {
  courses: CourseCatalogItem[];
};

export function CourseCatalog({ courses }: CourseCatalogProps) {
  return (
    <ul className="grid min-w-0 gap-5">
      {courses.map((course) => (
        <li key={course.id} className="min-w-0">
          <CourseCard course={course} />
        </li>
      ))}
    </ul>
  );
}
