import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const leaveInclude = {
  employee: {
    include: {
      markets: true,
      department: true,
      position: true,
    },
  },
} as const;

function parseLeaveDate(value: string) {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return { date: new Date(Date.UTC(y, m - 1, d)), year: y, month: m };
}

function enrichLeave(leave: {
  id: string;
  employeeId: string;
  kind: "DAY" | "HOUR";
  date: Date;
  days: number;
  hours: number;
  reason: string | null;
  year: number;
  month: number;
  createdAt: Date;
  updatedAt: Date;
  employee: {
    id: string;
    name: string;
    markets: { id: string; name: string }[];
    department: { id: string; name: string } | null;
    position: { id: string; name: string } | null;
  };
}) {
  return {
    ...leave,
    date: leave.date.toISOString().slice(0, 10),
    employee: {
      ...leave.employee,
      marketIds: leave.employee.markets.map((m) => m.id),
      marketNames: leave.employee.markets.map((m) => m.name).join(" · "),
      market: leave.employee.markets[0] ?? null,
    },
  };
}

export async function GET(req: NextRequest) {
  try {
    const year = req.nextUrl.searchParams.get("year");
    const month = req.nextUrl.searchParams.get("month");
    const employeeId = req.nextUrl.searchParams.get("employeeId") || undefined;
    const report = req.nextUrl.searchParams.get("report") === "1";

    if (report) {
      const y = Number(year) || new Date().getFullYear();
      const m = Number(month) || new Date().getMonth() + 1;
      const leaves = await prisma.leaveRecord.findMany({
        where: { year: y, month: m },
        include: leaveInclude,
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      });

      const employees = await prisma.employee.findMany({
        where: { isActive: true },
        include: { markets: true, department: true, position: true },
        orderBy: { name: "asc" },
      });

      const byEmployee = employees
        .map((e) => {
          const rows = leaves.filter((l) => l.employeeId === e.id);
          return {
            employee: {
              ...e,
              marketIds: e.markets.map((m) => m.id),
              marketNames: e.markets.map((m) => m.name).join(" · "),
              market: e.markets[0] ?? null,
            },
            totalDays: rows.reduce((s, l) => s + (l.days || 0), 0),
            totalHours: rows.reduce((s, l) => s + (l.hours || 0), 0),
            dayCount: rows.filter((l) => l.kind === "DAY").length,
            hourCount: rows.filter((l) => l.kind === "HOUR").length,
            records: rows.length,
          };
        })
        .filter((r) => r.records > 0)
        .sort((a, b) => b.totalDays - a.totalDays || b.totalHours - a.totalHours);

      return NextResponse.json({
        year: y,
        month: m,
        totalDays: leaves.reduce((s, l) => s + (l.days || 0), 0),
        totalHours: leaves.reduce((s, l) => s + (l.hours || 0), 0),
        totalRecords: leaves.length,
        employeesWithLeave: byEmployee.length,
        byEmployee,
        leaves: leaves.map(enrichLeave),
      });
    }

    const leaves = await prisma.leaveRecord.findMany({
      where: {
        ...(year ? { year: Number(year) } : {}),
        ...(month ? { month: Number(month) } : {}),
        ...(employeeId ? { employeeId } : {}),
      },
      include: leaveInclude,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(leaves.map(enrichLeave));
  } catch {
    return NextResponse.json({ error: "database unavailable" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, year, month } = parseLeaveDate(body.date);
    const kind = body.kind === "HOUR" ? "HOUR" : "DAY";
    const leave = await prisma.leaveRecord.create({
      data: {
        employeeId: body.employeeId,
        kind,
        date,
        days: kind === "DAY" ? Number(body.days) || 0 : 0,
        hours: kind === "HOUR" ? Number(body.hours) || 0 : 0,
        reason: body.reason || null,
        year,
        month,
      },
      include: leaveInclude,
    });
    return NextResponse.json(enrichLeave(leave));
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...rest } = body;
    const current = await prisma.leaveRecord.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "not found" }, { status: 404 });

    const kind = rest.kind === "HOUR" || rest.kind === "DAY" ? rest.kind : current.kind;
    const parsed = rest.date
      ? parseLeaveDate(rest.date)
      : { date: current.date, year: current.year, month: current.month };
    const leave = await prisma.leaveRecord.update({
      where: { id },
      data: {
        employeeId: rest.employeeId ?? current.employeeId,
        kind,
        date: parsed.date,
        days: kind === "DAY" ? Number(rest.days ?? current.days) || 0 : 0,
        hours: kind === "HOUR" ? Number(rest.hours ?? current.hours) || 0 : 0,
        reason: rest.reason !== undefined ? rest.reason : current.reason,
        year: parsed.year,
        month: parsed.month,
      },
      include: leaveInclude,
    });
    return NextResponse.json(enrichLeave(leave));
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.leaveRecord.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
