import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const analysis = await prisma.analysis.findUnique({
    where: { id },
    include: {
      role: { include: { roleSkills: { include: { skill: true } } } },
      gaps: { include: { skill: true }, orderBy: { weight: "desc" } },
      roadmapItems: { include: { skill: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  if (!analysis) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (analysis.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json({ analysis });
}
