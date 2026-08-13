import Link from "next/link";
import { ensureSchema } from "@/lib/db-bootstrap";
import { prisma } from "@/lib/prisma";
import { formatDateKu, formatMoney, toNumber } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  await ensureSchema();
  const [rows, settings] = await Promise.all([
    prisma.purchase.findMany({
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
          <h1 className="font-display text-3xl font-bold">کڕین</h1>
          <p className="mt-1 text-ink-soft">کڕینی کاڵا و زیادبوونی کۆگا</p>
        </div>
        <Link href="/purchases/new" className="btn-primary">
          کڕینی نوێ
        </Link>
      </div>

      <div className="panel table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ژمارە</th>
              <th>بەروار</th>
              <th>دابینکەر</th>
              <th>کاڵا</th>
              <th>کۆی گشتی</th>
              <th>پارەدراو</th>
              <th>دۆخ</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="text-ink-muted">
                  هیچ کڕینێک نییە
                </td>
              </tr>
            )}
            {rows.map((s) => {
              const due = toNumber(s.total) - toNumber(s.paidAmount);
              return (
                <tr key={s.id}>
                  <td className="font-medium">{s.number}</td>
                  <td>{formatDateKu(s.date)}</td>
                  <td>{s.party?.name ?? "—"}</td>
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
