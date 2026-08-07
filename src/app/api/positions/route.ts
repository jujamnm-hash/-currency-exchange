import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const positions = await prisma.position.findMany({
      include: { department: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(positions);
  } catch {
    return NextResponse.json({ error: "database unavailable" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const position = await prisma.position.create({
      data: {
        name: body.name,
        code: body.code,
        description: body.description,
        departmentId: body.departmentId || null,
        level: body.level ?? 1,
      },
      include: { department: true },
    });
    return NextResponse.json(position);
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const position = await prisma.position.update({
      where: { id },
      data,
      include: { department: true },
    });
    return NextResponse.json(position);
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.employee.updateMany({ where: { positionId: id }, data: { positionId: null } });
    await prisma.position.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
