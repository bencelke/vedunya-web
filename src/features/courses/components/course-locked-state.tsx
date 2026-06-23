import { CourseAccessNotice } from "@/features/courses/components/course-access-notice";

type CourseLockedStateProps = {
  title: string;
  message: string;
};

export function CourseLockedState({ title, message }: CourseLockedStateProps) {
  return <CourseAccessNotice title={title} message={message} />;
}
