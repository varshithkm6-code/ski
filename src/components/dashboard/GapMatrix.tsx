"use client";

import React, { useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { Award, Briefcase, FolderGit2, UserCheck, ArrowUpDown } from "lucide-react";

export interface GapItem {
  id?: string;
  canonicalName: string;
  status: "STRONG" | "PARTIAL_GAP" | "CRITICAL_GAP" | "MISSING" | string;
  userProficiency: number;
  requiredProficiency: number;
  required: boolean;
  weight: number;
  evidenceType?: string;
}

interface GapMatrixProps {
  gaps: GapItem[];
}

export function GapMatrix({ gaps }: GapMatrixProps) {
  const [filter, setFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"weight" | "status" | "name">("weight");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const counts = {
    ALL: gaps.length,
    CRITICAL_GAP: gaps.filter((g) => g.status === "CRITICAL_GAP").length,
    MISSING: gaps.filter((g) => g.status === "MISSING").length,
    PARTIAL_GAP: gaps.filter((g) => g.status === "PARTIAL_GAP").length,
    STRONG: gaps.filter((g) => g.status === "STRONG").length,
  };

  const filtered = gaps.filter((g) => {
    if (filter === "ALL") return true;
    return g.status === filter;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortBy === "weight") cmp = b.weight - a.weight;
    else if (sortBy === "name") cmp = a.canonicalName.localeCompare(b.canonicalName);
    else if (sortBy === "status") cmp = a.status.localeCompare(b.status);
    return sortOrder === "desc" ? cmp : -cmp;
  });

  const toggleSort = (field: "weight" | "status" | "name") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case "STRONG":
        return <Chip variant="strong">Strong Match</Chip>;
      case "PARTIAL_GAP":
        return <Chip variant="partial">Partial Gap</Chip>;
      case "CRITICAL_GAP":
        return <Chip variant="critical">Critical Gap</Chip>;
      case "MISSING":
        return <Chip variant="missing">Missing</Chip>;
      default:
        return <Chip variant="neutral">{status}</Chip>;
    }
  };

  const getEvidenceIcon = (ev?: string) => {
    switch (ev) {
      case "CERTIFICATION":
        return (
          <span title="Verified Certification (1.00x)" className="inline-flex items-center">
            <Award className="w-3.5 h-3.5 text-primary" />
          </span>
        );
      case "EXPERIENCE":
        return (
          <span title="Work Experience (0.95x)" className="inline-flex items-center">
            <Briefcase className="w-3.5 h-3.5 text-primary" />
          </span>
        );
      case "PROJECT":
        return (
          <span title="Project Proof (0.90x)" className="inline-flex items-center">
            <FolderGit2 className="w-3.5 h-3.5 text-primary" />
          </span>
        );
      default:
        return (
          <span title="Self-Rated (0.75x)" className="inline-flex items-center">
            <UserCheck className="w-3.5 h-3.5 text-muted" />
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar: Filter tabs & Sort button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-0.5">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-control font-medium transition cursor-pointer ${
              filter === "ALL"
                ? "bg-surface-subtle text-ink font-semibold border border-border"
                : "text-muted hover:text-ink"
            }`}
          >
            All ({counts.ALL})
          </button>
          <button
            onClick={() => setFilter("CRITICAL_GAP")}
            className={`px-3 py-1.5 rounded-control font-medium transition cursor-pointer ${
              filter === "CRITICAL_GAP"
                ? "bg-status-critical-bg text-status-critical-text font-bold border border-status-critical/20"
                : "text-muted hover:text-status-critical-text"
            }`}
          >
            Critical ({counts.CRITICAL_GAP})
          </button>
          <button
            onClick={() => setFilter("MISSING")}
            className={`px-3 py-1.5 rounded-control font-medium transition cursor-pointer ${
              filter === "MISSING"
                ? "bg-status-missing-bg text-status-missing-text font-bold border border-status-missing/20"
                : "text-muted hover:text-status-missing-text"
            }`}
          >
            Missing ({counts.MISSING})
          </button>
          <button
            onClick={() => setFilter("PARTIAL_GAP")}
            className={`px-3 py-1.5 rounded-control font-medium transition cursor-pointer ${
              filter === "PARTIAL_GAP"
                ? "bg-status-partial-bg text-status-partial-text font-bold border border-status-partial/20"
                : "text-muted hover:text-status-partial-text"
            }`}
          >
            Partial ({counts.PARTIAL_GAP})
          </button>
          <button
            onClick={() => setFilter("STRONG")}
            className={`px-3 py-1.5 rounded-control font-medium transition cursor-pointer ${
              filter === "STRONG"
                ? "bg-status-strong-bg text-status-strong-text font-bold border border-status-strong/20"
                : "text-muted hover:text-status-strong-text"
            }`}
          >
            Strong ({counts.STRONG})
          </button>
        </div>

        {/* Sort Trigger */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted hidden sm:inline">Sort:</span>
          <button
            onClick={() => toggleSort("weight")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-control border transition cursor-pointer ${
              sortBy === "weight" ? "bg-surface-subtle border-border text-ink font-semibold" : "border-transparent text-muted"
            }`}
          >
            <span>Impact Weight</span>
            <ArrowUpDown className="w-3 h-3 text-muted" />
          </button>
        </div>
      </div>

      {/* Grid of Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {sorted.map((item, idx) => {
          const userPct = (item.userProficiency / 5) * 100;
          const reqPct = (item.requiredProficiency / 5) * 100;

          return (
            <div
              key={`${item.canonicalName}-${idx}`}
              className="p-4 rounded-card border border-border bg-surface flex flex-col justify-between hover:border-border/80 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-ink">
                        {item.canonicalName}
                      </span>
                      {item.required ? (
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-semibold">
                          Must-Have
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-surface-subtle text-muted">
                          Nice-to-Have
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted mt-1">
                      <span>Weight: {Math.round(item.weight * 100)}%</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        Proof: {getEvidenceIcon(item.evidenceType)}
                      </span>
                    </div>
                  </div>

                  {getStatusChip(item.status)}
                </div>
              </div>

              {/* Dual Progress Bars: You vs Required */}
              <div className="mt-3 pt-2 border-t border-border/50 space-y-1.5">
                <div className="flex justify-between text-[11px] text-muted font-medium">
                  <span>
                    Your Level:{" "}
                    <strong className="text-ink font-mono">
                      {item.userProficiency > 0 ? `${item.userProficiency}/5` : "0 (Missing)"}
                    </strong>
                  </span>
                  <span>
                    Role Threshold:{" "}
                    <strong className="text-ink font-mono">{item.requiredProficiency}/5</strong>
                  </span>
                </div>

                <div className="relative w-full h-2 rounded-full bg-surface-subtle border border-border/60 overflow-hidden">
                  {/* Required threshold marker line */}
                  <div
                    className="absolute top-0 bottom-0 border-r-2 border-deep z-10"
                    style={{ left: `${reqPct}%` }}
                    title={`Required Level: ${item.requiredProficiency}/5`}
                  />
                  {/* User Level Bar */}
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${userPct}%`,
                      backgroundColor:
                        item.status === "STRONG"
                          ? "#059669"
                          : item.status === "PARTIAL_GAP"
                          ? "#D97706"
                          : "#E11D48",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
