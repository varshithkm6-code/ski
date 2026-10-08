"use client";

import React from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Chip } from "@/components/ui/Chip";
import { Target, Zap, Award, Sparkles, HeartHandshake } from "lucide-react";

interface ScoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  breakdown: Record<string, unknown>;
  totalScore: number;
}

export function ScoreDrawer({ isOpen, onClose, breakdown, totalScore }: ScoreDrawerProps) {
  if (!breakdown) return null;

  const getPoints = (val: unknown, max: number) => {
    if (typeof val === "number") return Math.min(max, Math.round(val * max * 10) / 10);
    if (val && typeof (val as { score?: number }).score === "number") return Math.min(max, Math.round((val as { score: number }).score * 10) / 10);
    return 0;
  };

  const getExplanation = (key: string, defaultText: string) => {
    const explanations = breakdown.explanations as Record<string, string> | undefined;
    if (explanations?.[key]) return explanations[key];
    const section = breakdown[key] as { explanation?: string } | undefined;
    if (section?.explanation) return section.explanation;
    return defaultText;
  };

  const components = [
    {
      title: "Core Skill Coverage",
      weight: "40%",
      maxPoints: 40,
      points: getPoints(breakdown.skillCoverage, 40),
      explanation: getExplanation("skillCoverage", "Measures mandatory requirements where your proficiency meets or exceeds the required threshold."),
      icon: <Target className="w-4 h-4 text-primary" />,
      color: "bg-primary",
    },
    {
      title: "Proficiency Depth",
      weight: "30%",
      maxPoints: 30,
      points: getPoints(breakdown.proficiencyMatch, 30),
      explanation: getExplanation("proficiencyMatch", "Calculates your proficiency depth relative to the role's required levels on must-have skills."),
      icon: <Zap className="w-4 h-4 text-primary" />,
      color: "bg-primary",
    },
    {
      title: "Evidence Reliability",
      weight: "20%",
      maxPoints: 20,
      points: getPoints(breakdown.evidenceStrength, 20),
      explanation: getExplanation("evidenceStrength", "Quality of proof: Certifications (1.00x), Experience (0.95x), Projects (0.90x), Self-Rated (0.75x)."),
      icon: <Award className="w-4 h-4 text-primary" />,
      color: "bg-primary",
    },
    {
      title: "Nice-to-Have Bonus",
      weight: "5%",
      maxPoints: 5,
      points: getPoints(breakdown.niceToHaveBonus, 5),
      explanation: getExplanation("niceToHaveBonus", "Bonus credit earned for complementary tools and optional framework knowledge."),
      icon: <Sparkles className="w-4 h-4 text-primary" />,
      color: "bg-primary",
    },
    {
      title: "Soft Skills & Team Fit",
      weight: "5%",
      maxPoints: 5,
      points: getPoints(breakdown.softSkillIndicator, 5),
      explanation: getExplanation("softSkillIndicator", "Evaluates communication, problem solving, and collaborative signals (returns 0 when no signal)."),
      icon: <HeartHandshake className="w-4 h-4 text-primary" />,
      color: "bg-primary",
    },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="How Your Score is Calculated"
      description="SkillBridge uses an auditable, deterministic scoring engine with zero demographic inputs."
    >
      {/* Mathematical Formula Callout */}
      <div className="p-4 rounded-card bg-surface-subtle border border-border">
        <span className="text-[11px] font-mono uppercase tracking-wider text-muted font-bold block mb-1.5">
          Deterministic Readiness Formula
        </span>
        <code className="text-xs font-mono text-ink block bg-surface p-2.5 rounded-control border border-border/60 overflow-x-auto">
          Score = round(0.40·Coverage + 0.30·Proficiency + 0.20·Evidence + 0.05·Bonus + 0.05·Soft) × 100
        </code>
        <div className="flex items-center justify-between text-xs text-muted mt-2">
          <span>Target Score: <strong className="text-ink font-mono">{totalScore}/100</strong></span>
          <Chip variant="neutral" className="text-[10px]">Deterministic Engine</Chip>
        </div>
      </div>

      {/* 5 Components */}
      <div className="space-y-4">
        {components.map((item) => {
          const pct = Math.min(100, Math.round((item.points / item.maxPoints) * 100));

          return (
            <div
              key={item.title}
              className="p-4 rounded-card border border-border bg-surface hover:border-border/80 transition"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-surface-subtle border border-border">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
                    <span className="text-[11px] text-muted">Weight: {item.weight}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-semibold text-ink font-mono tabular-nums">
                    {item.points} / {item.maxPoints}
                  </span>
                  <span className="text-[11px] text-muted block">pts earned</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-surface-subtle border border-border/50 overflow-hidden mb-2">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Plain-English Explanation */}
              <p className="text-xs text-muted leading-relaxed">
                {item.explanation}
              </p>
            </div>
          );
        })}
      </div>

      {/* Auditability & Fairness note */}
      <div className="p-4 rounded-card bg-surface-subtle/70 border border-border text-xs text-muted leading-relaxed">
        <p className="font-semibold text-ink mb-1">Auditability & AI Safety</p>
        <p>
          Unlike black-box models, SkillBridge calculates your readiness score solely from verified technical competencies and evidence tiers. Name, demographics, location, and educational prestige are explicitly excluded.
        </p>
      </div>
    </Drawer>
  );
}
