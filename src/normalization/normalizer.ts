// lib/normalization/normalizer.ts
// Synonym mapping + Levenshtein distance fallback
import { SKILL_TAXONOMY, lookupCanonical, type SkillEntry } from "./taxonomy";

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

export interface NormalizationResult {
  canonicalName: string;
  confidence: "EXACT" | "ALIAS" | "FUZZY" | "UNKNOWN";
  entry?: SkillEntry;
}

const ALL_NAMES: string[] = SKILL_TAXONOMY.map((s) => s.canonicalName);

export function normalizeSkill(rawSkill: string): NormalizationResult {
  const trimmed = rawSkill.trim();
  if (!trimmed) return { canonicalName: rawSkill, confidence: "UNKNOWN" };

  // 1. Exact + alias lookup
  const exact = lookupCanonical(trimmed);
  if (exact) {
    const entry = SKILL_TAXONOMY.find((s) => s.canonicalName === exact);
    const isAlias = exact.toLowerCase() !== trimmed.toLowerCase();
    return { canonicalName: exact, confidence: isAlias ? "ALIAS" : "EXACT", entry };
  }

  // 2. Levenshtein fuzzy match (threshold: distance <= 2 for strings > 3 chars)
  if (trimmed.length > 3) {
    let best = { name: "", dist: Infinity };
    for (const name of ALL_NAMES) {
      const dist = levenshtein(trimmed.toLowerCase(), name.toLowerCase());
      if (dist < best.dist) best = { name, dist };
    }
    if (best.dist <= 2) {
      const entry = SKILL_TAXONOMY.find((s) => s.canonicalName === best.name);
      return { canonicalName: best.name, confidence: "FUZZY", entry };
    }
  }

  // 3. Unknown — keep as-is, categorize as TECHNICAL by default
  return { canonicalName: trimmed, confidence: "UNKNOWN" };
}

export function normalizeSkills(rawSkills: string[]): NormalizationResult[] {
  return rawSkills.map(normalizeSkill);
}
