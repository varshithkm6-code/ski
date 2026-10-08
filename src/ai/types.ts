// lib/ai/types.ts
import { z } from "zod";

// ─── Zod Schemas for structured AI outputs ───────────────────────────────────

export const InsightResultSchema = z.object({
  strengths: z.array(z.string()).min(1).max(5),
  priorityGaps: z.array(z.object({
    skillName: z.string(),
    reasoning: z.string(),
    impact: z.enum(["HIGH", "MEDIUM", "LOW"]),
  })).min(1).max(5),
  resumeTips: z.array(z.string()).min(1).max(5),
  interviewTips: z.array(z.string()).min(1).max(5),
  disclaimer: z.string(),
});
export type InsightResult = z.infer<typeof InsightResultSchema>;

export const ExtractedRoleSchema = z.object({
  title: z.string(),
  seniority: z.enum(["ENTRY", "MID", "SENIOR"]),
  requiredSkills: z.array(z.object({
    name: z.string(),
    weight: z.number().min(0).max(1),
    minProficiency: z.number().int().min(1).max(5),
  })),
  niceToHaveSkills: z.array(z.object({
    name: z.string(),
    weight: z.number().min(0).max(1),
  })),
});
export type ExtractedRole = z.infer<typeof ExtractedRoleSchema>;

export const ParsedResumeSchema = z.object({
  name: z.string().optional(),
  education: z.array(z.object({
    degree: z.string(),
    field: z.string(),
    institution: z.string().optional(),
    year: z.number().optional(),
  })),
  experience: z.array(z.object({
    title: z.string(),
    company: z.string().optional(),
    years: z.number().optional(),
    description: z.string().optional(),
  })),
  skills: z.array(z.object({
    name: z.string(),
    proficiency: z.number().int().min(1).max(5).default(3),
    evidenceType: z.enum(["CERTIFICATION", "PROJECT", "EXPERIENCE", "SELF_RATED"]).default("SELF_RATED"),
  })),
  certifications: z.array(z.string()),
  projects: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    skills: z.array(z.string()),
  })),
});
export type ParsedResume = z.infer<typeof ParsedResumeSchema>;

// ─── Provider Interface ───────────────────────────────────────────────────────

export interface AIProvider {
  generateInsights(
    profileSummary: string,
    roleTitle: string,
    gaps: Array<{ skillName: string; status: string; required: boolean }>
  ): Promise<InsightResult>;

  extractRoleFromJD(jdText: string): Promise<ExtractedRole>;

  parseResume(resumeText: string): Promise<ParsedResume>;
}
