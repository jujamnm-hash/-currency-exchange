import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ensureSchema } from "@/lib/db-bootstrap";
import { distanceMeters, geoBoundingBox } from "@/lib/geo";
import {
  bestPatchScore,
  colorDistance,
  consensusHashDistance,
  hammingDistanceHex,
  hogSimilarity,
  isConfidentMatch,
  matchScore,
  noteHashes,
  orbSimilarity,
  parseColorProfile,
  rejectAmbiguous,
  structureSimilarity,
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
    patches: z.array(z.array(z.number())).max(8).optional(),
    hog: z.array(z.number()).max(64).optional(),
    brief: z.string().optional(),
    orb: z.array(z.string()).max(24).optional(),
    structure: z.array(z.number()).max(32).optional(),
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
    const minScore = data.minScore ?? 76;

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
        const patchScore = bestPatchScore(
          data.colorProfile.patch,
          profile.patch,
          profile.patches
        );
        const phashDist =
          data.colorProfile.phash && profile.phash
            ? hammingDistanceHex(data.colorProfile.phash, profile.phash)
            : consensus.best;
        const hogSim = hogSimilarity(data.colorProfile.hog, profile.hog);
        const hasPatch = Boolean(profile.patch?.length || profile.patches?.length);
        const briefDist =
          data.colorProfile.brief && profile.brief
            ? hammingDistanceHex(data.colorProfile.brief, profile.brief)
            : undefined;
        const orbSim =
          data.colorProfile.orb?.length && profile.orb?.length
            ? orbSimilarity(data.colorProfile.orb, profile.orb)
            : undefined;
        const structureSim =
          data.colorProfile.structure?.length && profile.structure?.length
            ? structureSimilarity(
                data.colorProfile.structure,
                profile.structure
              )
            : undefined;

        // دەروازەی AND سەرەتایی
        if (consensus.best > 8) return null;
        if (cDist > 0.16) return null;
        if (hasPatch && patchScore.combined < 0.82) return null;
        if (profile.phash && phashDist > 9) return null;
        if (profile.hog?.length && hogSim < 0.76) return null;
        if (briefDist != null && briefDist > 14) return null;
        if (orbSim != null && orbSim < 0.4) return null;
        if (structureSim != null && structureSim < 0.7) return null;

        const score = matchScore({
          hashDist: consensus.best,
          colorDist: cDist,
          distanceM: 0,
          headingDelta: 90,
          radiusM,
          visualPrimary: true,
          avgHashDist: consensus.avgTop,
          closeHits: consensus.closeHits,
          patchSim: patchScore.ncc,
          patchSSIM: patchScore.ssim,
          phashDist,
          hogSim,
          orbSim,
          structureSim,
          briefDist,
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
            patchSim: patchScore.ncc,
            patchSSIM: patchScore.ssim,
            phashDist,
            hogSim,
            hasPatch,
            briefDist,
            orbSim,
            structureSim,
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
          patchSim: Math.round(patchScore.combined * 1000) / 1000,
          phashDist,
          hogSim: Math.round(hogSim * 1000) / 1000,
          orbSim: orbSim != null ? Math.round(orbSim * 1000) / 1000 : undefined,
          structureSim:
            structureSim != null
              ? Math.round(structureSim * 1000) / 1000
              : undefined,
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b!.score - a!.score) || a!.hashDist - b!.hashDist) as Array<{
      score: number;
      hashDist: number;
      [k: string]: unknown;
    }>;

    const matches = rejectAmbiguous(scored, 18).slice(0, 1);

    return NextResponse.json({
      matches,
      scanned: candidates.length,
      radiusM,
      visualOnly,
      minScore,
      mode: "orb-structure-lock-v5",
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
