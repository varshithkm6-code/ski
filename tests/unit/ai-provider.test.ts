// tests/unit/ai-provider.test.ts
import { describe, it, expect } from "vitest";
import { MockProvider } from "../../src/ai/mock-provider";
import { InsightResultSchema, ExtractedRoleSchema, ParsedResumeSchema } from "../../src/ai/types";

const mock = new MockProvider();

describe("MockProvider — generateInsights", () => {
  it("returns schema-valid InsightResult", async () => {
    const result = await mock.generateInsights("CS grad with React skills", "Frontend Developer", [
      { skillName: "TypeScript", status: "MISSING", required: true },
      { skillName: "Next.js", status: "CRITICAL_GAP", required: true },
    ]);
    const parsed = InsightResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("returns at least 1 strength", async () => {
    const result = await mock.generateInsights("", "Backend Developer", []);
    expect(result.strengths.length).toBeGreaterThanOrEqual(1);
  });

  it("returns at most 5 priority gaps", async () => {
    const result = await mock.generateInsights("", "ML Engineer", [
      { skillName: "Python", status: "MISSING", required: true },
      { skillName: "TensorFlow", status: "MISSING", required: true },
      { skillName: "PyTorch", status: "MISSING", required: true },
      { skillName: "SQL", status: "CRITICAL_GAP", required: true },
      { skillName: "Docker", status: "MISSING", required: true },
      { skillName: "AWS", status: "MISSING", required: false },
    ]);
    expect(result.priorityGaps.length).toBeLessThanOrEqual(5);
  });

  it("disclaimer field is present", async () => {
    const result = await mock.generateInsights("", "DevOps Engineer", []);
    expect(result.disclaimer).toBeTruthy();
    expect(result.disclaimer).toContain("AI-generated");
  });
});

describe("MockProvider — extractRoleFromJD", () => {
  it("returns schema-valid ExtractedRole", async () => {
    const result = await mock.extractRoleFromJD("We are looking for a Senior Backend Engineer with Python and AWS experience.");
    const parsed = ExtractedRoleSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("detects senior seniority from JD text", async () => {
    const result = await mock.extractRoleFromJD("Senior Software Engineer with 5+ years experience");
    expect(result.seniority).toBe("SENIOR");
  });

  it("detects entry level from JD text", async () => {
    const result = await mock.extractRoleFromJD("Junior Developer entry level position");
    expect(result.seniority).toBe("ENTRY");
  });
});

describe("MockProvider — parseResume", () => {
  it("returns schema-valid ParsedResume", async () => {
    const result = await mock.parseResume("John Smith — Python developer with React and SQL experience");
    const parsed = ParsedResumeSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("detects Python from resume text", async () => {
    const result = await mock.parseResume("Experienced Python developer using TensorFlow and Pandas");
    const skillNames = result.skills.map((s) => s.name);
    expect(skillNames).toContain("Python");
  });
});

describe("Zod schema validation", () => {
  it("rejects invalid InsightResult — missing required fields", () => {
    const result = InsightResultSchema.safeParse({ strengths: "not an array" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid impact value", () => {
    const result = InsightResultSchema.safeParse({
      strengths: ["s"],
      priorityGaps: [{ skillName: "JS", reasoning: "r", impact: "EXTREME" }],
      resumeTips: ["t"],
      interviewTips: ["t"],
      disclaimer: "d",
    });
    expect(result.success).toBe(false);
  });
});
