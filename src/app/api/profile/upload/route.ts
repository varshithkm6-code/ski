import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseResumeFile, validateUpload } from "@/ingestion/resume-parser";
import { encrypt } from "@/lib/crypto";


export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = (formData.get("file") || formData.get("resume")) as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    validateUpload({ size: file.size, type: file.type });

    const buffer = Buffer.from(await file.arrayBuffer());
    const { rawText, parsedData } = await parseResumeFile(buffer, file.type);

    const encryptedText = encrypt(rawText);
    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: { rawTextEnc: encryptedText, parsedData, updatedAt: new Date() },
      create: { userId: session.user.id, rawTextEnc: encryptedText, parsedData },
    });

    const extractedSkills = (parsedData.skills || []).map((s) => ({
      name: s.name,
      proficiency: s.proficiency || 3,
    }));

    return NextResponse.json({
      profile,
      parsedData,
      extractedSkills,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}