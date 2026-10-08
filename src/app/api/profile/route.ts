import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { normalizeSkill } from "@/normalization/normalizer";

const ProfileSkillSchema = z.object({
  skillName: z.string(),
  proficiency: z.number().int().min(1).max(5),
  evidenceType: z.enum(["CERTIFICATION", "PROJECT", "EXPERIENCE", "SELF_RATED"]).default("SELF_RATED"),
  evidenceNotes: z.string().optional(),
});

const UpdateProfileSchema = z.object({
  parsedData: z.object({
    education: z.array(z.any()).default([]),
    experience: z.array(z.any()).default([]),
    certifications: z.array(z.string()).default([]),
    projects: z.array(z.any()).default([]),
  }),
  skills: z.array(ProfileSkillSchema),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: { profileSkills: { include: { skill: true } } },
  });
  return NextResponse.json({ profile });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { parsedData, skills } = UpdateProfileSchema.parse(body);

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: { parsedData, updatedAt: new Date() },
      create: { userId: session.user.id, parsedData },
    });

    // Rebuild profile skills
    await prisma.profileSkill.deleteMany({ where: { profileId: profile.id } });

    for (const s of skills) {
      const norm = normalizeSkill(s.skillName);
      let skill = await prisma.skill.findUnique({ where: { canonicalName: norm.canonicalName } });
      if (!skill) {
        skill = await prisma.skill.create({
          data: { canonicalName: norm.canonicalName, category: "TECHNICAL", aliases: JSON.stringify([]) },
        });
      }
      await prisma.profileSkill.upsert({
        where: { profileId_skillId: { profileId: profile.id, skillId: skill.id } },
        update: { proficiency: s.proficiency, evidenceType: s.evidenceType, evidenceNotes: s.evidenceNotes },
        create: { profileId: profile.id, skillId: skill.id, proficiency: s.proficiency, evidenceType: s.evidenceType, evidenceNotes: s.evidenceNotes },
      });
    }

    const updated = await prisma.profile.findUnique({
      where: { id: profile.id },
      include: { profileSkills: { include: { skill: true } } },
    });
    return NextResponse.json({ profile: updated });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues[0]?.message || "Validation error" }, { status: 400 });
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}