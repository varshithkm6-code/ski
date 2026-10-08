import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {

  const roles = await prisma.role.findMany({
    include: {
      roleSkills: {
        include: { skill: true },
        orderBy: { weight: "desc" },
      },
    },
    orderBy: { title: "asc" },
  });

  return NextResponse.json({ roles });
}
