import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type TreeNode = {
  id: string;
  name: string;
  phone?: string | null;
  employeeCode?: string | null;
  market: { id: string; name: string } | null;
  department: { id: string; name: string } | null;
  position: { id: string; name: string; level: number } | null;
  managerId?: string | null;
  children: TreeNode[];
};

export async function GET() {
  try {
    const [employees, departments, markets] = await Promise.all([
      prisma.employee.findMany({
        where: { isActive: true },
        include: { market: true, department: true, position: true },
        orderBy: { name: "asc" },
      }),
      prisma.department.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.market.findMany({ orderBy: { sortOrder: "asc" } }),
    ]);

    const byId = new Map(employees.map((e) => [e.id, e]));
    const roots = employees.filter((e) => !e.managerId || !byId.has(e.managerId));

    function build(node: (typeof employees)[0]): TreeNode {
      return {
        id: node.id,
        name: node.name,
        phone: node.phone,
        employeeCode: node.employeeCode,
        market: node.market,
        department: node.department,
        position: node.position,
        managerId: node.managerId,
        children: employees.filter((e) => e.managerId === node.id).map(build),
      };
    }

    return NextResponse.json({
      tree: roots.map(build),
      departments,
      markets,
    });
  } catch {
    return NextResponse.json({ error: "database unavailable" }, { status: 503 });
  }
}
