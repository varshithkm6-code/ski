// lib/scoring/types.ts
export interface SkillInput {
  skillId: string;
  canonicalName: string;
  userProficiency: number; // 0-5, 0 = missing
  evidenceType: "CERTIFICATION" | "PROJECT" | "EXPERIENCE" | "SELF_RATED" | "NONE";
  evidenceNotes?: string;
}

export interface RoleRequirement {
  skillId: string;
  canonicalName: string;
  required: boolean; // false = nice-to-have
  weight: number; // 0-1 relative importance
  minProficiency: number; // 1-5
}

export interface ScoreBreakdown {
  skillCoverage: number; // 0-1
  proficiencyMatch: number; // 0-1
  evidenceStrength: number; // 0-1
  niceToHaveBonus: number; // 0-1
  softSkillIndicator: number; // 0-1
  total: number; // 0-100
  explanations: {
    skillCoverage: string;
    proficiencyMatch: string;
    evidenceStrength: string;
    niceToHaveBonus: string;
    softSkillIndicator: string;
    overall: string;
  };
}

export type GapStatus = "STRONG" | "PARTIAL_GAP" | "CRITICAL_GAP" | "MISSING";

export interface GapResult {
  skillId: string;
  canonicalName: string;
  status: GapStatus;
  userProficiency: number;
  requiredProficiency: number;
  evidenceStrength: number;
  weight: number;
  required: boolean;
}

export interface ScoringResult {
  score: number; // 0-100 integer
  breakdown: ScoreBreakdown;
  gaps: GapResult[];
  confidence: number; // 0-1
}

export const WEIGHTS = {
  skillCoverage: 0.40,
  proficiencyMatch: 0.30,
  evidenceStrength: 0.20,
  niceToHaveBonus: 0.05,
  softSkillIndicator: 0.05,
} as const;

// Evidence strength mapping
export const EVIDENCE_SCORES: Record<string, number> = {
  CERTIFICATION: 1.0,
  PROJECT: 0.8,
  EXPERIENCE: 0.6,
  SELF_RATED: 0.3,
  NONE: 0.0,
};
