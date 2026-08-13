import { ensureSchema } from "@/lib/db-bootstrap";
import { prisma } from "@/lib/prisma";
import { ACCOUNT_TYPE_LABEL, type AccountType } from "@/lib/accounts";
import { formatMoney, formatQty, toNumber } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  await ensureSchema();
  const [accounts, products, sales, purchases, expenses, settings] = await Promise.all([
    prisma.account.findMany({ orderBy: { code: "asc" } }),
    prisma.product.findMany({ where: { isActive: true } }),
    prisma.sale.aggregate({ _sum: { total: true }, where: { status: "COMPLETED" } }),
    prisma.purchase.aggregate({ _sum: { total: true }, where: { status: "COMPLETED" } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.companySettings.findUnique({ where: { id: "default" } }),
  ]);
  const currency = settings?.currencyLabel ?? "دینار";

  // Revenue accounts: credit increases → balance stored as debit-credit, so revenue is negative
  const revenueAmt = accounts
    .filter((a) => a.type === "REVENUE")
    .reduce((s, a) => s + Math.max(0, -toNumber(a.balance)), 0);
  const expenseAmt = accounts
    .filter((a) => a.type === "EXPENSE")
    .reduce((s, a) => s + Math.max(0, toNumber(a.balance)), 0);
  const profit = revenueAmt - expenseAmt;

  const inventoryValue = products.reduce(
    (s, p) => s + toNumber(p.quantity) * toNumber(p.costPrice),
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">ڕاپۆرتەکان</h1>
        <p className="mt-1 text-ink-soft">قازانج و زیان، تاقیکردنەوەی باڵانس، و بەهای کۆگا</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <p className="text-sm text-ink-muted">کۆی فرۆشتن</p>
          <p className="mt-2 font-display text-2xl font-bold">
            {formatMoney(sales._sum.total ?? 0, currency)}
          </p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-ink-muted">کۆی کڕین</p>
          <p className="mt-2 font-display text-2xl font-bold">
            {formatMoney(purchases._sum.total ?? 0, currency)}
          </p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-ink-muted">قازانج / زیان (خەمڵاندن)</p>
          <p className={`mt-2 font-display text-2xl font-bold ${profit >= 0 ? "text-[var(--ok)]" : "text-[var(--rose)]"}`}>
            {formatMoney(profit, currency)}
          </p>
        </div>
      </div>

      <section className="panel p-5">
        <h2 className="mb-4 font-display text-xl font-bold">قازانج و زیان</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between border-b border-[var(--line)] py-2">
            <span>داهات</span>
            <span className="font-medium">{formatMoney(revenueAmt, currency)}</span>
          </div>
          <div className="flex justify-between border-b border-[var(--line)] py-2">
            <span>خەرجی (لە حیسابات)</span>
            <span className="font-medium">{formatMoney(expenseAmt, currency)}</span>
          </div>
          <div className="flex justify-between border-b border-[var(--line)] py-2">
            <span>خەرجی تۆمارکراو</span>
            <span className="font-medium">{formatMoney(expenses._sum.amount ?? 0, currency)}</span>
          </div>
          <div className="flex justify-between py-2 text-base font-bold">
            <span>ئەنجام</span>
            <span>{formatMoney(profit, currency)}</span>
          </div>
        </div>
      </section>

      <section className="panel table-wrap">
        <div className="border-b border-[var(--line)] px-5 py-4">
          <h2 className="font-display text-xl font-bold">تاقیکردنەوەی باڵانس (Trial Balance)</h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>کۆد</th>
              <th>ناو</th>
              <th>جۆر</th>
              <th>قەرز</th>
              <th>کریدیت</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => {
              const bal = toNumber(a.balance);
              const debit = bal > 0 ? bal : 0;
              const credit = bal < 0 ? -bal : 0;
              return (
                <tr key={a.id}>
                  <td>{a.code}</td>
                  <td>{a.name}</td>
                  <td>{ACCOUNT_TYPE_LABEL[a.type as AccountType] ?? a.type}</td>
                  <td>{debit ? formatMoney(debit, currency) : "—"}</td>
                  <td>{credit ? formatMoney(credit, currency) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="panel table-wrap">
        <div className="border-b border-[var(--line)] px-5 py-4">
          <h2 className="font-display text-xl font-bold">
            بەهای کۆگا — {formatMoney(inventoryValue, currency)}
          </h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>کاڵا</th>
              <th>بڕ</th>
              <th>تێچوو</th>
              <th>بەها</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{formatQty(p.quantity)}</td>
                <td>{formatMoney(p.costPrice, currency)}</td>
                <td>{formatMoney(toNumber(p.quantity) * toNumber(p.costPrice), currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
