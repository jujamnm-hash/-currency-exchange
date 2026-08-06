import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.settings.findMany();
    const settings: Record<string, string> = {};
    rows.forEach((r) => {
      settings[r.key] = r.value;
    });
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "database unavailable" }, { status: 503 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    for (const [key, value] of Object.entries(body)) {
      await prisma.settings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { id: `s_${key}`, key, value: String(value) },
      });
    }
    const rows = await prisma.settings.findMany();
    const settings: Record<string, string> = {};
    rows.forEach((r) => {
      settings[r.key] = r.value;
    });
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
