"use client";

import React from "react";
import { Check } from "lucide-react";

export interface StepItem {
  id: string;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: StepItem[];
  currentStepIndex: number; // 0, 1, 2
  onStepClick?: (index: number) => void;
}

export function Stepper({ steps, currentStepIndex, onStepClick }: StepperProps) {
  const currentStep = steps[currentStepIndex];

  return (
    <div className="w-full">
      {/* Mobile view (< 640px): Compact 'Step X of Y' */}
      <div className="sm:hidden flex items-center justify-between p-3.5 rounded-card bg-surface border border-border">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
          <h2 className="text-sm font-semibold text-ink mt-0.5">
            {currentStep?.label}
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStepIndex
                  ? "w-6 bg-primary"
                  : idx < currentStepIndex
                  ? "w-2.5 bg-secondary"
                  : "w-2.5 bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop view (>= 640px): Full connected progress line with checkmarks */}
      <div className="hidden sm:flex items-center justify-between relative max-w-2xl mx-auto py-2">
        {/* Background track line */}
        <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-0.5 bg-border -z-0" />

        {/* Active progress fill line */}
        <div
          className="absolute top-1/2 left-8 -translate-y-1/2 h-0.5 bg-primary transition-all duration-300 -z-0"
          style={{
            width: `${(currentStepIndex / (steps.length - 1)) * 88}%`,
          }}
        />

        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const canClick = idx <= currentStepIndex;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!canClick}
              onClick={() => canClick && onStepClick?.(idx)}
              className={`relative z-10 flex items-center gap-3 px-3 py-1.5 rounded-full bg-canvas transition focus:outline-none ${
                canClick ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-semibold transition-all duration-200 ${
                  isDone
                    ? "bg-primary text-white shadow-xs"
                    : isCurrent
                    ? "bg-white border-2 border-primary text-primary shadow-sm"
                    : "bg-surface border border-border text-muted"
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[2.5]" /> : idx + 1}
              </div>

              <div className="text-left">
                <span
                  className={`text-xs font-semibold block transition ${
                    isCurrent ? "text-ink font-bold" : isDone ? "text-ink" : "text-muted"
                  }`}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="text-[11px] text-muted hidden md:block">
                    {step.description}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
