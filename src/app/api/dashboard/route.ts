import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export const dynamic = "force-static";

export async function GET() {
  try {
    const today = new Date();
    const dayStart = startOfDay(today);
    const dayEnd = endOfDay(today);

    const [
      todayOrders,
      activeQueue,
      todayRevenue,
      totalCustomers,
      todayAppointments,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count({
        where: { createdAt: { gte: dayStart, lte: dayEnd } },
      }),
      prisma.order.count({
        where: {
          status: { notIn: ["COMPLETED", "CANCELLED"] },
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: dayStart, lte: dayEnd },
          status: "COMPLETED",
        },
        _sum: { total: true },
      }),
      prisma.customer.count(),
      prisma.appointment.count({
        where: {
          scheduledAt: { gte: dayStart, lte: dayEnd },
          status: { in: ["SCHEDULED", "CONFIRMED"] },
        },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          items: { include: { service: true } },
        },
      }),
    ]);

    return NextResponse.json({
      todayOrders,
      activeQueue,
      todayRevenue: todayRevenue._sum.total ?? 0,
      totalCustomers,
      todayAppointments,
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "هەڵە لە وەرگرتنی ئامارەکان" },
      { status: 500 }
    );
  }
}
