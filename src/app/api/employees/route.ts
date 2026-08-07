import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const employeeInclude = {
  markets: true,
  department: true,
  position: true,
  manager: { select: { id: true, name: true } },
} as const;

function normalizeMarketIds(body: { marketIds?: string[]; marketId?: string | null }) {
  if (Array.isArray(body.marketIds)) return body.marketIds.filter(Boolean);
  if (body.marketId) return [body.marketId];
  return [];
}

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
              { markets: { some: { name: { contains: search, mode: "insensitive" } } } },
            ],
          }
        : undefined,
      include: employeeInclude,
      orderBy: { name: "asc" },
    });
    return NextResponse.json(
      employees.map((e) => ({
        ...e,
        marketIds: e.markets.map((m) => m.id),
        market: e.markets[0] ?? null,
        marketNames: e.markets.map((m) => m.name).join(" · "),
      }))
    );
  } catch {
    return NextResponse.json({ error: "database unavailable" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const marketIds = normalizeMarketIds(body);
    const employee = await prisma.employee.create({
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email,
        employeeCode: body.employeeCode,
        departmentId: body.departmentId || null,
        positionId: body.positionId || null,
        managerId: body.managerId || null,
        notes: body.notes,
        markets: marketIds.length ? { connect: marketIds.map((id) => ({ id })) } : undefined,
      },
      include: employeeInclude,
    });
    return NextResponse.json({
      ...employee,
      marketIds: employee.markets.map((m) => m.id),
      market: employee.markets[0] ?? null,
      marketNames: employee.markets.map((m) => m.name).join(" · "),
    });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, marketIds, marketId, ...rest } = body;
    const hasMarkets = marketIds !== undefined || marketId !== undefined;
    const ids = normalizeMarketIds({ marketIds, marketId });
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...rest,
        ...(hasMarkets ? { markets: { set: ids.map((mid: string) => ({ id: mid })) } } : {}),
      },
      include: employeeInclude,
    });
    return NextResponse.json({
      ...employee,
      marketIds: employee.markets.map((m) => m.id),
      market: employee.markets[0] ?? null,
      marketNames: employee.markets.map((m) => m.name).join(" · "),
    });
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
