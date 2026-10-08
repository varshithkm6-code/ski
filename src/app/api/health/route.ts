import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const startTime = Date.now();
    // Verify database connection responsiveness
    await prisma.user.findFirst({ select: { id: true } });
    const latencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "healthy",
        database: "connected",
        latencyMs,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database health check error:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Database connection error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
