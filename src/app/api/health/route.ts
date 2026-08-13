import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/db-bootstrap";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { ok: false, error: "DATABASE_URL دانەنراوە" },
        { status: 500 },
      );
    }
    await ensureSchema();
    const [products, sales, accounts] = await Promise.all([
      prisma.product.count(),
      prisma.sale.count(),
      prisma.account.count(),
    ]);
    return NextResponse.json({
      ok: true,
      app: "هەژمار",
      products,
      sales,
      accounts,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "هەڵەی نەزانراو",
      },
      { status: 500 },
    );
  }
}
