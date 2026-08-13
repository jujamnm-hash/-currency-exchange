import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ensureSchema } from "@/lib/db-bootstrap";
import { parseColorProfile } from "@/lib/vision";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  content: z.string().trim().min(1).max(8000).optional(),
  deviceId: z.string().min(8).max(80),
  /** بەهێزکردنی ناسنامە کاتێ قفڵ دەبێت */
  enrichProfile: z
    .object({
      patch: z.array(z.number()).max(512).optional(),
      patches: z.array(z.array(z.number())).max(8).optional(),
      phash: z.string().optional(),
      hog: z.array(z.number()).max(64).optional(),
      brief: z.string().optional(),
      orb: z.array(z.string()).max(24).optional(),
      structure: z.array(z.number()).max(32).optional(),
      hashes: z.array(z.string()).max(64).optional(),
    })
    .optional(),
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

    let colorProfile = existing.colorProfile;
    if (body.enrichProfile) {
      const current = parseColorProfile(existing.colorProfile);
      const incoming = body.enrichProfile;
      const patches = [
        ...(current.patches ?? []),
        ...(current.patch ? [current.patch] : []),
        ...(incoming.patches ?? []),
        ...(incoming.patch ? [incoming.patch] : []),
      ].slice(0, 8);
      const hashes = Array.from(
        new Set([...(current.hashes ?? []), ...(incoming.hashes ?? [])])
      ).slice(0, 48);
      colorProfile = JSON.stringify({
        ...current,
        patch: incoming.patch ?? current.patch,
        patches,
        phash: current.phash ?? incoming.phash,
        hog: current.hog ?? incoming.hog,
        brief: current.brief ?? incoming.brief,
        orb: Array.from(
          new Set([...(current.orb ?? []), ...(incoming.orb ?? [])])
        ).slice(0, 16),
        structure: incoming.structure ?? current.structure,
        hashes,
      });
    }

    const note = await prisma.spatialNote.update({
      where: { id },
      data: {
        title: body.title,
        content: body.content,
        colorProfile,
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
