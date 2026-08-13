import Link from "next/link";
import { ensureSchema } from "@/lib/db-bootstrap";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatQty, toNumber } from "@/lib/money";
import { deleteProduct, saveProduct } from "@/app/actions/business";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  await ensureSchema();
  const [products, categories, settings] = await Promise.all([
    prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.companySettings.findUnique({ where: { id: "default" } }),
  ]);
  const currency = settings?.currencyLabel ?? "دینار";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">کاڵاکان</h1>
        <p className="mt-1 text-ink-soft">بەڕێوەبردنی کەلوپەل و نرخی فرۆشتن / کڕین</p>
      </div>

      <form action={saveProduct} className="panel grid gap-3 p-5 md:grid-cols-3 lg:grid-cols-4">
        <input name="sku" className="input" placeholder="کۆد (SKU)" required />
        <input name="name" className="input" placeholder="ناوی کاڵا" required />
        <select name="categoryId" className="input">
          <option value="">بێ پۆل</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input name="unit" className="input" placeholder="یەکە" defaultValue="دانە" />
        <input name="costPrice" type="number" className="input" placeholder="نرخی کڕین" required />
        <input name="sellPrice" type="number" className="input" placeholder="نرخی فرۆشتن" required />
        <input name="quantity" type="number" className="input" placeholder="بڕی سەرەتایی" defaultValue={0} />
        <input name="minQuantity" type="number" className="input" placeholder="کەمترین بڕ" defaultValue={0} />
        <input name="description" className="input md:col-span-2" placeholder="وەسف" />
        <button type="submit" className="btn-primary md:col-span-2 lg:col-span-2">
          زیادکردنی کاڵا
        </button>
      </form>

      <div className="panel table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>کۆد</th>
              <th>ناو</th>
              <th>پۆل</th>
              <th>کۆگا</th>
              <th>کڕین</th>
              <th>فرۆشتن</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="text-ink-muted">
                  هیچ کاڵایەک نییە — یەکەم کاڵا زیاد بکە
                </td>
              </tr>
            )}
            {products.map((p) => {
              const low = toNumber(p.quantity) <= toNumber(p.minQuantity);
              return (
                <tr key={p.id}>
                  <td className="font-medium">{p.sku}</td>
                  <td>
                    {p.name}
                    <div className="text-xs text-ink-muted">{p.unit}</div>
                  </td>
                  <td>{p.category?.name ?? "—"}</td>
                  <td>
                    <span className={low ? "badge-danger" : "badge-ok"}>{formatQty(p.quantity)}</span>
                  </td>
                  <td>{formatMoney(p.costPrice, currency)}</td>
                  <td>{formatMoney(p.sellPrice, currency)}</td>
                  <td>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="text-sm text-[var(--rose)]">
                        سڕینەوە
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Link href="/categories" className="text-sm text-teal-700">
        بەڕێوەبردنی پۆلەکان ←
      </Link>
    </div>
  );
}
