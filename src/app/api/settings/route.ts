import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [settings, employees, inventory, membershipPlans] = await Promise.all([
      prisma.settings.findMany(),
      prisma.employee.findMany({ where: { isActive: true } }),
      prisma.inventoryItem.findMany(),
      prisma.membershipPlan.findMany({ where: { isActive: true } }),
    ]);

    const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

    return NextResponse.json({
      settings: settingsMap,
      employees,
      inventory,
      membershipPlans,
    });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "هەڵە لە وەرگرتنی ڕێکخستنەکان" }, { status: 500 });
  }
}
