import { prisma } from "./prisma";

let ready: Promise<void> | null = null;

/** خشتەی SpatialNote دروست دەکات ئەگەر نەبێت (بۆ Vercel بێ db push) */
export async function ensureSchema(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "SpatialNote" (
          "id" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "latitude" DOUBLE PRECISION NOT NULL,
          "longitude" DOUBLE PRECISION NOT NULL,
          "accuracy" DOUBLE PRECISION,
          "altitude" DOUBLE PRECISION,
          "heading" DOUBLE PRECISION,
          "imageHash" TEXT NOT NULL,
          "colorProfile" TEXT NOT NULL,
          "thumbnail" TEXT,
          "deviceId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "SpatialNote_pkey" PRIMARY KEY ("id")
        )
      `);
      await prisma.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "SpatialNote_deviceId_idx" ON "SpatialNote"("deviceId")`
      );
      await prisma.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "SpatialNote_latitude_longitude_idx" ON "SpatialNote"("latitude", "longitude")`
      );
      await prisma.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "SpatialNote_createdAt_idx" ON "SpatialNote"("createdAt")`
      );
    })().catch((err) => {
      ready = null;
      throw err;
    });
  }
  await ready;
}
