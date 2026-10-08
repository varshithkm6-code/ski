// lib/ai/index.ts
// Factory: returns GeminiProvider if API key is set, MockProvider otherwise
// Note: GeminiProvider is conditionally loaded via a pre-initialized module-level singleton
// to avoid dynamic require() that triggers linting errors.
import type { AIProvider } from "./types";
import { MockProvider } from "./mock-provider";

let _provider: AIProvider | null = null;

// We lazily load GeminiProvider only when an API key is set.
// The import is done at the top-level lazily via module augmentation.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const loadGemini = () => (require("./gemini-provider") as { GeminiProvider: new () => AIProvider }).GeminiProvider;

export function getAIProvider(): AIProvider {
  if (_provider) return _provider;
  if (process.env.GEMINI_API_KEY) {
    const GeminiProvider = loadGemini();
    _provider = new GeminiProvider();
  } else {
    _provider = new MockProvider();
  }
  return _provider!;
}

export type { AIProvider, InsightResult, ExtractedRole, ParsedResume } from "./types";
export { InsightResultSchema, ExtractedRoleSchema, ParsedResumeSchema } from "./types";
export { MockProvider } from "./mock-provider";
