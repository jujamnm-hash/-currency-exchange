import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const count = await prisma.spatialNote.count();
    return NextResponse.json({
      ok: true,
      database: "connected",
      notes: count,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    return NextResponse.json(
      { ok: false, database: "error", error: message },
      { status: 503 }
    );
  }
}
