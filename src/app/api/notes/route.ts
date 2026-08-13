import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ensureSchema } from "@/lib/db-bootstrap";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  title: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1).max(8000),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().nullable().optional(),
  altitude: z.number().nullable().optional(),
  heading: z.number().nullable().optional(),
  imageHash: z.string().regex(/^[0-9a-f]{16}$/i),
  colorProfile: z.object({
    regions: z.array(z.number()).min(9),
    luma: z.array(z.number()).min(4),
    hashes: z.array(z.string()).max(64).optional(),
    edges: z.array(z.number()).max(32).optional(),
    phash: z.string().optional(),
    patch: z.array(z.number()).max(512).optional(),
    patches: z.array(z.array(z.number())).max(8).optional(),
    hog: z.array(z.number()).max(64).optional(),
  }),
  thumbnail: z.string().nullable().optional(),
  deviceId: z.string().min(8).max(80),
});

export async function GET(req: NextRequest) {
  try {
    await ensureSchema();
    const deviceId = req.nextUrl.searchParams.get("deviceId");
    const notes = await prisma.spatialNote.findMany({
      where: deviceId ? { deviceId } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json({ notes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "هەڵە";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const body = await req.json();
    const data = createSchema.parse(body);

    const note = await prisma.spatialNote.create({
      data: {
        title: data.title,
        content: data.content,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy ?? null,
        altitude: data.altitude ?? null,
        heading: data.heading ?? null,
        imageHash: data.imageHash.toLowerCase(),
        colorProfile: JSON.stringify(data.colorProfile),
        thumbnail: data.thumbnail ?? null,
        deviceId: data.deviceId,
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "داتای نادروست", details: error.flatten() },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : "هەڵە";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
