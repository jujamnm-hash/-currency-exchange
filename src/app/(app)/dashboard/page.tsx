import Link from "next/link";
import { ensureSchema } from "@/lib/db-bootstrap";
import { prisma } from "@/lib/prisma";
import { formatMoney, toNumber } from "@/lib/money";
import { AlertTriangle, Package, ShoppingCart, TrendingUp, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await ensureSchema();
  const settings = await prisma.companySettings.findUnique({ where: { id: "default" } });
  const currency = settings?.currencyLabel ?? "دینار";

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [salesToday, purchasesMonth, lowStock, productCount, recentSales, cash] = await Promise.all([
    prisma.sale.aggregate({
      _sum: { total: true },
      _count: true,
      where: { date: { gte: startOfDay }, status: "COMPLETED" },
    }),
    prisma.purchase.aggregate({
      _sum: { total: true },
      where: {
        date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        status: "COMPLETED",
      },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { quantity: "asc" },
      take: 50,
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.sale.findMany({
      take: 6,
      orderBy: { date: "desc" },
      include: { party: true },
    }),
    prisma.account.findUnique({ where: { code: "1000" } }),
  ]);

  const low = lowStock.filter((p) => toNumber(p.quantity) <= toNumber(p.minQuantity));
  const inventoryValue = lowStock.reduce(
    (s, p) => s + toNumber(p.quantity) * toNumber(p.costPrice),
    0,
  );

  const stats = [
    {
      label: "فرۆشتنی ئەمڕۆ",
      value: formatMoney(salesToday._sum.total ?? 0, currency),
      hint: `${salesToday._count} پسوڵە`,
      icon: ShoppingCart,
    },
    {
      label: "کڕینی ئەم مانگە",
      value: formatMoney(purchasesMonth._sum.total ?? 0, currency),
      hint: "کڕینەکان",
      icon: TrendingUp,
    },
    {
      label: "نەقدی سندوق",
      value: formatMoney(cash?.balance ?? 0, currency),
      hint: "حیسابی ١٠٠٠",
      icon: Wallet,
    },
    {
      label: "بەهای کۆگا",
      value: formatMoney(inventoryValue, currency),
      hint: `${productCount} کاڵا`,
      icon: Package,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <p className="text-sm text-ink-muted">{settings?.name ?? "کۆمپانیاکەم"}</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-ink">سەرەکی</h1>
        <p className="mt-1 text-ink-soft">تێڕوانینێکی خێرا بۆ دۆخی کاروبار</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="panel animate-fade-up p-5"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between">
                <p className="text-sm text-ink-muted">{s.label}</p>
                <span className="rounded-xl bg-teal-50 p-2 text-teal-700">
                  <Icon size={18} />
                </span>
              </div>
              <p className="mt-3 font-display text-2xl font-bold">{s.value}</p>
              <p className="mt-1 text-xs text-ink-muted">{s.hint}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/sales/new" className="btn-primary">
          فرۆشتنی نوێ
        </Link>
        <Link href="/purchases/new" className="btn-ghost">
          کڕینی نوێ
        </Link>
        <Link href="/products" className="btn-ghost">
          کاڵاکان
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">دوایین فرۆشتنەکان</h2>
            <Link href="/sales" className="text-sm text-teal-700">
              هەموو
            </Link>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ژمارە</th>
                  <th>کڕیار</th>
                  <th>کۆی گشتی</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-ink-muted">
                      هێشتا فرۆشتن نییە
                    </td>
                  </tr>
                )}
                {recentSales.map((s) => (
                  <tr key={s.id}>
                    <td className="font-medium">{s.number}</td>
                    <td>{s.party?.name ?? "کڕیاری ڕاستەوخۆ"}</td>
                    <td>{formatMoney(s.total, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="text-[var(--amber)]" size={18} />
            <h2 className="font-display text-xl font-bold">ئاگاداری کۆگا</h2>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>کاڵا</th>
                  <th>بڕ</th>
                  <th>کەمترین</th>
                </tr>
              </thead>
              <tbody>
                {low.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-ink-muted">
                      هیچ کاڵایەک لەژێر ئاستی کەم نییە
                    </td>
                  </tr>
                )}
                {low.slice(0, 8).map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>
                      <span className="badge-danger">{toNumber(p.quantity)}</span>
                    </td>
                    <td>{toNumber(p.minQuantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
