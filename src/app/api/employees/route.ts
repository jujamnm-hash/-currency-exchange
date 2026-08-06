import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search") || undefined;
    const employees = await prisma.employee.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
              { employeeCode: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: {
        market: true,
        department: true,
        position: true,
        manager: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(employees);
  } catch {
    return NextResponse.json({ error: "database unavailable" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const employee = await prisma.employee.create({
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email,
        employeeCode: body.employeeCode,
        marketId: body.marketId || null,
        departmentId: body.departmentId || null,
        positionId: body.positionId || null,
        managerId: body.managerId || null,
        notes: body.notes,
      },
      include: {
        market: true,
        department: true,
        position: true,
        manager: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(employee);
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const employee = await prisma.employee.update({
      where: { id },
      data,
      include: {
        market: true,
        department: true,
        position: true,
        manager: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(employee);
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.employee.updateMany({ where: { managerId: id }, data: { managerId: null } });
    await prisma.employee.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
