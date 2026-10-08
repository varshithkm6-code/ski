// lib/ai/mock-provider.ts
// Used in tests and when GEMINI_API_KEY is not set.
// Returns deterministic, schema-valid responses.
import type { AIProvider, InsightResult, ExtractedRole, ParsedResume } from "./types";

export class MockProvider implements AIProvider {
  async generateInsights(
    _profileSummary: string,
    roleTitle: string,
    gaps: Array<{ skillName: string; status: string; required: boolean }>
  ): Promise<InsightResult> {
    const criticalGaps = gaps.filter((g) => g.status === "CRITICAL_GAP" || g.status === "MISSING");
    return {
      strengths: [
        "Strong foundational technical skills demonstrated through projects",
        "Good evidence of practical experience",
        "Relevant educational background",
        "Self-motivated learner with multiple skill areas",
        "Portfolio shows hands-on work",
      ],
      priorityGaps: (
        criticalGaps.length > 0
          ? criticalGaps.slice(0, 5).map((g) => ({
              skillName: g.skillName,
              reasoning: `${g.skillName} is a core requirement for ${roleTitle}. Addressing this gap will significantly improve your readiness score.`,
              impact: "HIGH" as const,
            }))
          : [
              {
                skillName: "Advanced Domain Knowledge",
                reasoning: `Deepening domain expertise will help you stand out for ${roleTitle} roles.`,
                impact: "MEDIUM" as const,
              },
            ]
      ).slice(0, 5),
      resumeTips: [
        "Quantify achievements with specific metrics (e.g., 'reduced load time by 40%')",
        "Add links to GitHub repositories and live projects",
        "Use role-specific keywords from job descriptions",
        "Highlight certifications prominently in a dedicated section",
        "Tailor your summary to match the target role requirements",
      ],
      interviewTips: [
        "Prepare STAR-format answers for behavioral questions",
        "Be ready to discuss your projects in technical depth",
        "Research the company's tech stack and recent initiatives",
        "Practice explaining complex concepts simply",
        "Prepare questions about team structure and growth opportunities",
      ],
      disclaimer:
        "⚠️ AI-generated guidance. These suggestions are for informational purposes only. Scores are computed by a deterministic engine, not AI.",
    };
  }

  async extractRoleFromJD(jdText: string): Promise<ExtractedRole> {
    // Simple heuristic extraction for mock
    const isEntry = jdText.toLowerCase().includes("junior") || jdText.toLowerCase().includes("entry");
    const isSenior = jdText.toLowerCase().includes("senior") || jdText.toLowerCase().includes("lead");
    return {
      title: "Software Engineer",
      seniority: isSenior ? "SENIOR" : isEntry ? "ENTRY" : "MID",
      requiredSkills: [
        { name: "JavaScript", weight: 0.9, minProficiency: 3 },
        { name: "TypeScript", weight: 0.8, minProficiency: 3 },
        { name: "React", weight: 0.8, minProficiency: 3 },
        { name: "Node.js", weight: 0.7, minProficiency: 3 },
        { name: "Git", weight: 0.6, minProficiency: 3 },
      ],
      niceToHaveSkills: [
        { name: "Docker", weight: 0.4 },
        { name: "AWS", weight: 0.3 },
      ],
    };
  }

  async parseResume(resumeText: string): Promise<ParsedResume> {
    // Minimal mock: extract skill-like words
    const words = resumeText.split(/\s+/);
    const techWords = ["Python", "JavaScript", "TypeScript", "React", "Node.js", "SQL", "Git", "Docker", "AWS"];
    const foundSkills = techWords
      .filter((t) => words.some((w) => w.toLowerCase().includes(t.toLowerCase())))
      .map((name) => ({ name, proficiency: 3 as const, evidenceType: "SELF_RATED" as const }));

    return {
      education: [{ degree: "Bachelor's", field: "Computer Science" }],
      experience: [],
      skills: foundSkills.length > 0 ? foundSkills : [{ name: "JavaScript", proficiency: 3, evidenceType: "SELF_RATED" }],
      certifications: [],
      projects: [],
    };
  }
}
