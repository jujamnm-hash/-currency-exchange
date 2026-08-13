import { ensureSchema } from "@/lib/db-bootstrap";
import { prisma } from "@/lib/prisma";
import { formatDateKu, formatMoney } from "@/lib/money";
import { createExpense } from "@/app/actions/business";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  await ensureSchema();
  const [expenses, accounts, settings] = await Promise.all([
    prisma.expense.findMany({
      orderBy: { date: "desc" },
      include: { account: true, party: true },
      take: 100,
    }),
    prisma.account.findMany({ where: { type: "EXPENSE" }, orderBy: { code: "asc" } }),
    prisma.companySettings.findUnique({ where: { id: "default" } }),
  ]);
  const currency = settings?.currencyLabel ?? "دینار";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">خەرجییەکان</h1>
        <p className="mt-1 text-ink-soft">تۆمارکردنی خەرجی ڕۆژانە و مانگانە</p>
      </div>

      <form action={createExpense} className="panel grid gap-3 p-5 md:grid-cols-3">
        <select name="accountId" className="input" required>
          <option value="">حیسابی خەرجی</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.code} — {a.name}
            </option>
          ))}
        </select>
        <input name="amount" type="number" className="input" placeholder="بڕ" required />
        <input
          name="date"
          type="date"
          className="input"
          defaultValue={new Date().toISOString().slice(0, 10)}
        />
        <input name="description" className="input md:col-span-2" placeholder="وەسف" />
        <button type="submit" className="btn-primary">
          تۆمارکردن
        </button>
      </form>

      <div className="panel table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ژمارە</th>
              <th>بەروار</th>
              <th>حیساب</th>
              <th>وەسف</th>
              <th>بڕ</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id}>
                <td className="font-medium">{e.number}</td>
                <td>{formatDateKu(e.date)}</td>
                <td>
                  {e.account.code} — {e.account.name}
                </td>
                <td>{e.description || "—"}</td>
                <td>{formatMoney(e.amount, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
