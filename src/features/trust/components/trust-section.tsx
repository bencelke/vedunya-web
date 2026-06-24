import type { ReactNode } from "react";

type TrustSectionProps = {
  title?: string;
  children: ReactNode;
};

export function TrustSection({ title, children }: TrustSectionProps) {
  return (
    <section className="mystic-cosmic-card space-y-3 p-5 sm:p-6">
      {title ? (
        <h2 className="text-sm font-medium text-text-primary">{title}</h2>
      ) : null}
      <div className="space-y-3 break-words text-sm leading-[1.72] text-text-muted">{children}</div>
    </section>
  );
}
