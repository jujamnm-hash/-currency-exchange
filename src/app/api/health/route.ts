import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureSchema } from "@/lib/db-bootstrap";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          ok: false,
          database: "missing",
          error: "DATABASE_URL دانەنراوە لە Vercel Environment Variables",
        },
        { status: 503 }
      );
    }
    await ensureSchema();
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
