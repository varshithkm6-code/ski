"use client";

import React, { useEffect, useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { ShieldCheck, HelpCircle } from "lucide-react";

interface ScoreGaugeProps {
  score: number; // 0 - 100
  confidence?: number; // 0 - 1
  size?: number;
  delta?: number | null;
  onWhyThisScore?: () => void;
}

export function ScoreGauge({
  score,
  confidence = 0.85,
  size = 180,
  delta = null,
  onWhyThisScore,
}: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const prevScoreRef = React.useRef(0);

  // Smooth count-up animation
  useEffect(() => {
    const start = prevScoreRef.current;
    const end = Math.round(score);
    prevScoreRef.current = end;
    if (start === end) {
      setDisplayScore(end);
      return;
    }

    const duration = 600;
    const startTime = performance.now();

    const updateScore = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * ease);
      setDisplayScore(current);

      if (progress < 1) {
        requestAnimationFrame(updateScore);
      }
    };

    requestAnimationFrame(updateScore);
  }, [score]);

  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (score / 100) * circumference;

  let statusVariant: "strong" | "partial" | "critical" = "critical";
  let verdict = "Developing — Fundamental skill gaps require targeted preparation.";
  let trackColor = "#059669";

  if (score >= 75) {
    statusVariant = "strong";
    verdict = "Job Ready — Competencies closely match industry hiring benchmarks.";
    trackColor = "#059669";
  } else if (score >= 50) {
    statusVariant = "partial";
    verdict = "Near Ready — Core skills in place; address 2-3 prioritized gaps.";
    trackColor = "#D97706";
  } else {
    statusVariant = "critical";
    trackColor = "#E11D48";
  }

  const confidencePct = Math.round(confidence * 100);

  return (
    <div className="flex flex-col items-center text-center w-full">
      {/* Ring Gauge Container */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
          aria-hidden="true"
        >
          {/* Soft background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#EEF0FF"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active progress stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease",
            }}
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline justify-center relative">
            <span className="score-numeral">
              {displayScore}
            </span>
            {delta !== null && delta !== 0 && (
              <span className="absolute -top-1 -right-7 text-xs font-mono font-bold text-primary bg-primary-subtle px-1.5 py-0.5 rounded-full animate-bounce">
                +{delta}
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono font-medium text-muted uppercase tracking-wider -mt-1">
            out of 100
          </span>
        </div>
      </div>

      {/* Badges strip */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Chip variant={statusVariant}>
          {score >= 75 ? "Job Ready" : score >= 50 ? "Near Ready" : "Skill Gap"}
        </Chip>

        <span
          className="inline-flex items-center gap-1 text-xs text-muted font-medium px-2.5 py-1 rounded-full bg-surface-subtle border border-border"
          title="Evidence reliability based on verified certifications, experience, and project links"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>{confidencePct}% Confidence</span>
        </span>
      </div>

      {/* One-sentence verdict */}
      <p className="text-xs text-muted max-w-xs mt-3 leading-relaxed">
        {verdict}
      </p>

      {/* 'Why this score?' Drawer trigger */}
      {onWhyThisScore && (
        <button
          type="button"
          onClick={onWhyThisScore}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Why this score? View breakdown</span>
        </button>
      )}
    </div>
  );
}
