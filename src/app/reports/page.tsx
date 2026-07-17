"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { StatCard } from "@/components/StatCard";
import { formatIQD, VEHICLE_LABELS } from "@/lib/utils";
import { DollarSign, ShoppingBag, CreditCard, Banknote } from "lucide-react";
import type { VehicleType } from "@prisma/client";

interface ReportData {
  period: string;
  totalOrders: number;
  totalRevenue: number;
  cashRevenue: number;
  cardRevenue: number;
  avgOrderValue: number;
  serviceBreakdown: Record<string, { count: number; revenue: number }>;
  vehicleBreakdown: Record<string, number>;
}

export default function ReportsPage() {
  const [period, setPeriod] = useState("today");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports?period=${period}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  const periodLabels: Record<string, string> = {
    today: "ئەمڕۆ",
    week: "هەفتە",
    month: "مانگ",
  };

  return (
    <PageLayout title="ڕاپۆرت" subtitle="ئامار و داهات">
      <div className="mb-4 flex gap-2">
        {["today", "week", "month"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              period === p ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card h-24 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard
              title="کۆی داواکاری"
              value={data?.totalOrders ?? 0}
              icon={<ShoppingBag size={16} />}
            />
            <StatCard
              title="کۆی داهات"
              value={formatIQD(data?.totalRevenue ?? 0)}
              icon={<DollarSign size={16} />}
              color="bg-green-50 text-green-600"
            />
            <StatCard
              title="کاش"
              value={formatIQD(data?.cashRevenue ?? 0)}
              icon={<Banknote size={16} />}
            />
            <StatCard
              title="کارت"
              value={formatIQD(data?.cardRevenue ?? 0)}
              icon={<CreditCard size={16} />}
            />
          </div>

          <div className="mt-4 card">
            <p className="text-sm text-gray-500">تێکڕای داواکاری</p>
            <p className="text-xl font-bold text-gray-900">
              {formatIQD(data?.avgOrderValue ?? 0)}
            </p>
          </div>

          {data?.serviceBreakdown && Object.keys(data.serviceBreakdown).length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 font-bold text-gray-900">خزمەتگوزارییەکان</h3>
              <div className="flex flex-col gap-2">
                {Object.entries(data.serviceBreakdown)
                  .sort(([, a], [, b]) => b.revenue - a.revenue)
                  .map(([name, stats]) => (
                    <div key={name} className="card flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{name}</p>
                        <p className="text-xs text-gray-400">{stats.count} جار</p>
                      </div>
                      <p className="font-bold text-brand-700">{formatIQD(stats.revenue)}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {data?.vehicleBreakdown && Object.keys(data.vehicleBreakdown).length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 font-bold text-gray-900">جۆری سەیارە</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(data.vehicleBreakdown).map(([type, count]) => (
                  <div key={type} className="card text-center">
                    <p className="text-sm font-medium">
                      {VEHICLE_LABELS[type as VehicleType] ?? type}
                    </p>
                    <p className="text-lg font-bold text-brand-700">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}
