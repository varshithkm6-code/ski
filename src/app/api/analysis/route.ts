import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { computeScore } from "@/scoring/engine";
import type { SkillInput, RoleRequirement } from "@/scoring/types";
import { generateRoadmap } from "@/roadmap/generator";
import { getAIProvider } from "@/ai";

const AnalysisSchema = z.object({
  roleId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { roleId } = AnalysisSchema.parse(body);

    // Load profile with skills
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { profileSkills: { include: { skill: true } } },
    });
    if (!profile) return NextResponse.json({ error: "Profile not found. Please complete your profile first." }, { status: 404 });

    // Load role with skill requirements
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: { roleSkills: { include: { skill: true } } },
    });
    if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

    // Build scoring inputs
    const userSkills: SkillInput[] = profile.profileSkills.map((ps) => ({
      skillId: ps.skillId,
      canonicalName: ps.skill.canonicalName,
      userProficiency: ps.proficiency,
      evidenceType: ps.evidenceType as SkillInput["evidenceType"],
      evidenceNotes: ps.evidenceNotes ?? undefined,
    }));

    const requirements: RoleRequirement[] = role.roleSkills.map((rs) => ({
      skillId: rs.skillId,
      canonicalName: rs.skill.canonicalName,
      required: rs.required,
      weight: rs.weight,
      minProficiency: rs.minProficiency,
    }));

    const softReqs = requirements.filter((r) => r.required &&
      ["Communication", "Problem Solving", "Teamwork", "Leadership", "Time Management",
       "Adaptability", "Attention to Detail", "Technical Writing"].includes(r.canonicalName)
    );

    // Run deterministic scoring engine
    const { score, breakdown, gaps, confidence } = computeScore(userSkills, requirements, softReqs);

    // Generate roadmap
    const roadmapInputs = generateRoadmap(gaps);

    // Get AI insights (async, non-blocking for score)
    const profileSummary = [
      `Education: ${JSON.stringify((profile.parsedData as Record<string, unknown>)?.education ?? [])}`,
      `Experience: ${JSON.stringify((profile.parsedData as Record<string, unknown>)?.experience ?? [])}`,
      `Skills count: ${userSkills.length}`,
    ].join(". ");

    const ai = getAIProvider();
    const aiGapsInput = gaps.map((g) => ({
      skillName: g.canonicalName,
      status: g.status,
      required: g.required,
    }));

    let aiInsights = null;
    try {
      aiInsights = await ai.generateInsights(profileSummary, role.title, aiGapsInput);
    } catch (e) {
      console.error("[analysis] AI insights failed:", e instanceof Error ? e.message : "unknown");
    }

    // Persist analysis
    const analysis = await prisma.analysis.create({
      data: {
        userId: session.user.id,
        roleId,
        score,
        breakdown: breakdown as object,
        aiInsights: aiInsights as object,
        confidence,
        gaps: {
          create: gaps.map((g) => ({
            skillId: g.skillId,
            status: g.status,
            userProficiency: g.userProficiency,
            requiredProficiency: g.requiredProficiency,
            evidenceStrength: g.evidenceStrength,
            weight: g.weight,
          })),
        },
        roadmapItems: {
          create: roadmapInputs.map((item) => ({
            skillId: item.skillId,
            phase: item.phase,
            title: item.title,
            whyItMatters: item.whyItMatters,
            resourceTypes: JSON.stringify(item.resourceTypes),
            estimatedHours: item.estimatedHours,
            milestone: item.milestone,
            projectIdea: item.projectIdea,
            sortOrder: item.sortOrder,
          })),
        },
      },
      include: {
        role: true,
        gaps: { include: { skill: true } },
        roadmapItems: { include: { skill: true }, orderBy: { sortOrder: "asc" } },
      },
    });

    // Log progress event
    await prisma.progressEvent.create({
      data: {
        userId: session.user.id,
        analysisId: analysis.id,
        eventType: "ANALYSIS_CREATED",
        payload: { score, roleTitle: role.title },
      },
    });

    return NextResponse.json({ analysis });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues[0]?.message || "Validation error" }, { status: 400 });
    console.error("[analysis POST]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
