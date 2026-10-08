"use client";

import React, { useState } from "react";
import { Sparkles, FileText, HelpCircle, CheckCircle, ArrowRight, Info } from "lucide-react";

export interface AIInsightsData {
  summary?: string;
  strengths: string[];
  priorityGaps: Array<{
    skillName: string;
    rationale: string;
    recommendedAction: string;
  }>;
  resumeTips: string[];
  interviewQuestions: Array<{
    question: string;
    context: string;
    prepTip: string;
  }>;
  disclaimer: string;
}

interface AIInsightsViewProps {
  insights: AIInsightsData | null;
}

export function AIInsightsView({ insights }: AIInsightsViewProps) {
  const [activeTab, setActiveTab] = useState<"strengths" | "resume" | "interview">("strengths");

  if (!insights) {
    return (
      <div className="card p-8 text-center text-muted text-xs">
        AI insights are generating or unavailable.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Header with Disclaimer Chip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-control bg-surface-subtle border border-border text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("strengths")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              activeTab === "strengths"
                ? "bg-surface text-ink font-semibold shadow-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Key Strengths ({insights.strengths?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("resume")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              activeTab === "resume"
                ? "bg-surface text-ink font-semibold shadow-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span>Resume Tips ({insights.resumeTips?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("interview")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
              activeTab === "interview"
                ? "bg-surface text-ink font-semibold shadow-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            <span>Interview Prep ({insights.interviewQuestions?.length || 0})</span>
          </button>
        </div>

        {/* Quiet AI Disclaimer Chip with Info Tooltip */}
        <div className="relative group">
          <span className="inline-flex items-center gap-1 text-[11px] text-muted bg-surface-subtle border border-border px-2.5 py-1 rounded-full cursor-help">
            <Info className="w-3 h-3 text-muted" />
            <span>AI-generated guidance</span>
          </span>
          <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block z-30 w-72 p-2.5 rounded-card bg-surface border border-border shadow-lg text-[11px] text-muted leading-relaxed">
            {insights.disclaimer || "AI-generated recommendations are assistive guidance and do not guarantee hiring outcomes or employment."}
          </div>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === "strengths" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-200">
          {insights.strengths.map((str, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-card border border-border bg-surface-subtle/40 flex items-start gap-2.5"
            >
              <CheckCircle className="w-4 h-4 text-status-strong shrink-0 mt-0.5" />
              <span className="text-xs text-ink leading-relaxed font-medium">{str}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === "resume" && (
        <div className="space-y-2.5 animate-in fade-in duration-200">
          {insights.resumeTips.map((tip, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-card border border-border bg-surface-subtle/40 flex items-start gap-2.5"
            >
              <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span className="text-xs text-ink leading-relaxed">{tip}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === "interview" && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {(insights.interviewQuestions || []).map((q, idx) => (
            <div
              key={idx}
              className="p-4 rounded-card border border-border bg-surface space-y-2"
            >
              <div className="flex items-start gap-2">
                <span className="text-xs font-mono font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10 shrink-0">
                  Q{idx + 1}
                </span>
                <span className="text-xs font-semibold text-ink leading-relaxed">{q.question}</span>
              </div>
              {q.context && (
                <div className="text-[11px] text-muted pl-7">
                  <span className="font-semibold text-ink">Context:</span> {q.context}
                </div>
              )}
              {q.prepTip && (
                <div className="text-[11px] text-primary bg-primary/5 border border-primary/15 p-2 rounded-control pl-3 mt-1.5">
                  <span className="font-semibold">Preparation Strategy:</span> {q.prepTip}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
