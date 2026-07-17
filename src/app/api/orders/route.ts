import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber, calculateOrderTotal, getNextStatus } from "@/lib/utils";
import { VehicleType, OrderStatus } from "@prisma/client";

export const dynamic = "force-static";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as OrderStatus | null;
    const active = searchParams.get("active");

    const where = active === "true"
      ? { status: { notIn: ["COMPLETED" as OrderStatus, "CANCELLED" as OrderStatus] } }
      : status
      ? { status }
      : {};

    const orders = await prisma.order.findMany({
      where,
      orderBy: [{ queuePosition: "asc" }, { createdAt: "asc" }],
      include: {
        items: { include: { service: true } },
        addons: { include: { addon: true } },
        payment: true,
        employee: true,
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "هەڵە لە وەرگرتنی داواکارییەکان" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      plateNumber,
      vehicleType = "SEDAN",
      customerName,
      customerPhone,
      customerId,
      vehicleId,
      serviceIds = [],
      addonIds = [],
      employeeId,
      notes,
      discount = 0,
      paymentMethod = "CASH",
    } = body;

    if (!plateNumber || serviceIds.length === 0) {
      return NextResponse.json(
        { error: "ژمارەی ئۆتۆمبێل و خزمەتگوزاری پێویستە" },
        { status: 400 }
      );
    }

    const { subtotal, tax, total } = await calculateOrderTotal(
      serviceIds,
      addonIds,
      vehicleType as VehicleType,
      discount
    );

    const maxQueue = await prisma.order.aggregate({
      where: { status: { notIn: ["COMPLETED", "CANCELLED"] } },
      _max: { queuePosition: true },
    });

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        plateNumber,
        vehicleType: vehicleType as VehicleType,
        customerName,
        customerPhone,
        customerId,
        vehicleId,
        employeeId,
        notes,
        subtotal,
        tax,
        discount,
        total,
        queuePosition: (maxQueue._max.queuePosition ?? 0) + 1,
        items: {
          create: await Promise.all(
            serviceIds.map(async (serviceId: string) => {
              const service = await prisma.service.findUnique({ where: { id: serviceId } });
              const multiplier = await prisma.vehiclePriceMultiplier.findUnique({
                where: { vehicleType: vehicleType as VehicleType },
              });
              return {
                serviceId,
                price: (service?.basePrice ?? 0) * (multiplier?.multiplier ?? 1),
              };
            })
          ),
        },
        addons: {
          create: await Promise.all(
            addonIds.map(async (addonId: string) => {
              const addon = await prisma.serviceAddon.findUnique({ where: { id: addonId } });
              return { addonId, price: addon?.price ?? 0 };
            })
          ),
        },
        payment: {
          create: {
            amount: total,
            method: paymentMethod,
            status: "PAID",
            paidAt: new Date(),
          },
        },
      },
      include: {
        items: { include: { service: true } },
        addons: { include: { addon: true } },
        payment: true,
      },
    });

    if (customerPhone) {
      await prisma.customer.upsert({
        where: { phone: customerPhone },
        update: { name: customerName ?? undefined },
        create: {
          name: customerName ?? "کڕیار",
          phone: customerPhone,
          vehicles: {
            create: {
              plateNumber,
              vehicleType: vehicleType as VehicleType,
            },
          },
        },
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Orders POST error:", error);
    return NextResponse.json({ error: "هەڵە لە دروستکردنی داواکاری" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, status, employeeId } = body;

    if (!id) {
      return NextResponse.json({ error: "ناسنامەی داواکاری پێویستە" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "داواکاری نەدۆزرایەوە" }, { status: 404 });
    }

    let updateData: Record<string, unknown> = {};

    if (action === "advance") {
      const nextStatus = getNextStatus(order.status);
      if (!nextStatus) {
        return NextResponse.json({ error: "قۆناغی داهاتوو نییە" }, { status: 400 });
      }
      updateData = {
        status: nextStatus,
        startedAt: order.startedAt ?? (nextStatus !== "WAITING" ? new Date() : undefined),
        completedAt: nextStatus === "COMPLETED" ? new Date() : undefined,
        queuePosition: nextStatus === "COMPLETED" ? null : order.queuePosition,
      };
    } else if (action === "cancel") {
      updateData = { status: "CANCELLED", queuePosition: null };
    } else if (status) {
      updateData = {
        status: status as OrderStatus,
        completedAt: status === "COMPLETED" ? new Date() : undefined,
        queuePosition: status === "COMPLETED" || status === "CANCELLED" ? null : order.queuePosition,
      };
    }

    if (employeeId) updateData.employeeId = employeeId;

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: { include: { service: true } },
        addons: { include: { addon: true } },
        payment: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Orders PATCH error:", error);
    return NextResponse.json({ error: "هەڵە لە نوێکردنەوەی داواکاری" }, { status: 500 });
  }
}
