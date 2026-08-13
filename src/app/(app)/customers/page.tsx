import { ensureSchema } from "@/lib/db-bootstrap";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { deleteParty, saveParty } from "@/app/actions/business";

export const dynamic = "force-dynamic";

async function PartiesPage({
  type,
  title,
  hint,
}: {
  type: "CUSTOMER" | "SUPPLIER";
  title: string;
  hint: string;
}) {
  await ensureSchema();
  const [parties, settings] = await Promise.all([
    prisma.party.findMany({
      where: { OR: [{ type }, { type: "BOTH" }] },
      orderBy: { name: "asc" },
    }),
    prisma.companySettings.findUnique({ where: { id: "default" } }),
  ]);
  const currency = settings?.currencyLabel ?? "دینار";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        <p className="mt-1 text-ink-soft">{hint}</p>
      </div>

      <form action={saveParty} className="panel grid gap-3 p-5 md:grid-cols-3">
        <input type="hidden" name="type" value={type} />
        <input name="name" className="input" placeholder="ناو" required />
        <input name="phone" className="input" placeholder="مۆبایل" />
        <input name="email" className="input" placeholder="ئیمەیڵ" />
        <input name="address" className="input md:col-span-2" placeholder="ناونیشان" />
        <button type="submit" className="btn-primary">
          زیادکردن
        </button>
      </form>

      <div className="panel table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ناو</th>
              <th>مۆبایل</th>
              <th>باڵانس</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {parties.map((p) => (
              <tr key={p.id}>
                <td className="font-medium">{p.name}</td>
                <td>{p.phone || "—"}</td>
                <td>{formatMoney(p.balance, currency)}</td>
                <td>
                  <form action={deleteParty}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="text-sm text-[var(--rose)]">
                      سڕینەوە
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function CustomersPage() {
  return PartiesPage({
    type: "CUSTOMER",
    title: "کڕیاران",
    hint: "لیستی کڕیاران و قەرزی ماوە",
  });
}
