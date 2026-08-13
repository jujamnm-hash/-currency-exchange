import Link from "next/link";
import { ensureSchema } from "@/lib/db-bootstrap";
import { prisma } from "@/lib/prisma";
import { formatDateKu, formatMoney, toNumber } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  await ensureSchema();
  const [sales, settings] = await Promise.all([
    prisma.sale.findMany({
      orderBy: { date: "desc" },
      include: { party: true, items: true },
      take: 100,
    }),
    prisma.companySettings.findUnique({ where: { id: "default" } }),
  ]);
  const currency = settings?.currencyLabel ?? "دینار";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">فرۆشتن</h1>
          <p className="mt-1 text-ink-soft">پسوڵە و پسوڵەی فرۆشتن</p>
        </div>
        <Link href="/sales/new" className="btn-primary">
          فرۆشتنی نوێ
        </Link>
      </div>

      <div className="panel table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ژمارە</th>
              <th>بەروار</th>
              <th>کڕیار</th>
              <th>کاڵا</th>
              <th>کۆی گشتی</th>
              <th>پارەدراو</th>
              <th>دۆخ</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 && (
              <tr>
                <td colSpan={7} className="text-ink-muted">
                  هیچ فرۆشتنێک نییە
                </td>
              </tr>
            )}
            {sales.map((s) => {
              const due = toNumber(s.total) - toNumber(s.paidAmount);
              return (
                <tr key={s.id}>
                  <td className="font-medium">{s.number}</td>
                  <td>{formatDateKu(s.date)}</td>
                  <td>{s.party?.name ?? "ڕاستەوخۆ"}</td>
                  <td>{s.items.length}</td>
                  <td>{formatMoney(s.total, currency)}</td>
                  <td>{formatMoney(s.paidAmount, currency)}</td>
                  <td>
                    {due > 0 ? (
                      <span className="badge-warn">قەرزی ماوە</span>
                    ) : (
                      <span className="badge-ok">تەواو</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
