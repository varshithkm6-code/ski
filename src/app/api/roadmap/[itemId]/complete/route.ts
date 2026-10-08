import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { computeScore } from "@/scoring/engine";
import type { SkillInput, RoleRequirement } from "@/scoring/types";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId } = await params;

  // Verify ownership
  const item = await prisma.roadmapItem.findUnique({
    where: { id: itemId },
    include: { analysis: true },
  });
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
  if (item.analysis.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const newCompleted = !item.completed;

  // Toggle completion
  const updated = await prisma.roadmapItem.update({
    where: { id: itemId },
    data: {
      completed: newCompleted,
      completedAt: newCompleted ? new Date() : null,
    },
  });

  // Recalculate score live
  // Load profile + role for fresh score computation
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: { profileSkills: { include: { skill: true } } },
  });
  const role = await prisma.role.findUnique({
    where: { id: item.analysis.roleId },
    include: { roleSkills: { include: { skill: true } } },
  });

  let newScore: number | null = null;
  if (profile && role) {
    // Boost proficiency for completed items (simulate learning)
    const completedItems = await prisma.roadmapItem.findMany({
      where: { analysisId: item.analysisId, completed: true },
      include: { skill: true },
    });
    const completedSkillIds = new Set(completedItems.map((ci) => ci.skillId));

    const userSkills: SkillInput[] = profile.profileSkills.map((ps) => ({
      skillId: ps.skillId,
      canonicalName: ps.skill.canonicalName,
      // If the skill was just completed via roadmap, boost to minProficiency
      userProficiency: completedSkillIds.has(ps.skillId)
        ? Math.max(ps.proficiency, 3)
        : ps.proficiency,
      evidenceType: ps.evidenceType as SkillInput["evidenceType"],
    }));

    // Add roadmap-completed skills not in profile
    for (const ci of completedItems) {
      if (!userSkills.find((s) => s.skillId === ci.skillId)) {
        userSkills.push({
          skillId: ci.skillId,
          canonicalName: ci.skill.canonicalName,
          userProficiency: 3,
          evidenceType: "PROJECT",
        });
      }
    }

    const requirements: RoleRequirement[] = role.roleSkills.map((rs) => ({
      skillId: rs.skillId,
      canonicalName: rs.skill.canonicalName,
      required: rs.required,
      weight: rs.weight,
      minProficiency: rs.minProficiency,
    }));

    const { score } = computeScore(userSkills, requirements);
    newScore = score;

    // Update analysis score
    await prisma.analysis.update({
      where: { id: item.analysisId },
      data: { score },
    });
  }

  // Log progress event
  await prisma.progressEvent.create({
    data: {
      userId: session.user.id,
      analysisId: item.analysisId,
      eventType: newCompleted ? "ITEM_COMPLETED" : "ITEM_UNCOMPLETED",
      payload: { itemId, newScore },
    },
  });

  return NextResponse.json({ item: updated, newScore });
}
