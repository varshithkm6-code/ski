// lib/scoring/engine.ts
// Pure deterministic scoring engine — NO LLM calls here.
// All components are normalized to [0,1] before weighting.
// Weights sum to 1.0, so max score = 100.

import type {
  SkillInput,
  RoleRequirement,
  ScoringResult,
  ScoreBreakdown,
  GapResult,
  GapStatus,
} from "./types";
import { WEIGHTS, EVIDENCE_SCORES } from "./types";

// ─── Component: Skill Coverage ────────────────────────────────────────────────
// Weighted share of must-have skills where user proficiency >= minProficiency
function computeSkillCoverage(
  skills: SkillInput[],
  requirements: RoleRequirement[]
): number {
  const mustHave = requirements.filter((r) => r.required);
  if (mustHave.length === 0) return 1.0;

  const skillMap = new Map(skills.map((s) => [s.skillId, s]));
  const totalWeight = mustHave.reduce((sum, r) => sum + r.weight, 0);
  if (totalWeight === 0) return 0;

  let coveredWeight = 0;
  for (const req of mustHave) {
    const s = skillMap.get(req.skillId);
    if (s && s.userProficiency >= req.minProficiency) {
      coveredWeight += req.weight;
    }
  }
  return coveredWeight / totalWeight;
}

// ─── Component: Proficiency Match ─────────────────────────────────────────────
// sum(weight_i * min(user_i, req_i)/req_i) / sum(weight_i)
// Only over required skills where user has at least some proficiency
function computeProficiencyMatch(
  skills: SkillInput[],
  requirements: RoleRequirement[]
): number {
  const mustHave = requirements.filter((r) => r.required);
  if (mustHave.length === 0) return 1.0;

  const skillMap = new Map(skills.map((s) => [s.skillId, s]));
  const totalWeight = mustHave.reduce((sum, r) => sum + r.weight, 0);
  if (totalWeight === 0) return 0;

  let weightedMatch = 0;
  for (const req of mustHave) {
    const s = skillMap.get(req.skillId);
    const userProf = s ? s.userProficiency : 0;
    const ratio = Math.min(userProf, req.minProficiency) / req.minProficiency;
    weightedMatch += req.weight * ratio;
  }
  return weightedMatch / totalWeight;
}

// ─── Component: Evidence Strength ─────────────────────────────────────────────
// Average evidence score across required skills
function computeEvidenceStrength(
  skills: SkillInput[],
  requirements: RoleRequirement[]
): number {
  const mustHave = requirements.filter((r) => r.required);
  if (mustHave.length === 0) return 1.0;

  const skillMap = new Map(skills.map((s) => [s.skillId, s]));
  const totalWeight = mustHave.reduce((sum, r) => sum + r.weight, 0);
  if (totalWeight === 0) return 0;

  let weightedEvidence = 0;
  for (const req of mustHave) {
    const s = skillMap.get(req.skillId);
    const evScore = s ? (EVIDENCE_SCORES[s.evidenceType] ?? 0) : 0;
    weightedEvidence += req.weight * evScore;
  }
  return weightedEvidence / totalWeight;
}

// ─── Component: Nice-to-Have Bonus ────────────────────────────────────────────
// present nice-to-haves / total nice-to-haves
function computeNiceToHaveBonus(
  skills: SkillInput[],
  requirements: RoleRequirement[]
): number {
  const niceToHave = requirements.filter((r) => !r.required);
  if (niceToHave.length === 0) return 0;

  const skillMap = new Map(skills.map((s) => [s.skillId, s]));
  let present = 0;
  for (const req of niceToHave) {
    const s = skillMap.get(req.skillId);
    if (s && s.userProficiency > 0) present++;
  }
  return present / niceToHave.length;
}

function computeSoftSkillIndicator(
  skills: SkillInput[],
  requirements: RoleRequirement[]
): number {
  const softReqs = requirements.filter((r) => r.required);
  // If no soft-skill requirements or signal, return 0
  if (softReqs.length === 0) return 0;

  const skillMap = new Map(skills.map((s) => [s.skillId, s]));
  let total = 0;
  let present = 0;
  for (const req of softReqs) {
    total++;
    const s = skillMap.get(req.skillId);
    if (s && s.userProficiency >= req.minProficiency) present++;
  }
  return total === 0 ? 0 : present / total;
}

// ─── Gap Classifier ───────────────────────────────────────────────────────────
function classifyGap(
  userProficiency: number,
  minProficiency: number,
  required: boolean
): GapStatus {
  if (userProficiency === 0) return "MISSING";
  if (userProficiency >= minProficiency) return "STRONG";
  // Partial: has skill but below threshold
  const ratio = userProficiency / minProficiency;
  if (ratio >= 0.6 || !required) return "PARTIAL_GAP";
  return "CRITICAL_GAP";
}

// ─── Confidence Indicator ─────────────────────────────────────────────────────
function computeConfidence(skills: SkillInput[]): number {
  if (skills.length === 0) return 0.2;
  const selfRatedCount = skills.filter((s) => s.evidenceType === "SELF_RATED").length;
  const ratio = selfRatedCount / skills.length;
  // Heavy self-rating → lower confidence
  return Math.max(0.3, 1.0 - ratio * 0.5);
}

// ─── Main Scoring Function ────────────────────────────────────────────────────
export function computeScore(
  userSkills: SkillInput[],
  requirements: RoleRequirement[],
  softSkillRequirements?: RoleRequirement[]
): ScoringResult {
  const softReqs = softSkillRequirements ?? [];

  const skillCoverage = computeSkillCoverage(userSkills, requirements);
  const proficiencyMatch = computeProficiencyMatch(userSkills, requirements);
  const evidenceStrength = computeEvidenceStrength(userSkills, requirements);
  const niceToHaveBonus = computeNiceToHaveBonus(userSkills, requirements);
  const softSkillIndicator = computeSoftSkillIndicator(userSkills, softReqs);

  const total =
    WEIGHTS.skillCoverage * skillCoverage * 100 +
    WEIGHTS.proficiencyMatch * proficiencyMatch * 100 +
    WEIGHTS.evidenceStrength * evidenceStrength * 100 +
    WEIGHTS.niceToHaveBonus * niceToHaveBonus * 100 +
    WEIGHTS.softSkillIndicator * softSkillIndicator * 100;

  const score = Math.round(Math.max(0, Math.min(100, total)));

  // Build gap results
  const skillMap = new Map(userSkills.map((s) => [s.skillId, s]));
  const gaps: GapResult[] = requirements.map((req) => {
    const s = skillMap.get(req.skillId);
    const userProf = s ? s.userProficiency : 0;
    const evScore = s ? (EVIDENCE_SCORES[s.evidenceType] ?? 0) : 0;
    return {
      skillId: req.skillId,
      canonicalName: req.canonicalName,
      status: classifyGap(userProf, req.minProficiency, req.required),
      userProficiency: userProf,
      requiredProficiency: req.minProficiency,
      evidenceStrength: evScore,
      weight: req.weight,
      required: req.required,
    };
  });

  const mustHaveCount = requirements.filter((r) => r.required).length;
  const coveredMustHave = gaps.filter(
    (g) => g.required && (g.status === "STRONG" || g.status === "PARTIAL_GAP")
  ).length;

  const breakdown: ScoreBreakdown = {
    skillCoverage,
    proficiencyMatch,
    evidenceStrength,
    niceToHaveBonus,
    softSkillIndicator,
    total,
    explanations: {
      skillCoverage: `You meet the proficiency threshold for ${coveredMustHave} of ${mustHaveCount} must-have skills (weighted coverage: ${Math.round(skillCoverage * 100)}%).`,
      proficiencyMatch: `Your average proficiency is ${Math.round(proficiencyMatch * 100)}% of what's required across weighted must-have skills.`,
      evidenceStrength: `${Math.round(evidenceStrength * 100)}% evidence quality — backed by certifications, projects, and experience (certifications score highest).`,
      niceToHaveBonus: `You have ${Math.round(niceToHaveBonus * 100)}% of nice-to-have skills, giving a small bonus.`,
      softSkillIndicator: `Soft skill coverage: ${Math.round(softSkillIndicator * 100)}%.`,
      overall: score >= 80
        ? "Strong match! Focus on the remaining gaps to reach full readiness."
        : score >= 60
        ? "Good foundation. Targeted upskilling on critical gaps will significantly improve your score."
        : score >= 40
        ? "Meaningful gaps exist. Follow the roadmap to build required skills systematically."
        : "Significant gaps identified. The roadmap prioritizes the highest-impact skills first.",
    },
  };

  const confidence = computeConfidence(userSkills);

  return { score, breakdown, gaps, confidence };
}

export { computeSkillCoverage, computeProficiencyMatch, computeEvidenceStrength, computeNiceToHaveBonus, classifyGap };
