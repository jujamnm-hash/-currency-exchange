import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ensureSchema } from "@/lib/db-bootstrap";
import { distanceMeters, geoBoundingBox } from "@/lib/geo";
import {
  colorDistance,
  consensusHashDistance,
  hammingDistanceHex,
  isConfidentMatch,
  matchScore,
  noteHashes,
  parseColorProfile,
  patchSimilarity,
  rejectAmbiguous,
} from "@/lib/vision";

export const dynamic = "force-dynamic";

const matchSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  heading: z.number().nullable().optional(),
  imageHash: z.string().regex(/^[0-9a-f]{16}$/i),
  hashes: z.array(z.string().regex(/^[0-9a-f]{16}$/i)).max(64).optional(),
  colorProfile: z.object({
    regions: z.array(z.number()).min(9),
    luma: z.array(z.number()).min(4),
    hashes: z.array(z.string()).optional(),
    edges: z.array(z.number()).max(32).optional(),
    phash: z.string().optional(),
    patch: z.array(z.number()).max(512).optional(),
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
    const radiusM = data.radiusM ?? (visualOnly ? 2000 : 150);
    const minScore = data.minScore ?? 62;

    const queryHashes = Array.from(
      new Set(
        [
          data.imageHash,
          ...(data.hashes ?? []),
          ...(data.colorProfile.hashes ?? []),
          data.colorProfile.phash ?? "",
        ]
          .filter(Boolean)
          .map((h) => h.toLowerCase())
      )
    );

    const byId = new Map<
      string,
      Awaited<ReturnType<typeof prisma.spatialNote.findMany>>[number]
    >();

    if (data.deviceId) {
      const deviceNotes = await prisma.spatialNote.findMany({
        where: { deviceId: data.deviceId },
        take: 100,
        orderBy: { createdAt: "desc" },
      });
      for (const n of deviceNotes) byId.set(n.id, n);
    } else if (!visualOnly) {
      const box = geoBoundingBox(data.latitude, data.longitude, radiusM);
      const geoNotes = await prisma.spatialNote.findMany({
        where: {
          latitude: { gte: box.minLat, lte: box.maxLat },
          longitude: { gte: box.minLon, lte: box.maxLon },
        },
        take: 80,
        orderBy: { createdAt: "desc" },
      });
      for (const n of geoNotes) byId.set(n.id, n);
    }

    const candidates = Array.from(byId.values());

    const scored = candidates
      .map((note) => {
        const dist = distanceMeters(
          data.latitude,
          data.longitude,
          note.latitude,
          note.longitude
        );
        const profile = parseColorProfile(note.colorProfile);
        const stored = noteHashes(note.imageHash, profile);
        const consensus = consensusHashDistance(queryHashes, stored);
        const cDist = colorDistance(data.colorProfile, profile);
        const patchSim = patchSimilarity(data.colorProfile.patch, profile.patch);
        const phashDist =
          data.colorProfile.phash && profile.phash
            ? hammingDistanceHex(data.colorProfile.phash, profile.phash)
            : consensus.best;

        // دەروازەی سەرەتایی توند
        if (consensus.best > 12) return null;
        if (cDist > 0.26) return null;
        if (profile.patch?.length && patchSim < 0.7) return null;
        if (profile.phash && phashDist > 16) return null;

        const score = matchScore({
          hashDist: consensus.best,
          colorDist: cDist,
          distanceM: 0,
          headingDelta: 90,
          radiusM,
          visualPrimary: true,
          avgHashDist: consensus.avgTop,
          closeHits: consensus.closeHits,
          patchSim,
          phashDist,
        });

        if (
          !isConfidentMatch({
            hashDist: consensus.best,
            colorDist: cDist,
            distanceM: dist,
            score,
            minScore,
            avgHashDist: consensus.avgTop,
            closeHits: consensus.closeHits,
            patchSim,
            phashDist,
          })
        ) {
          return null;
        }

        return {
          ...note,
          score,
          distanceM: Math.round(dist * 10) / 10,
          hashDist: consensus.best,
          colorDist: Math.round(cDist * 1000) / 1000,
          patchSim: Math.round(patchSim * 1000) / 1000,
          phashDist,
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b!.score - a!.score) || a!.hashDist - b!.hashDist) as Array<{
      score: number;
      hashDist: number;
      [k: string]: unknown;
    }>;

    const matches = rejectAmbiguous(scored, 12).slice(0, 3);

    return NextResponse.json({
      matches,
      scanned: candidates.length,
      radiusM,
      visualOnly,
      minScore,
      mode: "strict-identity-v2",
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
