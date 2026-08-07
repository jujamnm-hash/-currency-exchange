import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const workInclude = {
  employee: {
    include: {
      markets: true,
      department: true,
      position: true,
    },
  },
  market: true,
} as const;

function parseDate(value: string) {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return { date: new Date(Date.UTC(y, m - 1, d)), year: y, month: m, iso: value.slice(0, 10) };
}

function enrich(work: {
  id: string;
  employeeId: string;
  marketId: string | null;
  date: Date;
  title: string;
  description: string | null;
  hours: number;
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
  market: { id: string; name: string } | null;
}) {
  return {
    ...work,
    date: work.date.toISOString().slice(0, 10),
    employee: {
      ...work.employee,
      marketIds: work.employee.markets.map((m) => m.id),
      marketNames: work.employee.markets.map((m) => m.name).join(" · "),
      market: work.employee.markets[0] ?? null,
    },
  };
}

export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get("date") || undefined;
    const employeeId = req.nextUrl.searchParams.get("employeeId") || undefined;
    const year = req.nextUrl.searchParams.get("year");
    const month = req.nextUrl.searchParams.get("month");

    const works = await prisma.dailyWork.findMany({
      where: {
        ...(date ? { date: parseDate(date).date } : {}),
        ...(employeeId ? { employeeId } : {}),
        ...(year ? { year: Number(year) } : {}),
        ...(month ? { month: Number(month) } : {}),
      },
      include: workInclude,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(works.map(enrich));
  } catch {
    return NextResponse.json({ error: "database unavailable" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, year, month } = parseDate(body.date);
    const work = await prisma.dailyWork.create({
      data: {
        employeeId: body.employeeId,
        marketId: body.marketId || null,
        date,
        title: String(body.title || "").trim(),
        description: body.description || null,
        hours: Number(body.hours) || 0,
        year,
        month,
      },
      include: workInclude,
    });
    return NextResponse.json(enrich(work));
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...rest } = body;
    const current = await prisma.dailyWork.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "not found" }, { status: 404 });

    const parsed = rest.date
      ? parseDate(rest.date)
      : { date: current.date, year: current.year, month: current.month };

    const work = await prisma.dailyWork.update({
      where: { id },
      data: {
        employeeId: rest.employeeId ?? current.employeeId,
        marketId: rest.marketId !== undefined ? rest.marketId || null : current.marketId,
        date: parsed.date,
        title: rest.title !== undefined ? String(rest.title).trim() : current.title,
        description: rest.description !== undefined ? rest.description : current.description,
        hours: rest.hours !== undefined ? Number(rest.hours) || 0 : current.hours,
        year: parsed.year,
        month: parsed.month,
      },
      include: workInclude,
    });
    return NextResponse.json(enrich(work));
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.dailyWork.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
