type CourseCatalogHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function CourseCatalogHeader({
  eyebrow,
  title,
  description,
}: CourseCatalogHeaderProps) {
  return (
    <header className="mb-8 space-y-3">
      <p className="mystic-eyebrow">{eyebrow}</p>
      <h1 className="text-2xl font-medium tracking-tight text-text-primary sm:text-[1.75rem]">
        {title}
      </h1>
      <p className="text-sm leading-[1.72] text-text-muted">{description}</p>
    </header>
  );
}
