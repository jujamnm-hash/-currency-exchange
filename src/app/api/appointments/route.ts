import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    const where = date
      ? {
          scheduledAt: {
            gte: startOfDay(new Date(date)),
            lte: endOfDay(new Date(date)),
          },
        }
      : { scheduledAt: { gte: new Date() } };

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { scheduledAt: "asc" },
      include: {
        customer: true,
        vehicle: true,
        items: { include: { service: true } },
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Appointments GET error:", error);
    return NextResponse.json({ error: "هەڵە لە وەرگرتنی کاتەکان" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, vehicleId, scheduledAt, serviceIds, notes } = body;

    if (!customerId || !scheduledAt || !serviceIds?.length) {
      return NextResponse.json(
        { error: "کڕیار، کات و خزمەتگوزاری پێویستە" },
        { status: 400 }
      );
    }

    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
    });

    const estimatedTotal = services.reduce((sum, s) => sum + s.basePrice, 0);

    const appointment = await prisma.appointment.create({
      data: {
        customerId,
        vehicleId,
        scheduledAt: new Date(scheduledAt),
        notes,
        estimatedTotal,
        items: {
          create: services.map((s) => ({
            serviceId: s.id,
            price: s.basePrice,
          })),
        },
      },
      include: {
        customer: true,
        vehicle: true,
        items: { include: { service: true } },
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Appointments POST error:", error);
    return NextResponse.json({ error: "هەڵە لە دروستکردنی کات" }, { status: 500 });
  }
}
