import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNextStatus } from "@/lib/utils";
import { OrderStatus } from "@prisma/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { service: true } },
        addons: { include: { addon: true } },
        payment: true,
        employee: true,
        customer: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "داواکاری نەدۆزرایەوە" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order GET error:", error);
    return NextResponse.json({ error: "هەڵە لە وەرگرتنی داواکاری" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, status, employeeId } = body;

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
    console.error("Order PATCH error:", error);
    return NextResponse.json({ error: "هەڵە لە نوێکردنەوەی داواکاری" }, { status: 500 });
  }
}
