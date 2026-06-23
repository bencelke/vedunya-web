import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type AuthFormCardProps = {
  children: ReactNode;
  className?: string;
};

/** Groups email/password fields with consistent vertical rhythm. */
export function AuthFormCard({ children, className }: AuthFormCardProps) {
  return <div className={cn("space-y-6", className)}>{children}</div>;
}
