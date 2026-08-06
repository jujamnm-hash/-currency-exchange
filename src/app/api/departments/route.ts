import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json(departments);
  } catch {
    return NextResponse.json({ error: "database unavailable" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const department = await prisma.department.create({
      data: {
        name: body.name,
        code: body.code,
        description: body.description,
        parentId: body.parentId || null,
      },
    });
    return NextResponse.json(department);
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const department = await prisma.department.update({ where: { id }, data });
    return NextResponse.json(department);
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.department.updateMany({ where: { parentId: id }, data: { parentId: null } });
    await prisma.position.updateMany({ where: { departmentId: id }, data: { departmentId: null } });
    await prisma.employee.updateMany({ where: { departmentId: id }, data: { departmentId: null } });
    await prisma.department.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
