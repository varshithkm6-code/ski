import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAIProvider } from "@/ai";
import { z } from "zod";

const schema = z.object({ jdText: z.string().min(50).max(10000) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { jdText } = schema.parse(body);
    const ai = getAIProvider();
    const extracted = await ai.extractRoleFromJD(jdText);
    return NextResponse.json({ role: extracted });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}