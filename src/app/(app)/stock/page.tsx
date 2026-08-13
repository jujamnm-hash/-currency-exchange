import { ensureSchema } from "@/lib/db-bootstrap";
import { prisma } from "@/lib/prisma";
import { formatDateKu, formatQty, toNumber } from "@/lib/money";
import { adjustStock } from "@/app/actions/business";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  await ensureSchema();
  const [products, moves] = await Promise.all([
    prisma.product.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.stockMovement.findMany({
      take: 40,
      orderBy: { createdAt: "desc" },
      include: { product: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">کۆگا</h1>
        <p className="mt-1 text-ink-soft">جوڵەی کاڵا و ڕێکخستنی بڕ</p>
      </div>

      <form action={adjustStock} className="panel grid gap-3 p-5 md:grid-cols-4">
        <select name="productId" className="input" required>
          <option value="">کاڵا هەڵبژێرە</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — ئێستا: {formatQty(p.quantity)}
            </option>
          ))}
        </select>
        <select name="type" className="input">
          <option value="IN">زیادکردن (چوونەژوورەوە)</option>
          <option value="OUT">کەمکردنەوە (دەرهێنان)</option>
          <option value="ADJUST">دانانی بڕی نوێ</option>
        </select>
        <input name="quantity" type="number" step="any" min={0} className="input" placeholder="بڕ" required />
        <input name="reason" className="input" placeholder="هۆکار" />
        <button type="submit" className="btn-primary md:col-span-4">
          تۆمارکردنی جوڵە
        </button>
      </form>

      <div className="panel table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>بەروار</th>
              <th>کاڵا</th>
              <th>جۆر</th>
              <th>بڕ</th>
              <th>هۆکار</th>
            </tr>
          </thead>
          <tbody>
            {moves.map((m) => (
              <tr key={m.id}>
                <td>{formatDateKu(m.createdAt)}</td>
                <td>{m.product.name}</td>
                <td>
                  {m.type === "IN" ? (
                    <span className="badge-ok">چوونەژوورەوە</span>
                  ) : m.type === "OUT" ? (
                    <span className="badge-danger">دەرهێنان</span>
                  ) : (
                    <span className="badge-warn">ڕێکخستن</span>
                  )}
                </td>
                <td>{formatQty(m.quantity)}</td>
                <td>{m.reason || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>کاڵا</th>
              <th>بڕی ئێستا</th>
              <th>کەمترین</th>
              <th>دۆخ</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const low = toNumber(p.quantity) <= toNumber(p.minQuantity);
              return (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{formatQty(p.quantity)}</td>
                  <td>{formatQty(p.minQuantity)}</td>
                  <td>{low ? <span className="badge-danger">کەمە</span> : <span className="badge-ok">باشە</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
