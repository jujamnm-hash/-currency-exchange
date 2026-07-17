import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-static";

export async function GET() {
  try {
    const [services, addons, multipliers] = await Promise.all([
      prisma.service.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.serviceAddon.findMany({ where: { isActive: true } }),
      prisma.vehiclePriceMultiplier.findMany(),
    ]);

    return NextResponse.json({ services, addons, multipliers });
  } catch (error) {
    console.error("Services GET error:", error);
    return NextResponse.json({ error: "هەڵە لە وەرگرتنی خزمەتگوزارییەکان" }, { status: 500 });
  }
}
