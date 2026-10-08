import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const analyses = await prisma.analysis.findMany({
    where: { userId: session.user.id },
    include: {
      role: true,
      gaps: { include: { skill: true } },
      roadmapItems: { where: { completed: true }, select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ analyses });
}
