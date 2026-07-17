import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, subDays } from "date-fns";

export const dynamic = "force-static";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") ?? "today";

    let start: Date;
    let end: Date = endOfDay(new Date());

    switch (period) {
      case "week":
        start = startOfDay(subDays(new Date(), 7));
        break;
      case "month":
        start = startOfDay(subDays(new Date(), 30));
        break;
      default:
        start = startOfDay(new Date());
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: "COMPLETED",
      },
      include: { payment: true, items: { include: { service: true } } },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const cashRevenue = orders
      .filter((o) => o.payment?.method === "CASH")
      .reduce((sum, o) => sum + o.total, 0);
    const cardRevenue = orders
      .filter((o) => o.payment?.method === "CARD")
      .reduce((sum, o) => sum + o.total, 0);

    const serviceBreakdown: Record<string, { count: number; revenue: number }> = {};
    for (const order of orders) {
      for (const item of order.items) {
        const name = item.service.nameKu;
        if (!serviceBreakdown[name]) serviceBreakdown[name] = { count: 0, revenue: 0 };
        serviceBreakdown[name].count++;
        serviceBreakdown[name].revenue += item.price;
      }
    }

    const vehicleBreakdown: Record<string, number> = {};
    for (const order of orders) {
      vehicleBreakdown[order.vehicleType] = (vehicleBreakdown[order.vehicleType] ?? 0) + 1;
    }

    return NextResponse.json({
      period,
      totalOrders: orders.length,
      totalRevenue,
      cashRevenue,
      cardRevenue,
      avgOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      serviceBreakdown,
      vehicleBreakdown,
    });
  } catch (error) {
    console.error("Reports GET error:", error);
    return NextResponse.json({ error: "هەڵە لە وەرگرتنی ڕاپۆرت" }, { status: 500 });
  }
}
