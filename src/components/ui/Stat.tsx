import React from "react";

interface StatProps {
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function Stat({ label, value, sublabel, trend, className = "", icon }: StatProps) {
  return (
    <div className={`p-4 rounded-card border border-border bg-surface ${className}`}>
      <div className="flex items-center justify-between text-xs text-muted font-medium mb-1.5">
        <span>{label}</span>
        {icon && <span className="text-muted/70">{icon}</span>}
      </div>
      <div className="text-2xl font-semibold text-ink tabular-nums tracking-tight">
        {value}
      </div>
      {(sublabel || trend) && (
        <div className="flex items-center gap-1.5 text-xs text-muted mt-1">
          {trend && <span className="font-medium text-primary">{trend}</span>}
          {sublabel && <span>{sublabel}</span>}
        </div>
      )}
    </div>
  );
}
