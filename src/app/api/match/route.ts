import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { distanceMeters, geoBoundingBox, headingDelta } from "@/lib/geo";
import {
  colorDistance,
  hammingDistanceHex,
  matchScore,
  parseColorProfile,
} from "@/lib/vision";

export const dynamic = "force-dynamic";

const matchSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  heading: z.number().nullable().optional(),
  imageHash: z.string().regex(/^[0-9a-f]{16}$/i),
  colorProfile: z.object({
    regions: z.array(z.number()).min(9),
    luma: z.array(z.number()).min(4),
  }),
  deviceId: z.string().optional(),
  radiusM: z.number().min(10).max(500).optional(),
  minScore: z.number().min(0).max(100).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const data = matchSchema.parse(await req.json());
    const radiusM = data.radiusM ?? 60;
    const minScore = data.minScore ?? 42;
    const box = geoBoundingBox(data.latitude, data.longitude, radiusM);

    const candidates = await prisma.spatialNote.findMany({
      where: {
        latitude: { gte: box.minLat, lte: box.maxLat },
        longitude: { gte: box.minLon, lte: box.maxLon },
        ...(data.deviceId ? { deviceId: data.deviceId } : {}),
      },
      take: 120,
      orderBy: { createdAt: "desc" },
    });

    const matches = candidates
      .map((note) => {
        const dist = distanceMeters(
          data.latitude,
          data.longitude,
          note.latitude,
          note.longitude
        );
        if (dist > radiusM) return null;

        const hashDist = hammingDistanceHex(
          data.imageHash.toLowerCase(),
          note.imageHash.toLowerCase()
        );
        const profile = parseColorProfile(note.colorProfile);
        const cDist = colorDistance(data.colorProfile, profile);
        const hDelta = headingDelta(data.heading, note.heading);
        const score = matchScore({
          hashDist,
          colorDist: cDist,
          distanceM: dist,
          headingDelta: hDelta,
          radiusM,
        });

        if (score < minScore) return null;

        return {
          ...note,
          score,
          distanceM: Math.round(dist * 10) / 10,
          hashDist,
          colorDist: Math.round(cDist * 1000) / 1000,
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b!.score - a!.score) || a!.distanceM - b!.distanceM)
      .slice(0, 8);

    return NextResponse.json({ matches, scanned: candidates.length, radiusM });
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
