import type { CourseContentBlock } from "@/features/courses/types/course";

type LessonReaderProps = {
  blocks: CourseContentBlock[];
  practiceLabel: string;
  reflectionLabel: string;
};

function renderBlock(
  block: CourseContentBlock,
  index: number,
  labels: Pick<LessonReaderProps, "practiceLabel" | "reflectionLabel">,
) {
  switch (block.type) {
    case "heading":
      return (
        <h2
          key={`heading-${index}`}
          className="text-xl font-medium leading-snug text-text-primary"
        >
          {block.text}
        </h2>
      );
    case "paragraph":
      return (
        <p
          key={`paragraph-${index}`}
          className="text-[0.9375rem] leading-7 text-text-muted"
        >
          {block.text}
        </p>
      );
    case "bullet-list":
      return (
        <ul
          key={`bullet-list-${index}`}
          className="list-disc space-y-2 pl-5 text-[0.9375rem] leading-7 text-text-muted"
        >
          {block.items.map((item, itemIndex) => (
            <li key={`bullet-${index}-${itemIndex}`}>{item}</li>
          ))}
        </ul>
      );
    case "numbered-list":
      return (
        <ol
          key={`numbered-list-${index}`}
          className="list-decimal space-y-2 pl-5 text-[0.9375rem] leading-7 text-text-muted"
        >
          {block.items.map((item, itemIndex) => (
            <li key={`numbered-${index}-${itemIndex}`}>{item}</li>
          ))}
        </ol>
      );
    case "quote":
      return (
        <blockquote
          key={`quote-${index}`}
          className="border-l-2 border-accent-gold/40 pl-4 text-[0.9375rem] italic leading-7 text-text-primary"
        >
          {block.text}
        </blockquote>
      );
    case "practice":
      return (
        <section
          key={`practice-${index}`}
          className="rounded-[calc(var(--radius-card)-0.15rem)] border border-accent-gold/20 bg-accent-gold-muted/40 p-4"
        >
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-accent-gold">
            {labels.practiceLabel}
          </p>
          <h3 className="mt-2 text-base font-medium text-text-primary">
            {block.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            {block.text}
          </p>
        </section>
      );
    case "reflection":
      return (
        <section
          key={`reflection-${index}`}
          className="rounded-[calc(var(--radius-card)-0.15rem)] border border-accent-violet-soft bg-surface-primary p-4"
        >
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-subtle">
            {labels.reflectionLabel}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text-primary">
            {block.prompt}
          </p>
        </section>
      );
    default:
      return null;
  }
}

export function LessonReader({
  blocks,
  practiceLabel,
  reflectionLabel,
}: LessonReaderProps) {
  return (
    <article className="min-w-0 space-y-5 overflow-hidden">
      {blocks.map((block, index) =>
        renderBlock(block, index, { practiceLabel, reflectionLabel }),
      )}
    </article>
  );
}
