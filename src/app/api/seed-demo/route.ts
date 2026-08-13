import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/db-bootstrap";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** داتای نموونە — تەنها ئەگەر سیستەم بەتاڵ بێت */
export async function POST() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ ok: false, error: "DATABASE_URL نییە" }, { status: 500 });
    }
    await ensureSchema();

    const productCount = await prisma.product.count();
    if (productCount > 0) {
      return NextResponse.json({ ok: true, skipped: true, message: "پێشتر داتا هەیە" });
    }

    const catFood = await prisma.category.create({ data: { name: "خۆراک" } });
    const catElec = await prisma.category.create({ data: { name: "ئامێر" } });

    await prisma.product.createMany({
      data: [
        {
          sku: "RICE-25",
          name: "برنج ٢٥ کیلۆیی",
          unit: "کیلۆ",
          costPrice: 1800,
          sellPrice: 2200,
          quantity: 100,
          minQuantity: 20,
          categoryId: catFood.id,
        },
        {
          sku: "OIL-1L",
          name: "ڕۆنی خۆراک ١ لیتر",
          unit: "دانە",
          costPrice: 2500,
          sellPrice: 3200,
          quantity: 80,
          minQuantity: 15,
          categoryId: catFood.id,
        },
        {
          sku: "PHONE-CHG",
          name: "شارژەری مۆبایل",
          unit: "دانە",
          costPrice: 5000,
          sellPrice: 7500,
          quantity: 40,
          minQuantity: 5,
          categoryId: catElec.id,
        },
      ],
    });

    await prisma.party.createMany({
      data: [
        { type: "CUSTOMER", name: "ئەحمەد محەمەد", phone: "07501234567" },
        { type: "CUSTOMER", name: "دوکانی ناز", phone: "07701234567" },
        { type: "SUPPLIER", name: "کۆمپانیای هەولێر بۆ کاڵا", phone: "07509876543" },
      ],
    });

    await prisma.companySettings.update({
      where: { id: "default" },
      data: {
        name: "بازاڕی هەژمار",
        phone: "07500000000",
        address: "هەولێر",
        currency: "IQD",
        currencyLabel: "دینار",
      },
    });

    const [products, parties, accounts] = await Promise.all([
      prisma.product.count(),
      prisma.party.count(),
      prisma.account.count(),
    ]);

    return NextResponse.json({ ok: true, products, parties, accounts });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "هەڵە" },
      { status: 500 },
    );
  }
}
