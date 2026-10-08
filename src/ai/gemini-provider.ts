// lib/ai/gemini-provider.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProvider, InsightResult, ExtractedRole, ParsedResume } from "./types";
import { InsightResultSchema, ExtractedRoleSchema, ParsedResumeSchema } from "./types";
import type { ZodSchema } from "zod";

const MAX_RETRIES = 3;
const TIMEOUT_MS = 30000;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`AI call timed out after ${ms}ms`)), ms)
    ),
  ]);
}

async function parseWithRetry<T>(
  schema: ZodSchema<T>,
  generateFn: () => Promise<string>,
  retries = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const raw = await withTimeout(generateFn(), TIMEOUT_MS);
      // Strip markdown code fences if present
      const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return schema.parse(parsed);
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      console.error(`[AI] Attempt ${attempt + 1} failed:`, lastError.message);
    }
  }
  throw new Error(`AI output validation failed after ${retries} attempts: ${lastError?.message}`);
}

const GUARDRAILS = `
IMPORTANT GUARDRAILS:
- Do NOT reference the candidate's name, age, gender, ethnicity, nationality, or any protected characteristic.
- Do NOT comment on educational institution prestige or location.
- Do NOT fabricate skills the candidate did not mention.
- Focus only on skills, experience, and role requirements.
- Return ONLY valid JSON matching the schema. No markdown, no prose outside the JSON.
`;

export class GeminiProvider implements AIProvider {
  private model;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    const modelName = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: "application/json" },
    });
  }

  async generateInsights(
    profileSummary: string,
    roleTitle: string,
    gaps: Array<{ skillName: string; status: string; required: boolean }>
  ): Promise<InsightResult> {
    const gapSummary = gaps
      .map((g) => `- ${g.skillName} (${g.status}, required: ${g.required})`)
      .join("\n");

    const prompt = `You are a career advisor. Analyze the candidate's skill gaps for the role: ${roleTitle}.

Profile Summary: ${profileSummary}

Skill Gap Analysis:
${gapSummary}

${GUARDRAILS}

Return a JSON object with this exact schema:
{
  "strengths": ["string (max 5 items)"],
  "priorityGaps": [{"skillName": "string", "reasoning": "string", "impact": "HIGH"|"MEDIUM"|"LOW"} (max 5 items)],
  "resumeTips": ["string (max 5 items)"],
  "interviewTips": ["string (max 5 items)"],
  "disclaimer": "⚠️ AI-generated guidance. These suggestions are for informational purposes only. Scores are computed by a deterministic engine, not AI."
}`;

    return parseWithRetry(InsightResultSchema, async () => {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    });
  }

  async extractRoleFromJD(jdText: string): Promise<ExtractedRole> {
    const prompt = `Extract structured role requirements from this job description.

${GUARDRAILS}

Job Description:
${jdText.slice(0, 4000)}

Return JSON matching exactly:
{
  "title": "string",
  "seniority": "ENTRY"|"MID"|"SENIOR",
  "requiredSkills": [{"name": "string", "weight": 0.0-1.0, "minProficiency": 1-5}],
  "niceToHaveSkills": [{"name": "string", "weight": 0.0-1.0}]
}`;

    return parseWithRetry(ExtractedRoleSchema, async () => {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    });
  }

  async parseResume(resumeText: string): Promise<ParsedResume> {
    const prompt = `Extract structured information from this resume text.

${GUARDRAILS}

Resume:
${resumeText.slice(0, 5000)}

Return JSON matching exactly:
{
  "education": [{"degree": "string", "field": "string", "institution": "string (omit if unknown)", "year": number (omit if unknown)}],
  "experience": [{"title": "string", "company": "string (omit if unknown)", "years": number (omit if unknown), "description": "string"}],
  "skills": [{"name": "string", "proficiency": 1-5, "evidenceType": "CERTIFICATION"|"PROJECT"|"EXPERIENCE"|"SELF_RATED"}],
  "certifications": ["string"],
  "projects": [{"name": "string", "description": "string", "skills": ["string"]}]
}`;

    return parseWithRetry(ParsedResumeSchema, async () => {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    });
  }
}
