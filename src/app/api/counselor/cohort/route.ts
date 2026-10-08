import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find all candidate students
  const students = await prisma.user.findMany({
    where: { role: "CANDIDATE" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      profile: {
        select: {
          id: true,
          profileSkills: {
            include: { skill: true },
          },
        },
      },
      analyses: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          role: true,
          gaps: {
            include: { skill: true },
          },
          roadmapItems: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ students });
}
