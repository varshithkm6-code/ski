"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Chip } from "@/components/ui/Chip";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { BarChart3, ArrowRight } from "lucide-react";

interface HistoryItem {
  id: string;
  score: number;
  confidence: number;
  createdAt: string;
  role: {
    id: string;
    title: string;
    seniority: string;
  };
  gaps: Array<{
    status: string;
  }>;
  roadmapItems: Array<{ id: string }>;
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => {
        if (data.analyses) setAnalyses(data.analyses);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Format data chronologically for score-over-time AreaChart
  const chartData = [...analyses]
    .reverse()
    .map((item, idx) => ({
      index: idx + 1,
      date: new Date(item.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      score: Math.round(item.score),
      role: item.role.title,
    }));

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="card p-6 bg-surface">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider block mb-1">
                Progression Intelligence
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-ink">
                Career Readiness History
              </h1>
              <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
                Track your benchmark score trajectory, completed milestones, and gap reductions over time.
              </p>
            </div>

            <Link href="/dashboard" className="btn-primary text-xs px-4 h-9 self-start sm:self-auto">
              <span>New Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted text-xs">
            Loading assessment history...
          </div>
        ) : analyses.length === 0 ? (
          <div className="card p-12 text-center text-muted space-y-3">
            <BarChart3 className="w-8 h-8 mx-auto text-muted/60" />
            <h3 className="font-semibold text-ink">No assessments recorded yet</h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Run your first skill gap analysis against any target role to begin tracking your readiness progression.
            </p>
            <Link href="/dashboard" className="btn-primary text-xs px-4 py-2 inline-flex">
              Start Assessment →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Score-over-Time Area Chart Card with Gradient Teal Fill */}
            <div className="card p-6 bg-surface space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-ink">
                    Score Progression Over Time
                  </h3>
                  <p className="text-xs text-muted">
                    Readiness score trajectory across completed assessments
                  </p>
                </div>
                <Chip variant="primary" className="text-[10px]">
                  {analyses.length} Assessment{analyses.length > 1 ? "s" : ""}
                </Chip>
              </div>

              <div className="w-full h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="indigoScoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#E3E6F5" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#5B6080", fontSize: 11 }}
                      axisLine={{ stroke: "#E3E6F5" }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "#5B6080", fontSize: 11 }}
                      axisLine={{ stroke: "#E3E6F5" }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E3E6F5",
                        borderRadius: "10px",
                        boxShadow: "0 4px 12px rgba(18, 20, 43, 0.08)",
                        fontSize: "12px",
                      }}
                      formatter={(value, _name, props) => [
                        `${Number(value ?? 0)}/100 pts (${(props.payload as { role?: string })?.role ?? ""})`,
                        "Score",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#4F46E5"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#indigoScoreGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Assessment History Table */}
            <div className="card p-6 bg-surface space-y-4">
              <h3 className="text-base font-semibold text-ink">
                Completed Assessments Table
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left" aria-label="Assessment history table">
                  <thead>
                    <tr className="border-b border-border text-muted font-medium">
                      <th className="py-2.5 pr-4">Date</th>
                      <th className="py-2.5 px-3">Target Role</th>
                      <th className="py-2.5 px-3 text-center">Seniority</th>
                      <th className="py-2.5 px-3 text-center">Score</th>
                      <th className="py-2.5 px-3">Gaps & Strengths</th>
                      <th className="py-2.5 pl-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {analyses.map((item) => {
                      const criticalCount = item.gaps.filter(
                        (g) => g.status === "CRITICAL_GAP" || g.status === "MISSING"
                      ).length;
                      const strongCount = item.gaps.filter((g) => g.status === "STRONG").length;
                      const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      });

                      const statusVariant =
                        item.score >= 75 ? "strong" : item.score >= 50 ? "partial" : "critical";

                      return (
                        <tr key={item.id} className="hover:bg-surface-subtle/50 transition">
                          <td className="py-3 pr-4 font-mono text-muted whitespace-nowrap">
                            {dateStr}
                          </td>
                          <td className="py-3 px-3 font-semibold text-ink">
                            {item.role.title}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Chip variant="neutral" className="text-[10px] uppercase font-mono">
                              {item.role.seniority}
                            </Chip>
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold">
                            <Chip variant={statusVariant} className="text-xs tabular-nums">
                              {Math.round(item.score)}/100
                            </Chip>
                          </td>
                          <td className="py-3 px-3 text-muted">
                            <span className="text-status-critical-text font-medium">
                              {criticalCount} critical
                            </span>{" "}
                            ·{" "}
                            <span className="text-status-strong-text font-medium">
                              {strongCount} strong
                            </span>{" "}
                            ·{" "}
                            <span className="font-mono text-primary">
                              {item.roadmapItems.length} milestones
                            </span>
                          </td>
                          <td className="py-3 pl-3 text-right">
                            <Link
                              href={`/dashboard?role=${item.role.id}`}
                              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                            >
                              <span>Re-assess</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
