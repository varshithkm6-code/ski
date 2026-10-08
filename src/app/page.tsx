import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Chip } from "@/components/ui/Chip";
import { ScoreGauge } from "@/components/dashboard/ScoreGauge";
import { SkillRadar } from "@/components/dashboard/SkillRadar";
import {
  ShieldCheck,
  Scale,
  Award,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  const sampleRadar = [
    { skill: "React", user: 4, required: 3 },
    { skill: "TypeScript", user: 3, required: 3 },
    { skill: "Next.js", user: 3, required: 2 },
    { skill: "System Design", user: 2, required: 3 },
    { skill: "Testing", user: 3, required: 3 },
    { skill: "CSS", user: 4, required: 3 },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-canvas text-ink relative overflow-hidden">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-control bg-primary text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm">
              SB
            </div>
            <span className="font-semibold text-base text-ink tracking-tight">
              SkillBridge
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-xs px-3.5 py-1.5 h-9">
              Sign in
            </Link>
            <Link href="/register" className="btn-primary text-xs px-3.5 py-1.5 h-9">
              Analyze my readiness
            </Link>
          </div>
        </div>
      </header>

      {/* Split Hero Section with Drifting Soft Gradient Blobs */}
      <section className="relative max-w-[1200px] mx-auto px-4 sm:px-6 pt-12 pb-16 md:pt-16 md:pb-24 w-full">
        {/* Soft Indigo-to-Violet Ambient Blobs */}
        <div
          className="absolute -top-16 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent blur-3xl pointer-events-none -z-10"
          aria-hidden="true"
        />
        <div
          className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-gradient-to-bl from-secondary/10 via-primary/10 to-transparent blur-3xl pointer-events-none -z-10"
          aria-hidden="true"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headline, Value Prop, CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border shadow-xs">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-ink">
                Clinical-grade career readiness intelligence
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink leading-[1.15]">
              Know exactly where you stand for your dream role.
            </h1>

            <p className="text-sm sm:text-base text-muted max-w-xl leading-relaxed">
              Objective, deterministic readiness scoring based on real job benchmarks. Benchmark your competencies, prioritize critical skill gaps, and execute a 30/60/90-day learning roadmap with live score recalculation.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/register" className="btn-primary text-sm px-5 py-2.5 gap-2 h-11 font-semibold">
                <span>Analyze my readiness</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/dashboard" className="btn-secondary text-sm px-5 py-2.5 h-11">
                See a sample report
              </Link>
            </div>

            {/* Trust metrics */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-muted">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-status-strong" />
                <span>Deterministic 0–100 scoring</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Evidence-weighted verification</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-muted" />
                <span>Zero demographic bias</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Sample Score Card */}
          <div className="lg:col-span-5">
            <div className="card p-6 bg-surface shadow-md space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <span className="text-[11px] font-mono uppercase text-muted font-bold block">
                    Sample Assessment Report
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    Frontend Developer Benchmark
                  </span>
                </div>
                <Chip variant="strong">Job Ready</Chip>
              </div>

              {/* Gauge */}
              <div className="py-2">
                <ScoreGauge
                  score={82}
                  confidence={0.92}
                  size={160}
                />
              </div>

              {/* Sample skill chips */}
              <div className="space-y-1.5 pt-2 border-t border-border/60">
                <span className="text-[11px] text-muted font-medium block">
                  Top Competencies Evaluated:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <Chip variant="strong">React (Lvl 4/5)</Chip>
                  <Chip variant="strong">TypeScript (Lvl 3/5)</Chip>
                  <Chip variant="partial">System Design (Lvl 2/3)</Chip>
                  <Chip variant="strong">CSS / UI (Lvl 4/5)</Chip>
                </div>
              </div>

              {/* Mini Radar */}
              <div className="pt-2 border-t border-border/60">
                <div className="text-[11px] font-semibold text-ink mb-1">
                  Radar Alignment:
                </div>
                <div className="h-44">
                  <SkillRadar data={sampleRadar} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three-step "How it works" */}
      <section className="bg-surface border-y border-border py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
              Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink">
              How SkillBridge Works
            </h2>
            <p className="text-xs sm:text-sm text-muted">
              Three transparent steps from resume intake to interview mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-card border border-border bg-canvas/60 space-y-3">
              <div className="w-10 h-10 rounded-control bg-primary-subtle text-primary flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-semibold text-ink">
                Intake Profile & Proof
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Upload your resume or enter your competencies manually. Each skill is paired with verified evidence tiers (certifications, work experience, or portfolio projects).
              </p>
            </div>

            <div className="p-6 rounded-card border border-border bg-canvas/60 space-y-3">
              <div className="w-10 h-10 rounded-control bg-primary-subtle text-primary flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-semibold text-ink">
                Deterministic Gap Scoring
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Our mathematical engine measures Core Skill Coverage (40%), Proficiency Depth (30%), Evidence Reliability (20%), Nice-to-Have Bonus (5%), and Soft Skills (5%).
              </p>
            </div>

            <div className="p-6 rounded-card border border-border bg-canvas/60 space-y-3">
              <div className="w-10 h-10 rounded-control bg-primary-subtle text-primary flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-semibold text-ink">
                Action Plan & Live Recalculation
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Execute your prioritized 30/60/90-day action plan. As you check off milestones, your Career Readiness Score recalibrates live in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* "Why the score is trustworthy" Strip */}
      <section className="py-16 bg-canvas">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="p-8 rounded-card border border-border bg-surface shadow-xs space-y-6">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider block mb-1">
                Auditability & Safety
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-ink">
                Why the SkillBridge Score is Trustworthy
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
                Unlike opaque generative AI scoring, SkillBridge implements rigorous fairness criteria designed for educational and career advancement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="flex items-start gap-3">
                <Scale className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-ink">Auditable Math</h4>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Zero hallucinations in scoring. Every point is directly traceable to role requirements and verified evidence.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-ink">Evidence-Weighted</h4>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Certifications, experience, and project proof score higher than unbacked self-ratings.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-muted shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-ink">No Protected Attributes</h4>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Name, age, gender, demographics, and institution prestige are excluded by design to prevent algorithmic bias.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="mt-auto border-t border-border bg-surface py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink">SkillBridge</span>
            <span>·</span>
            <span>Clinical-Grade Career Intelligence</span>
          </div>

          <p className="text-center sm:text-right">
            AI-generated guidance only · Not a guarantee of employment
          </p>
        </div>
      </footer>
    </main>
  );
}
