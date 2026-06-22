import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  narrow?: boolean;
};

export function Container({
  className,
  narrow = false,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full min-w-0 overflow-x-hidden px-[var(--spacing-page)]",
        narrow ? "max-w-md" : "max-w-lg",
        className,
      )}
      {...props}
    />
  );
}
