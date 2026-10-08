import React from "react";

export type ChipVariant = "strong" | "partial" | "critical" | "missing" | "neutral" | "primary";

interface ChipProps {
  variant?: ChipVariant;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function Chip({ variant = "neutral", children, className = "", icon }: ChipProps) {
  const variantClasses: Record<ChipVariant, string> = {
    strong: "chip-strong",
    partial: "chip-partial",
    critical: "chip-critical",
    missing: "chip-missing",
    neutral: "chip-neutral",
    primary: "bg-primary/10 text-primary border border-primary/20",
  };

  return (
    <span className={`chip ${variantClasses[variant]} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
