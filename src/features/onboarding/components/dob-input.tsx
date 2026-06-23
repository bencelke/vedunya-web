"use client";

import { useMemo } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type DobInputProps = {
  id: string;
  label: string;
  helper: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DobInput({
  id,
  label,
  helper,
  value,
  onChange,
  className,
}: DobInputProps) {
  const maxDate = useMemo(() => todayIsoDate(), []);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-2">
        <Label htmlFor={id} tone="auth">
          {label}
        </Label>
        <Input
          id={id}
          type="date"
          tone="auth"
          min="1900-01-01"
          max={maxDate}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-12 appearance-none rounded-[var(--radius-md)] border border-auth-border bg-auth-surface-muted px-3 text-auth-text-primary"
        />
      </div>
      <p className="text-xs leading-relaxed text-auth-text-subtle">{helper}</p>
    </div>
  );
}
