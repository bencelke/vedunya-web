import { type ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

type MobilePageProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
};

export function MobilePage({
  children,
  className,
  title,
  description,
}: MobilePageProps) {
  return (
    <Container className={cn("py-6", className)}>
      {(title || description) && (
        <header className="mb-6 space-y-2">
          {title ? (
            <h1 className="text-2xl font-medium tracking-tight text-text-primary">
              {title}
            </h1>
          ) : null}
          {description ? (
            <p className="text-sm leading-relaxed text-text-muted">
              {description}
            </p>
          ) : null}
        </header>
      )}
      {children}
    </Container>
  );
}
