import { ensureSchema } from "@/lib/db-bootstrap";
import { prisma } from "@/lib/prisma";
import { ACCOUNT_TYPE_LABEL, type AccountType } from "@/lib/accounts";
import { formatMoney, toNumber } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  await ensureSchema();
  const [accounts, settings, journals] = await Promise.all([
    prisma.account.findMany({ orderBy: { code: "asc" } }),
    prisma.companySettings.findUnique({ where: { id: "default" } }),
    prisma.journalEntry.findMany({
      take: 20,
      orderBy: { date: "desc" },
      include: { lines: { include: { account: true } } },
    }),
  ]);
  const currency = settings?.currencyLabel ?? "دینار";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">حیسابات</h1>
        <p className="mt-1 text-ink-soft">لیستی حیسابات و دوایین تۆمارە ژمێریارییەکان</p>
      </div>

      <div className="panel table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>کۆد</th>
              <th>ناو</th>
              <th>جۆر</th>
              <th>باڵانس</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id}>
                <td className="font-medium">{a.code}</td>
                <td>{a.name}</td>
                <td>{ACCOUNT_TYPE_LABEL[a.type as AccountType] ?? a.type}</td>
                <td>{formatMoney(a.balance, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="panel p-5">
        <h2 className="mb-4 font-display text-xl font-bold">دوایین تۆمارەکان (Journal)</h2>
        <div className="space-y-4">
          {journals.length === 0 && <p className="text-ink-muted">هێشتا تۆمار نییە</p>}
          {journals.map((j) => (
            <div key={j.id} className="rounded-xl border border-[var(--line)] p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-medium">
                  {j.number} — {j.description}
                </p>
                <p className="text-sm text-ink-muted">{j.date.toISOString().slice(0, 10)}</p>
              </div>
              <ul className="mt-2 space-y-1 text-sm">
                {j.lines.map((l) => (
                  <li key={l.id} className="flex justify-between gap-4">
                    <span>
                      {l.account.code} {l.account.name}
                    </span>
                    <span>
                      {toNumber(l.debit) > 0
                        ? `قەرز ${formatMoney(l.debit, currency)}`
                        : `کریدیت ${formatMoney(l.credit, currency)}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
