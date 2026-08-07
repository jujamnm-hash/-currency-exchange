import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const markets = await prisma.market.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json(markets);
  } catch {
    return NextResponse.json({ error: "database unavailable" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const market = await prisma.market.create({
      data: {
        name: body.name,
        code: body.code,
        location: body.location,
        description: body.description,
      },
    });
    return NextResponse.json(market);
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const market = await prisma.market.update({ where: { id }, data });
    return NextResponse.json(market);
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    // many-to-many disconnect happens automatically on market delete in Prisma
    await prisma.market.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
