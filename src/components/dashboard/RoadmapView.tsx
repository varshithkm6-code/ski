"use client";

import React, { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { useToast } from "@/components/ui/Toast";
import { Clock, Check } from "lucide-react";

export interface RoadmapItemUI {
  id: string;
  skillId: string;
  skill?: { canonicalName: string };
  phase: "DAYS_30" | "DAYS_60" | "DAYS_90" | string;
  title: string;
  whyItMatters: string;
  resourceTypes: string[] | string;
  estimatedHours: number;
  milestone: string;
  projectIdea?: string | null;
  completed: boolean;
}

interface RoadmapViewProps {
  items: RoadmapItemUI[];
  onToggleComplete?: (itemId: string, newCompleted: boolean) => Promise<void>;
}

export function RoadmapView({ items, onToggleComplete }: RoadmapViewProps) {
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const parseResources = (res: string[] | string): string[] => {
    if (Array.isArray(res)) return res;
    try {
      return JSON.parse(res);
    } catch {
      return [res];
    }
  };

  const cleanTitle = (raw: string): { cleanText: string; statusHint?: "critical" | "partial" | "strong" } => {
    const cleanText = raw.replace(/[🔴🟡🟢]/g, "").trim();
    let statusHint: "critical" | "partial" | "strong" = "partial";
    if (raw.includes("🔴") || raw.toLowerCase().includes("master") || raw.toLowerCase().includes("critical")) {
      statusHint = "critical";
    } else if (raw.includes("🟢")) {
      statusHint = "strong";
    }
    return { cleanText, statusHint };
  };

  const phases = [
    {
      key: "DAYS_30",
      label: "Month 1 (Days 1–30)",
      focus: "Foundation & Critical Gaps",
      badge: "P1 Priority",
    },
    {
      key: "DAYS_60",
      label: "Month 2 (Days 31–60)",
      focus: "Applied Projects & Integration",
      badge: "P2 Priority",
    },
    {
      key: "DAYS_90",
      label: "Month 3 (Days 61–90)",
      focus: "Mastery & Technical Interviews",
      badge: "P3 Priority",
    },
  ];

  const handleToggle = async (item: RoadmapItemUI) => {
    if (!onToggleComplete) return;
    setLoadingId(item.id);
    const newCompleted = !item.completed;

    try {
      await onToggleComplete(item.id, newCompleted);
      if (newCompleted) {
        toast({
          type: "success",
          title: "Milestone Completed!",
          description: `Score boosted by +4 points for ${cleanTitle(item.title).cleanText}`,
        });
      } else {
        toast({
          type: "info",
          title: "Milestone Reopened",
          description: `Score updated for ${cleanTitle(item.title).cleanText}`,
        });
      }
    } catch {
      toast({
        type: "error",
        title: "Action failed",
        description: "Could not update milestone status.",
      });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* 3-Column Horizontal Timeline on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {phases.map((phase) => {
          const phaseItems = items.filter((i) => i.phase === phase.key);
          const totalHours = phaseItems.reduce((acc, i) => acc + i.estimatedHours, 0);
          const completedCount = phaseItems.filter((i) => i.completed).length;

          return (
            <div
              key={phase.key}
              className="p-4 rounded-card border border-border bg-surface-subtle/40 flex flex-col justify-between"
            >
              {/* Column Header */}
              <div className="pb-3 border-b border-border/60 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink">{phase.label}</span>
                  <span className="text-[11px] font-mono text-muted">
                    {completedCount}/{phaseItems.length} completed
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted mt-1">
                  <span>{phase.focus}</span>
                  <span className="font-mono">{totalHours}h study</span>
                </div>
              </div>

              {/* Items in Phase */}
              <div className="space-y-3 flex-1">
                {phaseItems.length === 0 ? (
                  <div className="p-4 rounded-control bg-surface border border-border/60 text-center text-xs text-muted">
                    No active gaps assigned to this phase.
                  </div>
                ) : (
                  phaseItems.map((item) => {
                    const { cleanText, statusHint } = cleanTitle(item.title);
                    const resources = parseResources(item.resourceTypes);
                    const isLoading = loadingId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-card border transition duration-200 ${
                          item.completed
                            ? "bg-status-strong-bg/40 border-status-strong/30"
                            : "bg-surface border-border hover:border-primary/50 shadow-xs"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Animated Checkbox */}
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleToggle(item)}
                            aria-label={`Mark ${cleanText} as ${item.completed ? "incomplete" : "complete"}`}
                            className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition cursor-pointer shrink-0 ${
                              item.completed
                                ? "bg-status-strong border-status-strong text-white"
                                : "border-border hover:border-primary bg-surface"
                            }`}
                          >
                            {item.completed && <Check className="w-3.5 h-3.5 stroke-[3] animate-check-in" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-xs font-semibold leading-tight ${
                                  item.completed ? "line-through text-muted" : "text-ink"
                                }`}
                              >
                                {cleanText}
                              </span>
                              <Chip
                                variant={statusHint === "critical" ? "critical" : "neutral"}
                                className="py-0 px-1.5 text-[9px]"
                              >
                                {statusHint === "critical" ? "Critical Gap" : "Target"}
                              </Chip>
                            </div>

                            <p className="text-[11px] text-muted mt-1 leading-relaxed">
                              {item.whyItMatters}
                            </p>

                            {/* Milestone / Project detail */}
                            {item.projectIdea && (
                              <div className="mt-2 p-2 rounded-control bg-surface-subtle/60 border border-border/50 text-[10px] text-muted">
                                <span className="font-semibold text-ink block">Project Deliverable:</span>
                                <span>{item.projectIdea}</span>
                              </div>
                            )}

                            {/* Meta & Resources */}
                            <div className="mt-2 pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-1 text-[11px] text-muted font-mono">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-muted" /> ~{item.estimatedHours}h
                              </span>

                              <div className="flex items-center gap-1">
                                {resources.slice(0, 2).map((r, i) => (
                                  <span
                                    key={i}
                                    className="px-1.5 py-0.5 rounded bg-surface-subtle border border-border/60 text-[10px]"
                                  >
                                    {r}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
