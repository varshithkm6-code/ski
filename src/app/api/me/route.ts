import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // 1. Find all analyses for this user
    const analyses = await prisma.analysis.findMany({
      where: { userId },
      select: { id: true },
    });
    const analysisIds = analyses.map((a) => a.id);

    // 2. Delete associated roadmap items and gaps
    if (analysisIds.length > 0) {
      await prisma.roadmapItem.deleteMany({
        where: { analysisId: { in: analysisIds } },
      });
      await prisma.gap.deleteMany({
        where: { analysisId: { in: analysisIds } },
      });
      await prisma.analysis.deleteMany({
        where: { userId },
      });
    }

    // 3. Delete profile skills and profile
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (profile) {
      await prisma.profileSkill.deleteMany({
        where: { profileId: profile.id },
      });
      await prisma.profile.delete({
        where: { id: profile.id },
      });
    }

    // 4. Delete progress events
    await prisma.progressEvent.deleteMany({
      where: { userId },
    });

    // 5. Delete user record
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: "Account and all personal career data permanently deleted.",
    });
  } catch (error) {
    console.error("Failed to delete user account:", error);
    return NextResponse.json(
      { error: "Failed to delete user data. Please try again." },
      { status: 500 }
    );
  }
}
