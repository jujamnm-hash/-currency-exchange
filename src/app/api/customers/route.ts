import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const customers = await prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        vehicles: true,
        _count: { select: { orders: true } },
      },
      take: 50,
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Customers GET error:", error);
    return NextResponse.json({ error: "هەڵە لە وەرگرتنی کڕیارەکان" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, plateNumber, vehicleType } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "ناو و ژمارەی تەلەفۆن پێویستە" }, { status: 400 });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email,
        vehicles: plateNumber
          ? { create: { plateNumber, vehicleType: vehicleType ?? "SEDAN" } }
          : undefined,
      },
      include: { vehicles: true },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Customers POST error:", error);
    return NextResponse.json({ error: "هەڵە لە دروستکردنی کڕیار" }, { status: 500 });
  }
}
