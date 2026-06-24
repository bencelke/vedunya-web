import type { ReactNode } from "react";

import { Card, CardLabel } from "@/components/ui/card";

type ProfileSectionCardProps = {
  label: string;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function ProfileSectionCard({
  label,
  title,
  description,
  children,
  className,
}: ProfileSectionCardProps) {
  return (
    <Card
      elevated
      className={`bg-surface-elevated/90 backdrop-blur-sm ${className ?? ""}`}
    >
      <CardLabel>{label}</CardLabel>
      {title ? (
        <h2 className="mt-2 text-base font-medium text-text-primary">{title}</h2>
      ) : null}
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-text-muted">{description}</p>
      ) : null}
      <div className={title || description ? "mt-4" : "mt-3"}>{children}</div>
    </Card>
  );
}
