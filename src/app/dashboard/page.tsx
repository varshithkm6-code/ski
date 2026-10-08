"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Stepper, StepItem } from "@/components/ui/Stepper";
import { Chip } from "@/components/ui/Chip";
import { useToast } from "@/components/ui/Toast";
import { ScoreGauge } from "@/components/dashboard/ScoreGauge";
import { ScoreDrawer } from "@/components/dashboard/ScoreDrawer";
import { SkillRadar, SkillRadarItem } from "@/components/dashboard/SkillRadar";
import { GapMatrix, GapItem } from "@/components/dashboard/GapMatrix";
import { AIInsightsView, AIInsightsData } from "@/components/dashboard/AIInsightsView";
import { RoadmapView, RoadmapItemUI } from "@/components/dashboard/RoadmapView";
import {
  Upload,
  FileCheck,
  Star,
  Plus,
  Trash2,
  Search,
  Printer,
  RotateCcw,
  Briefcase,
  GraduationCap
} from "lucide-react";

interface RoleOption {
  id: string;
  slug: string;
  title: string;
  seniority: string;
  description: string;
  roleSkills: Array<{
    skill: { canonicalName: string };
    required: boolean;
    weight: number;
    minProficiency: number;
  }>;
}

interface UserSkill {
  skillName: string;
  proficiency: number;
  evidenceType: "SELF_RATED" | "PROJECT" | "EXPERIENCE" | "CERTIFICATION";
  evidenceNotes?: string;
}

const STEPS: StepItem[] = [
  { id: "profile", label: "Candidate Profile", description: "Resume or manual skills" },
  { id: "role", label: "Target Role", description: "Benchmark or custom JD" },
  { id: "results", label: "Readiness Intelligence", description: "Score, gaps & roadmap" },
];

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas flex items-center justify-center text-xs text-muted">Loading readiness analyzer...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const queryRole = searchParams ? searchParams.get("role") : null;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Profile Skills State
  const [skills, setSkills] = useState<UserSkill[]>([
    { skillName: "JavaScript", proficiency: 3, evidenceType: "PROJECT" },
    { skillName: "React", proficiency: 3, evidenceType: "PROJECT" },
    { skillName: "HTML", proficiency: 4, evidenceType: "EXPERIENCE" },
    { skillName: "CSS", proficiency: 3, evidenceType: "EXPERIENCE" },
    { skillName: "Git", proficiency: 3, evidenceType: "SELF_RATED" },
    { skillName: "REST API", proficiency: 2, evidenceType: "PROJECT" },
  ]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newProficiency, setNewProficiency] = useState(3);
  const [newEvidence, setNewEvidence] = useState<UserSkill["evidenceType"]>("PROJECT");

  // File Upload State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Role Selection State
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [roleSearch, setRoleSearch] = useState("");
  const [seniorityFilter, setSeniorityFilter] = useState("ALL");
  const [activeRoleTab, setActiveRoleTab] = useState<"library" | "custom">("library");
  const [customJDText, setCustomJDText] = useState("");
  const [extractingJD, setExtractingJD] = useState(false);

  // Assessment Results State
  const [analyzing, setAnalyzing] = useState(false);
  const [scoreDrawerOpen, setScoreDrawerOpen] = useState(false);
  const [scoreDelta, setScoreDelta] = useState<number | null>(null);

  const [analysisResult, setAnalysisResult] = useState<{
    id: string;
    score: number;
    confidence: number;
    breakdown: Record<string, unknown>;
    aiInsights: AIInsightsData | null;
    gaps: GapItem[];
    roadmapItems: RoadmapItemUI[];
    roleTitle: string;
    roleSeniority: string;
  } | null>(null);

  // Fetch roles and profile on mount
  useEffect(() => {
    fetch("/api/roles")
      .then((res) => res.json())
      .then((data) => {
        if (data.roles && data.roles.length > 0) {
          setRoles(data.roles);
          if (queryRole && data.roles.some((r: RoleOption) => r.id === queryRole)) {
            setSelectedRoleId(queryRole);
            setCurrentStepIndex(1);
          } else {
            setSelectedRoleId(data.roles[0].id);
          }
        }
      })
      .catch((err) => console.error("Error loading roles:", err));

    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile?.profileSkills && data.profile.profileSkills.length > 0) {
          const loaded: UserSkill[] = data.profile.profileSkills.map((ps: { skill: { canonicalName: string }; proficiency: number; evidenceType: string; evidenceNotes?: string }) => ({
            skillName: ps.skill.canonicalName,
            proficiency: ps.proficiency,
            evidenceType: ps.evidenceType,
            evidenceNotes: ps.evidenceNotes,
          }));
          setSkills(loaded);
        }
      })
      .catch((err) => console.error("Error loading profile:", err));
  }, [queryRole]);

  // Presets
  const loadAlexProfile = () => {
    setSkills([
      { skillName: "JavaScript", proficiency: 4, evidenceType: "PROJECT" },
      { skillName: "TypeScript", proficiency: 3, evidenceType: "PROJECT" },
      { skillName: "React", proficiency: 4, evidenceType: "PROJECT" },
      { skillName: "HTML", proficiency: 5, evidenceType: "EXPERIENCE" },
      { skillName: "CSS", proficiency: 4, evidenceType: "EXPERIENCE" },
      { skillName: "Tailwind CSS", proficiency: 4, evidenceType: "PROJECT" },
      { skillName: "Git", proficiency: 3, evidenceType: "PROJECT" },
      { skillName: "REST API", proficiency: 3, evidenceType: "PROJECT" },
      { skillName: "Next.js", proficiency: 3, evidenceType: "PROJECT" },
    ]);
    setUploadedFileName("alex_chen_cs_resume.pdf");
    toast({
      type: "success",
      title: "Sample Profile Loaded",
      description: "Alex Chen (CS Graduate · 9 core skills loaded)",
    });
  };

  const loadJordanProfile = () => {
    setSkills([
      { skillName: "Python", proficiency: 3, evidenceType: "CERTIFICATION" },
      { skillName: "SQL", proficiency: 3, evidenceType: "PROJECT" },
      { skillName: "Excel", proficiency: 5, evidenceType: "EXPERIENCE" },
      { skillName: "Tableau", proficiency: 3, evidenceType: "PROJECT" },
      { skillName: "Power BI", proficiency: 2, evidenceType: "SELF_RATED" },
      { skillName: "Git", proficiency: 2, evidenceType: "SELF_RATED" },
      { skillName: "Communication", proficiency: 5, evidenceType: "EXPERIENCE" },
    ]);
    setUploadedFileName("jordan_kim_career_transition.pdf");
    toast({
      type: "success",
      title: "Sample Profile Loaded",
      description: "Jordan Kim (Career Switcher · 7 data skills loaded)",
    });
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const exists = skills.some(
      (s) => s.skillName.toLowerCase() === newSkillName.trim().toLowerCase()
    );
    if (!exists) {
      setSkills([
        ...skills,
        {
          skillName: newSkillName.trim(),
          proficiency: newProficiency,
          evidenceType: newEvidence,
        },
      ]);
      toast({
        type: "info",
        title: "Skill Added",
        description: `${newSkillName.trim()} rated at level ${newProficiency}/5`,
      });
    }
    setNewSkillName("");
  };

  const handleRemoveSkill = (name: string) => {
    setSkills(skills.filter((s) => s.skillName !== name));
  };

  const handleProficiencyChange = (name: string, prof: number) => {
    setSkills(
      skills.map((s) => (s.skillName === name ? { ...s, proficiency: prof } : s))
    );
  };

  const handleEvidenceChange = (name: string, ev: UserSkill["evidenceType"]) => {
    setSkills(
      skills.map((s) => (s.skillName === name ? { ...s, evidenceType: ev } : s))
    );
  };

  // File Upload
  const handleFileUpload = async (file: File) => {
    if (file.size > 4 * 1024 * 1024) {
      toast({
        type: "error",
        title: "File Exceeds 4 MB Limit",
        description: "Please upload a resume document under 4 MB.",
      });
      return;
    }

    setUploading(true);
    setUploadedFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("resume", file);

    try {
      const res = await fetch("/api/profile/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.extractedSkills) {
        const parsed: UserSkill[] = data.extractedSkills.map((s: { name: string; proficiency?: number }) => ({
          skillName: s.name,
          proficiency: s.proficiency || 3,
          evidenceType: "PROJECT",
        }));
        setSkills(parsed);
        toast({
          type: "success",
          title: "Resume Extracted",
          description: `${parsed.length} competencies extracted from ${file.name}`,
        });
      } else if (res.ok) {
        toast({
          type: "info",
          title: "File Accepted",
          description: `${file.name} saved into profile draft.`,
        });
      } else {
        toast({
          type: "error",
          title: "Upload Failed",
          description: data.error || "Could not parse document text.",
        });
      }
    } catch {
      toast({
        type: "error",
        title: "Upload Failed",
        description: "Network or parsing error occurred.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfileAndContinue = async () => {
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parsedData: { education: [], experience: [], certifications: [], projects: [] },
          skills,
        }),
      });
      setCurrentStepIndex(1);
    } catch {
      setCurrentStepIndex(1);
    }
  };

  // Custom JD Extraction
  const handleExtractJD = async () => {
    if (!customJDText.trim()) return;
    setExtractingJD(true);
    try {
      const res = await fetch("/api/roles/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText: customJDText }),
      });
      const data = await res.json();
      if (data.role) {
        setRoles([data.role, ...roles]);
        setSelectedRoleId(data.role.id);
        setActiveRoleTab("library");
        toast({
          type: "success",
          title: "Job Requirements Extracted",
          description: `${data.role.title} extracted from custom JD text`,
        });
      }
    } catch {
      toast({
        type: "error",
        title: "JD Extraction Failed",
        description: "Please check your JD text and try again.",
      });
    } finally {
      setExtractingJD(false);
    }
  };

  // Run Assessment
  const handleRunAnalysis = async () => {
    if (!selectedRoleId) return;
    setAnalyzing(true);

    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parsedData: { education: [], experience: [], certifications: [], projects: [] },
          skills,
        }),
      });

      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId: selectedRoleId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      const a = data.analysis;
      const role = roles.find((r) => r.id === selectedRoleId);

      setAnalysisResult({
        id: a.id,
        score: a.score,
        confidence: a.confidence ?? 0.85,
        breakdown: a.breakdown,
        aiInsights: a.aiInsights,
        gaps: a.gaps.map((g: { id: string; skill?: { canonicalName: string }; status: string; userProficiency: number; requiredProficiency: number; weight: number }) => ({
          id: g.id,
          canonicalName: g.skill?.canonicalName || "Skill",
          status: g.status,
          userProficiency: g.userProficiency,
          requiredProficiency: g.requiredProficiency,
          required: g.weight >= 0.6,
          weight: g.weight,
        })),
        roadmapItems: a.roadmapItems.map((r: { id: string; skillId: string; skill?: { canonicalName: string }; phase: string; title: string; whyItMatters: string; resourceTypes: string[]; estimatedHours: number; milestone: string; projectIdea?: string | null; completed: boolean }) => ({
          id: r.id,
          skillId: r.skillId,
          skill: r.skill,
          phase: r.phase,
          title: r.title,
          whyItMatters: r.whyItMatters,
          resourceTypes: r.resourceTypes,
          estimatedHours: r.estimatedHours,
          milestone: r.milestone,
          projectIdea: r.projectIdea,
          completed: r.completed,
        })),
        roleTitle: role?.title || "Target Role",
        roleSeniority: role?.seniority || "ENTRY",
      });

      setCurrentStepIndex(2);
      toast({
        type: "success",
        title: "Assessment Generated",
        description: `Career Readiness Score: ${a.score}/100`,
      });
    } catch {
      toast({
        type: "error",
        title: "Analysis Failed",
        description: "Could not complete scoring assessment.",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Live Score Recalculation on Roadmap Item completion
  const handleToggleRoadmapItem = async (itemId: string, newCompleted: boolean) => {
    if (!analysisResult) return;

    const updatedRoadmap = analysisResult.roadmapItems.map((i) =>
      i.id === itemId ? { ...i, completed: newCompleted } : i
    );

    const boostScore = Math.min(100, Math.round(analysisResult.score + (newCompleted ? 4 : -4)));
    setScoreDelta(newCompleted ? 4 : null);

    setAnalysisResult({
      ...analysisResult,
      score: boostScore,
      roadmapItems: updatedRoadmap,
    });

    try {
      const res = await fetch(`/api/roadmap/${itemId}/complete`, { method: "PATCH" });
      const data = await res.json();
      if (data.newScore !== undefined) {
        setAnalysisResult((prev) => (prev ? { ...prev, score: data.newScore } : null));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const radarData: SkillRadarItem[] = analysisResult
    ? analysisResult.gaps.map((g) => ({
        skill: g.canonicalName,
        user: g.userProficiency,
        required: g.requiredProficiency,
      }))
    : [];

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Top Stepper Header */}
        <section aria-label="Assessment Progress" className="no-print">
          <Stepper
            steps={STEPS}
            currentStepIndex={currentStepIndex}
            onStepClick={(idx) => setCurrentStepIndex(idx)}
          />
        </section>

        {/* ── STEP 1: CANDIDATE PROFILE INTAKE ── */}
        {currentStepIndex === 0 && (
          <div className="space-y-6 animate-step-transition">
            {/* Try a Sample Profile Cards */}
            <div className="card p-5 bg-surface-subtle/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
                    Try a Sample Profile
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    Pre-populate competencies to test the scoring engine instantly
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={loadAlexProfile}
                  className="p-3.5 rounded-card bg-surface border border-border hover:border-primary text-left transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-control bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-ink group-hover:text-primary transition">
                        Alex Chen
                      </div>
                      <span className="text-[11px] text-muted block">
                        CS Graduate · Target: Frontend Developer
                      </span>
                    </div>
                  </div>
                  <Chip variant="neutral" className="text-[10px]">9 skills</Chip>
                </button>

                <button
                  type="button"
                  onClick={loadJordanProfile}
                  className="p-3.5 rounded-card bg-surface border border-border hover:border-primary text-left transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-control bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-ink group-hover:text-primary transition">
                        Jordan Kim
                      </div>
                      <span className="text-[11px] text-muted block">
                        Career Switcher · Target: Data Analyst
                      </span>
                    </div>
                  </div>
                  <Chip variant="neutral" className="text-[10px]">7 skills</Chip>
                </button>
              </div>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files[0];
                if (file) handleFileUpload(file);
              }}
              className={`card p-6 border-2 border-dashed transition-all duration-200 text-center ${
                isDragging
                  ? "border-primary bg-primary/[0.04]"
                  : "border-border hover:border-primary/60 bg-surface"
              }`}
            >
              <input
                type="file"
                id="resume-upload-input"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              <label
                htmlFor="resume-upload-input"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-4"
              >
                <div className="w-12 h-12 rounded-full bg-surface-subtle border border-border flex items-center justify-center text-primary">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="font-semibold text-sm text-ink block">
                    Upload your resume (PDF or DOCX)
                  </span>
                  <span className="text-xs text-muted mt-1 block">
                    Server extracts skills, experience levels, and certifications
                  </span>
                </div>

                {uploadedFileName && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>{uploadedFileName}</span>
                  </div>
                )}

                {uploading && (
                  <span className="text-xs text-primary font-medium animate-pulse mt-2 block">
                    Parsing resume text & extracting verified skills...
                  </span>
                )}
              </label>
            </div>

            {/* Competency Editor Table */}
            <div className="card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-semibold text-ink">
                    Competencies & Evidence ({skills.length})
                  </h3>
                  <p className="text-xs text-muted">
                    Adjust proficiency (1–5) and evidence reliability tiers for accurate scoring
                  </p>
                </div>
              </div>

              {/* Add Skill Row */}
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-card bg-surface-subtle/60 border border-border">
                <input
                  type="text"
                  placeholder="Add skill (e.g. Docker, TypeScript, SQL)..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                  className="control-input flex-1 min-w-[200px] text-xs h-9"
                />

                <select
                  value={newProficiency}
                  onChange={(e) => setNewProficiency(Number(e.target.value))}
                  className="control-input w-36 text-xs h-9 bg-surface"
                >
                  <option value={1}>1 - Novice</option>
                  <option value={2}>2 - Adv. Beginner</option>
                  <option value={3}>3 - Competent</option>
                  <option value={4}>4 - Proficient</option>
                  <option value={5}>5 - Expert</option>
                </select>

                <select
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value as "SELF_RATED" | "PROJECT" | "EXPERIENCE" | "CERTIFICATION")}
                  className="control-input w-44 text-xs h-9 bg-surface"
                >
                  <option value="SELF_RATED">Self-Rated (0.75x)</option>
                  <option value="PROJECT">Project (0.90x)</option>
                  <option value="EXPERIENCE">Experience (0.95x)</option>
                  <option value="CERTIFICATION">Certified (1.00x)</option>
                </select>

                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="btn-primary text-xs h-9 px-4"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Skill</span>
                </button>
              </div>

              {/* Skills Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left" aria-label="Candidate skills editor table">
                  <thead>
                    <tr className="border-b border-border text-muted font-medium">
                      <th className="py-2.5 pr-4">Skill Name</th>
                      <th className="py-2.5 px-3">Proficiency (1–5)</th>
                      <th className="py-2.5 px-3">Evidence Tier</th>
                      <th className="py-2.5 pl-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {skills.map((skill) => (
                      <tr key={skill.skillName} className="hover:bg-surface-subtle/40 transition">
                        <td className="py-2.5 pr-4 font-semibold text-ink">
                          {skill.skillName}
                        </td>

                        {/* 5-Star / Numeric rating */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((lvl) => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => handleProficiencyChange(skill.skillName, lvl)}
                                className={`p-0.5 rounded hover:scale-110 transition cursor-pointer ${
                                  lvl <= skill.proficiency ? "text-amber-500" : "text-border"
                                }`}
                                aria-label={`Set proficiency ${lvl} for ${skill.skillName}`}
                              >
                                <Star className="w-4 h-4 fill-current stroke-current" />
                              </button>
                            ))}
                            <span className="font-mono text-[11px] text-muted ml-1.5">
                              {skill.proficiency}/5
                            </span>
                          </div>
                        </td>

                        {/* Segmented Control for Evidence */}
                        <td className="py-2.5 px-3">
                          <div className="inline-flex rounded-control border border-border p-0.5 bg-surface-subtle text-[11px]">
                            {(["SELF_RATED", "PROJECT", "EXPERIENCE", "CERTIFICATION"] as const).map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => handleEvidenceChange(skill.skillName, t)}
                                className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${
                                  skill.evidenceType === t
                                    ? "bg-surface text-ink font-semibold shadow-xs"
                                    : "text-muted hover:text-ink"
                                }`}
                              >
                                {t === "SELF_RATED"
                                  ? "Self (0.75x)"
                                  : t === "PROJECT"
                                  ? "Project (0.90x)"
                                  : t === "EXPERIENCE"
                                  ? "Exp (0.95x)"
                                  : "Cert (1.00x)"}
                              </button>
                            ))}
                          </div>
                        </td>

                        <td className="py-2.5 pl-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill.skillName)}
                            className="p-1 rounded text-muted hover:text-status-critical transition cursor-pointer"
                            aria-label={`Remove ${skill.skillName}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Navigation Action */}
              <div className="pt-4 flex justify-end border-t border-border">
                <button
                  type="button"
                  onClick={handleSaveProfileAndContinue}
                  className="btn-primary px-6"
                >
                  <span>Select Target Role</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: TARGET ROLE SELECTION ── */}
        {currentStepIndex === 1 && (
          <div className="space-y-6 animate-step-transition">
            {/* Tabs: Role Library vs Custom JD */}
            <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-ink">
                  Select Benchmark Role
                </h3>
                <p className="text-xs text-muted">
                  Choose an industry standard target or paste an active job description
                </p>
              </div>

              <div className="inline-flex rounded-control border border-border p-0.5 bg-surface-subtle text-xs">
                <button
                  type="button"
                  onClick={() => setActiveRoleTab("library")}
                  className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                    activeRoleTab === "library"
                      ? "bg-surface text-ink font-semibold shadow-xs"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  Industry Library ({roles.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRoleTab("custom")}
                  className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                    activeRoleTab === "custom"
                      ? "bg-surface text-ink font-semibold shadow-xs"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  Paste Custom JD
                </button>
              </div>
            </div>

            {activeRoleTab === "custom" ? (
              /* Custom JD Mode */
              <div className="card p-6 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-ink">
                    Paste Full Job Description (JD)
                  </h4>
                  <p className="text-xs text-muted mt-0.5">
                    Structured AI parser extracts required vs nice-to-have skills, proficiency thresholds, and seniority
                  </p>
                </div>
                <textarea
                  rows={8}
                  value={customJDText}
                  onChange={(e) => setCustomJDText(e.target.value)}
                  placeholder="Paste complete JD text here (e.g., Senior Frontend Engineer with 4+ years of React, TypeScript, and CI/CD)..."
                  className="control-input font-mono text-xs p-3 leading-relaxed"
                />
                <button
                  type="button"
                  disabled={extractingJD || !customJDText.trim()}
                  onClick={handleExtractJD}
                  className="btn-primary text-xs"
                >
                  {extractingJD ? "Extracting Requirements..." : "Extract & Benchmark JD →"}
                </button>
              </div>
            ) : (
              /* Role Library Grid */
              <div className="space-y-4">
                {/* Search & Seniority Filter */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search roles (e.g. Frontend, DevOps, ML)..."
                      value={roleSearch}
                      onChange={(e) => setRoleSearch(e.target.value)}
                      className="control-input pl-9 text-xs h-9"
                    />
                  </div>

                  <div className="inline-flex rounded-control border border-border p-0.5 bg-surface text-xs">
                    {["ALL", "ENTRY", "MID", "SENIOR"].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setSeniorityFilter(lvl)}
                        className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                          seniorityFilter === lvl
                            ? "bg-surface-subtle text-ink font-semibold"
                            : "text-muted hover:text-ink"
                        }`}
                      >
                        {lvl === "ALL" ? "All Levels" : lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {roles
                    .filter((r) => {
                      const matchesSearch =
                        r.title.toLowerCase().includes(roleSearch.toLowerCase()) ||
                        r.description?.toLowerCase().includes(roleSearch.toLowerCase());
                      const matchesSeniority =
                        seniorityFilter === "ALL" || r.seniority === seniorityFilter;
                      return matchesSearch && matchesSeniority;
                    })
                    .map((role) => {
                      const isSelected = selectedRoleId === role.id;
                      const coreSkills = role.roleSkills.filter((rs) => rs.required);

                      return (
                        <div
                          key={role.id}
                          onClick={() => setSelectedRoleId(role.id)}
                          className={`p-4 rounded-card border cursor-pointer transition flex flex-col justify-between ${
                            isSelected
                              ? "bg-primary/[0.04] border-primary ring-2 ring-primary shadow-xs"
                              : "bg-surface border-border hover:border-border/80"
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <h4 className="font-semibold text-sm text-ink">{role.title}</h4>
                              <Chip variant="neutral" className="text-[10px] uppercase font-mono">
                                {role.seniority}
                              </Chip>
                            </div>
                            <p className="text-xs text-muted line-clamp-2 mb-3">
                              {role.description}
                            </p>
                          </div>

                          <div>
                            <div className="text-[11px] text-muted font-medium mb-1">
                              Top Requirements ({coreSkills.length} total):
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {coreSkills.slice(0, 3).map((s, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-surface-subtle border border-border text-ink"
                                >
                                  {s.skill.canonicalName}
                                </span>
                              ))}
                              {coreSkills.length > 3 && (
                                <span className="text-[10px] px-1 py-0.5 text-muted">
                                  +{coreSkills.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Bottom Action Bar */}
            <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-xs text-muted">Selected Benchmark:</span>
                <div className="font-semibold text-sm text-ink">
                  {selectedRole?.title || "None selected"} ({selectedRole?.seniority || ""})
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStepIndex(0)}
                  className="btn-secondary text-xs"
                >
                  ← Back to Profile
                </button>
                <button
                  type="button"
                  disabled={analyzing || !selectedRoleId}
                  onClick={handleRunAnalysis}
                  className="btn-primary text-xs px-6"
                >
                  {analyzing ? "Running Assessment..." : "Analyze Career Readiness →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: RESULTS (HERO OF THE APP: BENTO GRID 12 COLUMNS) ── */}
        {currentStepIndex === 2 && analysisResult && (
          <div className="space-y-6 animate-step-transition">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 no-print">
              <div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
                  Readiness Intelligence
                </span>
                <h2 className="text-xl font-bold text-ink">
                  {analysisResult.roleTitle} Benchmark Assessment
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-secondary text-xs gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-muted" />
                  <span>Export PDF / Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStepIndex(1)}
                  className="btn-secondary text-xs gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-muted" />
                  <span>Change Role</span>
                </button>
              </div>
            </div>

            {/* Bento Grid (Desktop 12 columns with 60ms Staggered Card Entrance) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Card 1: Large Score Card (Gauge + Verdict + Drawer Trigger) */}
              <div
                style={{ animationDelay: "0ms" }}
                className="card p-6 lg:col-span-4 flex flex-col items-center justify-between text-center animate-step-transition"
              >
                <div className="w-full">
                  <div className="flex items-center justify-between text-xs text-muted mb-2">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">
                      Readiness Index
                    </span>
                    <Chip variant="neutral" className="text-[10px] font-mono">
                      {analysisResult.roleSeniority}
                    </Chip>
                  </div>

                  <ScoreGauge
                    score={analysisResult.score}
                    confidence={analysisResult.confidence}
                    size={180}
                    delta={scoreDelta}
                    onWhyThisScore={() => setScoreDrawerOpen(true)}
                  />
                </div>
              </div>

              {/* Card 2: Refined Competency Radar Card */}
              <div
                style={{ animationDelay: "60ms" }}
                className="card p-6 lg:col-span-8 flex flex-col justify-between animate-step-transition"
              >
                <div>
                  <h3 className="text-base font-semibold text-ink">
                    Competency Radar
                  </h3>
                  <p className="text-xs text-muted">
                    Polygon comparison: Your verified level vs. role required threshold
                  </p>
                </div>

                <div className="my-2">
                  <SkillRadar data={radarData} />
                </div>
              </div>

              {/* Card 3: Prioritized Skill Gap Matrix */}
              <div
                style={{ animationDelay: "120ms" }}
                className="card p-6 lg:col-span-12 space-y-4 animate-step-transition"
              >
                <div>
                  <h3 className="text-base font-semibold text-ink">
                    Prioritized Skill Gap Matrix
                  </h3>
                  <p className="text-xs text-muted">
                    Comprehensive competency requirements categorized by criticality
                  </p>
                </div>

                <GapMatrix gaps={analysisResult.gaps} />
              </div>

              {/* Card 4: AI Strategic Guidance & Interview Strategy */}
              <div
                style={{ animationDelay: "180ms" }}
                className="card p-6 lg:col-span-12 space-y-4 animate-step-transition"
              >
                <div>
                  <h3 className="text-base font-semibold text-ink">
                    AI Strategic Guidance
                  </h3>
                  <p className="text-xs text-muted">
                    Actionable resume enhancements and role-tailored interview preparation
                  </p>
                </div>

                <AIInsightsView insights={analysisResult.aiInsights} />
              </div>

              {/* Card 5: 30/60/90-Day Learning Roadmap */}
              <div
                style={{ animationDelay: "240ms" }}
                className="card p-6 lg:col-span-12 space-y-4 animate-step-transition"
              >
                <div>
                  <h3 className="text-base font-semibold text-ink">
                    30/60/90-Day Action Plan
                  </h3>
                  <p className="text-xs text-muted">
                    Check off completed milestones to recalculate your Career Readiness Score in real-time
                  </p>
                </div>

                <RoadmapView
                  items={analysisResult.roadmapItems}
                  onToggleComplete={handleToggleRoadmapItem}
                />
              </div>
            </div>

            {/* Why This Score Drawer */}
            <ScoreDrawer
              isOpen={scoreDrawerOpen}
              onClose={() => setScoreDrawerOpen(false)}
              breakdown={analysisResult.breakdown}
              totalScore={analysisResult.score}
            />
          </div>
        )}
      </main>
    </div>
  );
}
