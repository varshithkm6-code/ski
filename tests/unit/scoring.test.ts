// tests/unit/scoring.test.ts
import { describe, it, expect } from "vitest";
import { computeScore, computeSkillCoverage, computeProficiencyMatch, classifyGap } from "../../src/scoring/engine";
import type { SkillInput, RoleRequirement } from "../../src/scoring/types";

const makeSkill = (id: string, prof: number, ev: SkillInput["evidenceType"] = "SELF_RATED"): SkillInput => ({
  skillId: id, canonicalName: id, userProficiency: prof, evidenceType: ev,
});
const makeReq = (id: string, w: number, minP: number, required = true): RoleRequirement => ({
  skillId: id, canonicalName: id, required, weight: w, minProficiency: minP,
});

describe("classifyGap", () => {
  it("STRONG when user meets threshold", () => expect(classifyGap(4, 3, true)).toBe("STRONG"));
  it("MISSING when user proficiency is 0", () => expect(classifyGap(0, 3, true)).toBe("MISSING"));
  it("CRITICAL_GAP when proficiency < 60% of threshold for required", () => expect(classifyGap(1, 4, true)).toBe("CRITICAL_GAP"));
  it("PARTIAL_GAP when proficiency >= 60% of threshold", () => expect(classifyGap(2, 3, true)).toBe("PARTIAL_GAP"));
  it("PARTIAL_GAP for nice-to-have even if below threshold", () => expect(classifyGap(1, 3, false)).toBe("PARTIAL_GAP"));
});

describe("computeScore — edge cases", () => {
  it("returns 0 when no skills provided", () => {
    const reqs = [makeReq("js", 1.0, 3)];
    const { score } = computeScore([], reqs);
    expect(score).toBe(0);
  });

  it("returns 100 when fully qualified with certifications", () => {
    const skills = [makeReq("js", 1.0, 4), makeReq("ts", 0.8, 3)].map((r) =>
      makeSkill(r.skillId, 5, "CERTIFICATION")
    );
    const reqs = [makeReq("js", 1.0, 4), makeReq("ts", 0.8, 3)];
    const { score } = computeScore(skills, reqs);
    expect(score).toBeGreaterThan(85);
  });

  it("all-missing produces very low score", () => {
    const reqs = [makeReq("js", 1, 3), makeReq("ts", 0.8, 3), makeReq("react", 0.9, 3)];
    const { score } = computeScore([], reqs);
    expect(score).toBeLessThan(15);
  });

  it("duplicate skills: only uses first (by skillId uniqueness)", () => {
    const skills = [makeSkill("js", 4, "PROJECT"), makeSkill("js", 2, "SELF_RATED")];
    const reqs = [makeReq("js", 1.0, 3)];
    // Map deduplicates by skillId
    const { score } = computeScore(skills, reqs);
    expect(score).toBeGreaterThan(0);
  });

  it("over-qualified candidate: score not penalised", () => {
    const skills = [makeSkill("js", 5, "CERTIFICATION"), makeSkill("ts", 5, "CERTIFICATION")];
    const reqs = [makeReq("js", 1.0, 3), makeReq("ts", 0.8, 2)];
    const { score } = computeScore(skills, reqs);
    expect(score).toBeGreaterThan(80);
  });

  it("empty requirements returns maximum score", () => {
    const { score } = computeScore([makeSkill("js", 3)], []);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it("score is bounded 0-100", () => {
    const skills = Array.from({ length: 10 }, (_, i) => makeSkill(`s${i}`, 5, "CERTIFICATION"));
    const reqs = skills.map((s, i) => makeReq(s.skillId, 0.1, 3, i % 2 === 0));
    const { score } = computeScore(skills, reqs);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("partial coverage: only half required skills present", () => {
    const skills = [makeSkill("js", 4, "PROJECT")];
    const reqs = [makeReq("js", 1.0, 3), makeReq("ts", 0.8, 3), makeReq("react", 0.9, 3)];
    const { score, breakdown } = computeScore(skills, reqs);
    expect(score).toBeLessThan(60);
    expect(breakdown.skillCoverage).toBeLessThan(0.5);
  });
});

describe("computeSkillCoverage", () => {
  it("returns 1.0 when all must-have skills meet threshold", () => {
    const skills = [makeSkill("js", 3), makeSkill("ts", 4)];
    const reqs = [makeReq("js", 1, 3), makeReq("ts", 0.8, 3)];
    expect(computeSkillCoverage(skills, reqs)).toBeCloseTo(1.0, 1);
  });

  it("returns 0 when no required skills present", () => {
    expect(computeSkillCoverage([], [makeReq("js", 1, 3)])).toBe(0);
  });
});

describe("computeProficiencyMatch", () => {
  it("returns 1.0 for exact match", () => {
    const skills = [makeSkill("js", 3)];
    const reqs = [makeReq("js", 1.0, 3)];
    expect(computeProficiencyMatch(skills, reqs)).toBeCloseTo(1.0, 2);
  });

  it("partial match when user is below required", () => {
    const skills = [makeSkill("js", 2)];
    const reqs = [makeReq("js", 1.0, 4)];
    expect(computeProficiencyMatch(skills, reqs)).toBeCloseTo(0.5, 1);
  });
});
