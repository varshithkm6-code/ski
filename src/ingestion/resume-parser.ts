// lib/ingestion/resume-parser.ts
// Handles PDF and DOCX text extraction (server-side only)
import { getAIProvider } from "@/ai";
import type { ParsedResume } from "@/ai/types";

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Dynamic import to avoid browser bundling
  const pdfParseMod = await import("pdf-parse");
  const pdfParse = (pdfParseMod as { default?: (b: Buffer) => Promise<{ text: string }> }).default || (pdfParseMod as unknown as (b: Buffer) => Promise<{ text: string }>);
  const data = await pdfParse(buffer);
  return data.text;
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function parseResumeFile(
  buffer: Buffer,
  mimeType: string
): Promise<{ rawText: string; parsedData: ParsedResume }> {
  let rawText = "";
  if (mimeType === "application/pdf") {
    rawText = await extractTextFromPDF(buffer);
  } else if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    rawText = await extractTextFromDOCX(buffer);
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }

  const ai = getAIProvider();
  const parsedData = await ai.parseResume(rawText);
  return { rawText, parsedData };
}

export function validateUpload(file: { size: number; type: string }): void {
  const MAX_SIZE = 4 * 1024 * 1024; // 4 MB (Vercel serverless function request body limit is 4.5MB)
  const ALLOWED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (file.size > MAX_SIZE) throw new Error("File exceeds 4 MB limit. Maximum allowed size is 4 MB.");
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Invalid file type. Only PDF and DOCX are supported.");
  }
}
