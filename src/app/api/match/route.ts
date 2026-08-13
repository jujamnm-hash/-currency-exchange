import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ensureSchema } from "@/lib/db-bootstrap";
import { distanceMeters, geoBoundingBox, headingDelta } from "@/lib/geo";
import {
  bestHashDistance,
  colorDistance,
  isConfidentMatch,
  matchScore,
  noteHashes,
  parseColorProfile,
} from "@/lib/vision";

export const dynamic = "force-dynamic";

const matchSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  heading: z.number().nullable().optional(),
  imageHash: z.string().regex(/^[0-9a-f]{16}$/i),
  hashes: z.array(z.string().regex(/^[0-9a-f]{16}$/i)).max(12).optional(),
  colorProfile: z.object({
    regions: z.array(z.number()).min(9),
    luma: z.array(z.number()).min(4),
    hashes: z.array(z.string()).optional(),
  }),
  deviceId: z.string().optional(),
  radiusM: z.number().min(10).max(2000).optional(),
  minScore: z.number().min(0).max(100).optional(),
  visualOnly: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const data = matchSchema.parse(await req.json());
    const visualOnly = Boolean(data.visualOnly);
    const radiusM = data.radiusM ?? (visualOnly ? 2000 : 120);
    const minScore = data.minScore ?? 28;

    const queryHashes = Array.from(
      new Set(
        [data.imageHash, ...(data.hashes ?? []), ...(data.colorProfile.hashes ?? [])]
          .filter(Boolean)
          .map((h) => h.toLowerCase())
      )
    );

    // کاندید: هەموو تێبینییەکانی ئەم ئامێرە + نزیکەکان بە GPS
    const byId = new Map<string, Awaited<ReturnType<typeof prisma.spatialNote.findMany>>[number]>();

    if (data.deviceId) {
      const deviceNotes = await prisma.spatialNote.findMany({
        where: { deviceId: data.deviceId },
        take: 100,
        orderBy: { createdAt: "desc" },
      });
      for (const n of deviceNotes) byId.set(n.id, n);
    }

    if (!visualOnly) {
      const box = geoBoundingBox(data.latitude, data.longitude, radiusM);
      const geoNotes = await prisma.spatialNote.findMany({
        where: {
          latitude: { gte: box.minLat, lte: box.maxLat },
          longitude: { gte: box.minLon, lte: box.maxLon },
        },
        take: 120,
        orderBy: { createdAt: "desc" },
      });
      for (const n of geoNotes) byId.set(n.id, n);
    }

    // تێبینییەکانی fallback (٠,٠) لەسەر هەمان ئامێر
    if (data.deviceId) {
      const orphan = await prisma.spatialNote.findMany({
        where: {
          deviceId: data.deviceId,
          latitude: { gte: -0.01, lte: 0.01 },
          longitude: { gte: -0.01, lte: 0.01 },
        },
        take: 50,
        orderBy: { createdAt: "desc" },
      });
      for (const n of orphan) byId.set(n.id, n);
    }

    const candidates = Array.from(byId.values());

    const matches = candidates
      .map((note) => {
        const dist = distanceMeters(
          data.latitude,
          data.longitude,
          note.latitude,
          note.longitude
        );
        const profile = parseColorProfile(note.colorProfile);
        const stored = noteHashes(note.imageHash, profile);
        const hashDist = bestHashDistance(queryHashes, stored);
        const cDist = colorDistance(data.colorProfile, profile);
        const hDelta = headingDelta(data.heading, note.heading);

        // ئەگەر GPSـی تێبینی یان ئێستا fallback بێت → تەنها بینراو
        const noteIsFallback =
          Math.abs(note.latitude) < 0.01 && Math.abs(note.longitude) < 0.01;
        const queryIsFallback = visualOnly || (Math.abs(data.latitude) < 0.01 && Math.abs(data.longitude) < 0.01);
        const visualPrimary = noteIsFallback || queryIsFallback || dist > radiusM;

        // ئەگەر زۆر دوور بێت و هاش خراپ بێت — پشتگوێی بخە
        if (!visualPrimary && dist > radiusM && hashDist > 18) return null;
        if (visualPrimary && hashDist > 26 && cDist > 0.35) return null;

        const score = matchScore({
          hashDist,
          colorDist: cDist,
          distanceM: visualPrimary ? 0 : dist,
          headingDelta: hDelta,
          radiusM,
          visualPrimary,
        });

        if (
          !isConfidentMatch({
            hashDist,
            colorDist: cDist,
            distanceM: visualPrimary ? 0 : dist,
            score,
            minScore,
          })
        ) {
          return null;
        }

        return {
          ...note,
          score,
          distanceM: Math.round(dist * 10) / 10,
          hashDist,
          colorDist: Math.round(cDist * 1000) / 1000,
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b!.score - a!.score) || a!.hashDist - b!.hashDist)
      .slice(0, 8);

    return NextResponse.json({
      matches,
      scanned: candidates.length,
      radiusM,
      visualOnly,
      minScore,
    });
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
