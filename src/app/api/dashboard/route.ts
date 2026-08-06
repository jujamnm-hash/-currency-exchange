import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [employees, markets, departments, positions, recentEmployees] = await Promise.all([
      prisma.employee.count({ where: { isActive: true } }),
      prisma.market.count({ where: { isActive: true } }),
      prisma.department.count({ where: { isActive: true } }),
      prisma.position.count({ where: { isActive: true } }),
      prisma.employee.findMany({
        where: { isActive: true },
        include: { market: true, department: true, position: true, manager: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

    const marketGroups = await prisma.market.findMany({
      where: { isActive: true },
      include: { _count: { select: { employees: { where: { isActive: true } } } } },
      orderBy: { sortOrder: "asc" },
    });

    const deptGroups = await prisma.department.findMany({
      where: { isActive: true },
      include: { _count: { select: { employees: { where: { isActive: true } } } } },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      totalEmployees: employees,
      totalMarkets: markets,
      totalDepartments: departments,
      totalPositions: positions,
      byMarket: marketGroups.map((m) => ({ id: m.id, name: m.name, count: m._count.employees })),
      byDepartment: deptGroups.map((d) => ({ id: d.id, name: d.name, count: d._count.employees })),
      recentEmployees,
    });
  } catch {
    return NextResponse.json({ error: "database unavailable" }, { status: 503 });
  }
}
