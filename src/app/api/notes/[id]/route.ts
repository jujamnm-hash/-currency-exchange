import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ensureSchema } from "@/lib/db-bootstrap";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  content: z.string().trim().min(1).max(8000).optional(),
  deviceId: z.string().min(8).max(80),
});

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  await ensureSchema();
  const { id } = await ctx.params;
  const note = await prisma.spatialNote.findUnique({ where: { id } });
  if (!note) {
    return NextResponse.json({ error: "نەدۆزرایەوە" }, { status: 404 });
  }
  return NextResponse.json({ note });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    await ensureSchema();
    const { id } = await ctx.params;
    const body = updateSchema.parse(await req.json());
    const existing = await prisma.spatialNote.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "نەدۆزرایەوە" }, { status: 404 });
    }
    if (existing.deviceId !== body.deviceId) {
      return NextResponse.json({ error: "دەسەڵات نییە" }, { status: 403 });
    }
    const note = await prisma.spatialNote.update({
      where: { id },
      data: {
        title: body.title,
        content: body.content,
      },
    });
    return NextResponse.json({ note });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "داتای نادروست" }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "هەڵە";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    await ensureSchema();
    const { id } = await ctx.params;
    const deviceId = req.nextUrl.searchParams.get("deviceId");
    if (!deviceId) {
      return NextResponse.json({ error: "deviceId پێویستە" }, { status: 400 });
    }
    const existing = await prisma.spatialNote.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "نەدۆزرایەوە" }, { status: 404 });
    }
    if (existing.deviceId !== deviceId) {
      return NextResponse.json({ error: "دەسەڵات نییە" }, { status: 403 });
    }
    await prisma.spatialNote.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "هەڵە";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
