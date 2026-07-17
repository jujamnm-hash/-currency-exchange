import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        ok: false,
        status: "no_database",
        message: "DATABASE_URL دانەنراوە. لە Vercel → Storage → Postgres زیاد بکە",
      });
    }

    const serviceCount = await prisma.service.count();
    const settingsCount = await prisma.settings.count();

    return NextResponse.json({
      ok: true,
      status: serviceCount > 0 ? "ready" : "needs_seed",
      serviceCount,
      settingsCount,
      shopName: "غەسلی هەولێر",
    });
  } catch (error) {
    console.error("Setup status error:", error);
    return NextResponse.json({
      ok: false,
      status: "error",
      message: "داتابەیس پێویستی بە ڕێکخستن هەیە",
    });
  }
}

export async function POST() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "DATABASE_URL دانەنراوە" },
        { status: 500 }
      );
    }

    const { execSync } = await import("child_process");

    execSync("npx prisma db push --skip-generate", {
      stdio: "pipe",
      env: process.env,
    });

    execSync("npx tsx prisma/seed.ts", {
      stdio: "pipe",
      env: process.env,
    });

    const serviceCount = await prisma.service.count();

    return NextResponse.json({
      ok: true,
      message: "داتابەیس ئامادەیە!",
      serviceCount,
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "هەڵە لە ڕێکخستنی داتابەیس" },
      { status: 500 }
    );
  }
}
