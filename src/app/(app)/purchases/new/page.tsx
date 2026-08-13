import Link from "next/link";
import { ensureSchema } from "@/lib/db-bootstrap";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/money";
import { createPurchase } from "@/app/actions/business";
import { DocumentForm } from "@/components/DocumentForm";

export const dynamic = "force-dynamic";

export default async function NewPurchasePage() {
  await ensureSchema();
  const [products, parties] = await Promise.all([
    prisma.product.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.party.findMany({
      where: { OR: [{ type: "SUPPLIER" }, { type: "BOTH" }] },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">کڕینی نوێ</h1>
          <p className="mt-1 text-ink-soft">کڕین تۆمار بکە و کۆگا زیاد دەبێت</p>
        </div>
        <Link href="/purchases" className="btn-ghost">
          گەڕانەوە
        </Link>
      </div>

      <DocumentForm
        mode="purchase"
        action={createPurchase}
        parties={parties.map((p) => ({ id: p.id, name: p.name }))}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          sellPrice: toNumber(p.sellPrice),
          costPrice: toNumber(p.costPrice),
          quantity: toNumber(p.quantity),
        }))}
      />
    </div>
  );
}
