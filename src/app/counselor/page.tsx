"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Chip } from "@/components/ui/Chip";
import { Stat } from "@/components/ui/Stat";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Users, AlertCircle } from "lucide-react";

interface StudentData {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  profile: {
    profileSkills: Array<{
      skill: { canonicalName: string };
      proficiency: number;
      evidenceType: string;
    }>;
  } | null;
  analyses: Array<{
    id: string;
    score: number;
    confidence: number;
    role: { title: string; seniority: string };
    gaps: Array<{
      status: string;
      skill: { canonicalName: string };
      userProficiency: number;
      requiredProficiency: number;
    }>;
    roadmapItems: Array<{ id: string; title: string; completed: boolean }>;
  }>;
}

export default function CounselorPage() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

  useEffect(() => {
    fetch("/api/counselor/cohort")
      .then((res) => res.json())
      .then((data) => {
        if (data.students) {
          setStudents(data.students);
          if (data.students.length > 0) {
            setSelectedStudent(data.students[0]);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => { /* done */ });
  }, []);

  const totalStudents = students.length;
  const analyzedStudents = students.filter((s) => s.analyses.length > 0);
  const isCohortSufficient = totalStudents >= 5;

  const avgScore =
    analyzedStudents.length > 0
      ? Math.round(
          analyzedStudents.reduce((acc, s) => acc + s.analyses[0].score, 0) /
            analyzedStudents.length
        )
      : 0;

  const readyCount = analyzedStudents.filter((s) => s.analyses[0].score >= 75).length;
  const atRiskCount = analyzedStudents.filter((s) => s.analyses[0].score < 50).length;

  // Distribution Histogram data
  const distributionData = [
    { range: "< 50", count: analyzedStudents.filter((s) => s.analyses[0].score < 50).length },
    { range: "50–64", count: analyzedStudents.filter((s) => s.analyses[0].score >= 50 && s.analyses[0].score < 65).length },
    { range: "65–74", count: analyzedStudents.filter((s) => s.analyses[0].score >= 65 && s.analyses[0].score < 75).length },
    { range: "75–84", count: analyzedStudents.filter((s) => s.analyses[0].score >= 75 && s.analyses[0].score < 85).length },
    { range: "85+", count: analyzedStudents.filter((s) => s.analyses[0].score >= 85).length },
  ];

  // Most Common Gaps aggregation
  const gapFrequencyMap: Record<string, number> = {};
  analyzedStudents.forEach((s) => {
    const latest = s.analyses[0];
    if (latest && latest.gaps) {
      latest.gaps.forEach((g) => {
        if (g.status === "CRITICAL_GAP" || g.status === "MISSING") {
          const name = g.skill?.canonicalName || "Unknown";
          gapFrequencyMap[name] = (gapFrequencyMap[name] || 0) + 1;
        }
      });
    }
  });

  const commonGapsData = Object.entries(gapFrequencyMap)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="card p-6 bg-surface">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider block mb-1">
                Advising Portal
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-ink">
                Counselor Cohort Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
                Monitor student readiness across industry benchmarks, identify systemic skill gaps, and review individual progress.
              </p>
            </div>
          </div>

          {/* KPI Tiles */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <Stat
              label="Total Advisees"
              value={totalStudents}
              sublabel="Enrolled in cohort"
              icon={<Users className="w-4 h-4 text-primary" />}
            />
            <Stat
              label="Cohort Avg Score"
              value={isCohortSufficient ? `${avgScore}/100` : "Not enough data"}
              sublabel={isCohortSufficient ? "Across active assessments" : "Cohort < 5 students"}
            />
            <Stat
              label="Job-Ready (75+)"
              value={isCohortSufficient ? readyCount : "Not enough data"}
              sublabel={isCohortSufficient ? `${Math.round((readyCount / Math.max(1, totalStudents)) * 100)}% of cohort` : "Cohort < 5 students"}
            />
            <Stat
              label="At-Risk (<50)"
              value={isCohortSufficient ? atRiskCount : "Not enough data"}
              sublabel={isCohortSufficient ? "Requires intervention" : "Cohort < 5 students"}
            />
          </div>
        </div>

        {/* Charts Section: Distribution Histogram & Most Common Gaps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Readiness Distribution Histogram */}
          <div className="card p-6 bg-surface space-y-4">
            <div>
              <h3 className="text-base font-semibold text-ink">
                Readiness Score Distribution
              </h3>
              <p className="text-xs text-muted">
                Cohort competency histogram across score brackets
              </p>
            </div>

            {!isCohortSufficient ? (
              <div className="h-56 flex flex-col items-center justify-center text-center p-6 bg-surface-subtle/50 rounded-control border border-border/60">
                <AlertCircle className="w-6 h-6 text-muted mb-2" />
                <span className="text-xs font-semibold text-ink">Not enough data</span>
                <p className="text-[11px] text-muted max-w-xs mt-1">
                  At least 5 cohort advisees are required to calculate aggregate score distributions (current: {totalStudents}).
                </p>
              </div>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#E3E6F5" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="range" tick={{ fill: "#5B6080", fontSize: 11 }} axisLine={{ stroke: "#E3E6F5" }} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: "#5B6080", fontSize: 11 }} axisLine={{ stroke: "#E3E6F5" }} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E3E6F5",
                        borderRadius: "10px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Most Common Gaps Bar Chart */}
          <div className="card p-6 bg-surface space-y-4">
            <div>
              <h3 className="text-base font-semibold text-ink">
                Most Common Critical Gaps
              </h3>
              <p className="text-xs text-muted">
                Frequently missing skills across student target roles
              </p>
            </div>

            {!isCohortSufficient ? (
              <div className="h-56 flex flex-col items-center justify-center text-center p-6 bg-surface-subtle/50 rounded-control border border-border/60">
                <AlertCircle className="w-6 h-6 text-muted mb-2" />
                <span className="text-xs font-semibold text-ink">Not enough data</span>
                <p className="text-[11px] text-muted max-w-xs mt-1">
                  At least 5 cohort advisees are required for aggregate gap frequency analysis (current: {totalStudents}).
                </p>
              </div>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={commonGapsData.length > 0 ? commonGapsData : [{ skill: "None identified", count: 0 }]}
                    layout="vertical"
                    margin={{ top: 10, right: 10, left: 30, bottom: 0 }}
                  >
                    <CartesianGrid stroke="#E3E6F5" strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: "#5B6080", fontSize: 11 }} axisLine={{ stroke: "#E3E6F5" }} tickLine={false} />
                    <YAxis type="category" dataKey="skill" tick={{ fill: "#12142B", fontSize: 11 }} axisLine={{ stroke: "#E3E6F5" }} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E3E6F5",
                        borderRadius: "10px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" fill="#E11D48" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Student Roster & Drilldown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Advisees Roster */}
          <div className="card p-5 lg:col-span-4 space-y-3 bg-surface">
            <h3 className="font-semibold text-sm text-ink pb-2 border-b border-border">
              Cohort Advisees ({students.length})
            </h3>

            <div className="space-y-2">
              {students.map((student) => {
                const latest = student.analyses[0];
                const isSelected = selectedStudent?.id === student.id;

                return (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`p-3 rounded-card border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? "bg-primary/[0.04] border-primary ring-1 ring-primary"
                        : "bg-surface border-border hover:border-border/80"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs text-ink">
                        {student.name || student.email}
                      </div>
                      <div className="text-[11px] text-muted truncate">
                        {latest ? latest.role.title : "No assessment yet"}
                      </div>
                    </div>

                    {latest ? (
                      <Chip
                        variant={latest.score >= 75 ? "strong" : latest.score >= 50 ? "partial" : "critical"}
                        className="text-xs font-mono font-bold"
                      >
                        {Math.round(latest.score)}/100
                      </Chip>
                    ) : (
                      <span className="text-[10px] text-muted">Pending</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Student Individual Drilldown */}
          <div className="card p-6 lg:col-span-8 bg-surface space-y-6">
            {selectedStudent ? (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                  <div>
                    <h2 className="text-lg font-bold text-ink">
                      {selectedStudent.name || selectedStudent.email}
                    </h2>
                    <span className="text-xs text-muted">
                      {selectedStudent.email} · Candidate Profile
                    </span>
                  </div>

                  {selectedStudent.analyses[0] && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted">Latest Score:</span>
                      <Chip
                        variant={
                          selectedStudent.analyses[0].score >= 75
                            ? "strong"
                            : selectedStudent.analyses[0].score >= 50
                            ? "partial"
                            : "critical"
                        }
                        className="text-sm font-bold font-mono px-3 py-1"
                      >
                        {Math.round(selectedStudent.analyses[0].score)}/100
                      </Chip>
                    </div>
                  )}
                </div>

                {/* Skills Verified */}
                <div className="mt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                    Verified Competencies ({selectedStudent.profile?.profileSkills.length ?? 0}):
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStudent.profile?.profileSkills.map((ps, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-control bg-surface-subtle border border-border text-ink font-medium"
                      >
                        {ps.skill.canonicalName}{" "}
                        <strong className="text-primary font-mono">
                          {ps.proficiency}/5
                        </strong>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Latest Assessment Details */}
                {selectedStudent.analyses[0] ? (
                  <div className="mt-6 space-y-5">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-border/60">
                      <div>
                        <span className="text-muted">Target Benchmark: </span>
                        <strong className="text-ink">
                          {selectedStudent.analyses[0].role.title} ({selectedStudent.analyses[0].role.seniority})
                        </strong>
                      </div>
                      <span className="text-muted font-mono">
                        {Math.round(selectedStudent.analyses[0].confidence * 100)}% Confidence
                      </span>
                    </div>

                    {/* Gaps List */}
                    <div>
                      <h4 className="text-xs font-semibold text-ink mb-2">
                        Individual Gap Breakdown:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {selectedStudent.analyses[0].gaps.map((gap, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-control border border-border bg-surface-subtle/40 flex items-center justify-between text-xs"
                          >
                            <span className="text-ink font-medium">
                              {gap.skill.canonicalName}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] text-muted">
                                {gap.userProficiency}/{gap.requiredProficiency}
                              </span>
                              <Chip
                                variant={
                                  gap.status === "STRONG"
                                    ? "strong"
                                    : gap.status === "PARTIAL_GAP"
                                    ? "partial"
                                    : "critical"
                                }
                                className="text-[10px]"
                              >
                                {gap.status}
                              </Chip>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Milestones Progress */}
                    <div>
                      <h4 className="text-xs font-semibold text-ink mb-2">
                        Roadmap Milestone Execution:
                      </h4>
                      <div className="space-y-1.5">
                        {selectedStudent.analyses[0].roadmapItems.map((item) => (
                          <div
                            key={item.id}
                            className="text-xs p-2.5 rounded-control bg-surface border border-border flex items-center justify-between"
                          >
                            <span className={item.completed ? "line-through text-muted" : "text-ink"}>
                              {item.title.replace(/[🔴🟡🟢]/g, "").trim()}
                            </span>
                            {item.completed ? (
                              <Chip variant="strong" className="text-[10px]">
                                Completed
                              </Chip>
                            ) : (
                              <Chip variant="neutral" className="text-[10px]">
                                Pending
                              </Chip>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 text-center py-10 text-muted text-xs bg-surface-subtle/50 rounded-control border border-border/60">
                    This candidate has not generated an assessment yet.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-muted text-xs">
                Select a student from the cohort roster to inspect their gap analysis.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
