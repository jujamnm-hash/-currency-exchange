"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/PageLayout";
import { StatCard } from "@/components/StatCard";
import { api } from "@/lib/api-client";
import { Users, Store, Network, Briefcase } from "lucide-react";

interface DashboardData {
  totalEmployees: number;
  totalMarkets: number;
  totalDepartments: number;
  totalPositions: number;
  byMarket: { id: string; name: string; count: number }[];
  byDepartment: { id: string; name: string; count: number }[];
  recentEmployees: Array<{
    id: string;
    name: string;
    employeeCode?: string | null;
    markets?: { name: string }[];
    market?: { name: string } | null;
    marketNames?: string;
    position?: { name: string } | null;
    department?: { name: string } | null;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageLayout title="داشبۆرد" subtitle="بارکردن...">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card h-24 animate-pulse bg-slate-100" />
          ))}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="داشبۆرد"
      subtitle="پوختەی هەیکەلی ئیداری و کارمەندان"
      action={
        <Link href="/employees" className="btn-primary hidden md:inline-flex">
          + کارمەندی نوێ
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard title="کارمەندان" value={data?.totalEmployees ?? 0} icon={<Users size={16} />} />
        <StatCard
          title="مارکێتەکان"
          value={data?.totalMarkets ?? 0}
          icon={<Store size={16} />}
          color="bg-amber-50 text-amber-700"
        />
        <StatCard
          title="بەشەکان"
          value={data?.totalDepartments ?? 0}
          icon={<Network size={16} />}
          color="bg-sky-50 text-sky-700"
        />
        <StatCard
          title="پۆستەکان"
          value={data?.totalPositions ?? 0}
          icon={<Briefcase size={16} />}
          color="bg-rose-50 text-rose-700"
        />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <section className="card">
          <h3 className="mb-3 font-bold text-slate-800">دابەشکردنی کارمەند بەپێی مارکێت</h3>
          <div className="space-y-2">
            {(data?.byMarket ?? []).map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span className="text-sm text-slate-700">{m.name}</span>
                <span className="rounded-lg bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-800">
                  {m.count}
                </span>
              </div>
            ))}
            {!data?.byMarket?.length && (
              <p className="text-sm text-slate-400">هیچ مارکێتێک نییە</p>
            )}
          </div>
        </section>

        <section className="card">
          <h3 className="mb-3 font-bold text-slate-800">دابەشکردنی کارمەند بەپێی بەش</h3>
          <div className="space-y-2">
            {(data?.byDepartment ?? []).map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span className="text-sm text-slate-700">{d.name}</span>
                <span className="rounded-lg bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-800">
                  {d.count}
                </span>
              </div>
            ))}
            {!data?.byDepartment?.length && (
              <p className="text-sm text-slate-400">هیچ بەشێک نییە</p>
            )}
          </div>
        </section>
      </div>

      <section className="card mt-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">دوایین کارمەندان</h3>
          <Link href="/employees" className="text-sm font-medium text-brand-700">
            هەموو
          </Link>
        </div>
        <div className="space-y-2">
          {(data?.recentEmployees ?? []).map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">
              <div>
                <p className="font-semibold text-slate-800">{e.name}</p>
                <p className="text-xs text-slate-500">
                  {[
                    e.position?.name,
                    e.marketNames || e.markets?.map((m) => m.name).join(" · ") || e.market?.name,
                    e.department?.name,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </p>
              </div>
              {e.employeeCode && (
                <span className="text-xs text-slate-400">{e.employeeCode}</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
