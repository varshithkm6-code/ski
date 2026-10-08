"use client";

import React from "react";
import { Target, Zap, Award, Sparkles, HeartHandshake } from "lucide-react";

interface ScoringBreakdownProps {
  breakdown: Record<string, unknown>;
}

export function ScoringBreakdown({ breakdown }: ScoringBreakdownProps) {
  if (!breakdown) return null;

  const getScore = (val: unknown, max: number) => {
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

  const items = [
    {
      title: "Core Skill Coverage",
      weight: "40%",
      max: 40,
      score: getScore(breakdown.skillCoverage, 40),
      explanation: getExplanation("skillCoverage", "Coverage of mandatory requirements."),
      icon: <Target className="w-4 h-4 text-primary" />,
    },
    {
      title: "Proficiency Depth",
      weight: "30%",
      max: 30,
      score: getScore(breakdown.proficiencyMatch, 30),
      explanation: getExplanation("proficiencyMatch", "Depth of competence relative to role threshold."),
      icon: <Zap className="w-4 h-4 text-primary" />,
    },
    {
      title: "Evidence Reliability",
      weight: "20%",
      max: 20,
      score: getScore(breakdown.evidenceStrength, 20),
      explanation: getExplanation("evidenceStrength", "Verified by certifications, experience, and projects."),
      icon: <Award className="w-4 h-4 text-primary" />,
    },
    {
      title: "Nice-to-Have Bonus",
      weight: "5%",
      max: 5,
      score: getScore(breakdown.niceToHaveBonus, 5),
      explanation: getExplanation("niceToHaveBonus", "Bonus points for optional complementary tools."),
      icon: <Sparkles className="w-4 h-4 text-primary" />,
    },
    {
      title: "Soft Skills & Team Fit",
      weight: "5%",
      max: 5,
      score: getScore(breakdown.softSkillIndicator, 5),
      explanation: getExplanation("softSkillIndicator", "Evaluates communication, problem solving, and teamwork (0 if no signal)."),
      icon: <HeartHandshake className="w-4 h-4 text-primary" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {items.map((item) => {
        const pct = Math.min(100, Math.round((item.score / item.max) * 100));

        return (
          <div
            key={item.title}
            className="p-4 rounded-card border border-border bg-surface hover:border-border/80 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-xs font-semibold text-ink">
                <span className="p-1 rounded bg-surface-subtle border border-border/60">{item.icon}</span>
                <span>{item.title}</span>
              </span>
              <span className="text-xs font-mono text-muted bg-surface-subtle px-2 py-0.5 rounded-md border border-border/50 tabular-nums">
                {item.score} / {item.max} pts
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-surface-subtle border border-border/40 overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>

            <p className="text-[11px] text-muted leading-relaxed">
              {item.explanation}
            </p>
          </div>
        );
      })}
    </div>
  );
}
