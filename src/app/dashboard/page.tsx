"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { StatCard } from "@/components/StatCard";
import { OrderCard } from "@/components/OrderCard";
import { formatIQD } from "@/lib/utils";
import { Car, Users, Clock, DollarSign, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api-client";

interface DashboardData {
  todayOrders: number;
  activeQueue: number;
  todayRevenue: number;
  totalCustomers: number;
  todayAppointments: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    plateNumber: string;
    vehicleType: string;
    customerName?: string | null;
    status: string;
    total: number;
    queuePosition?: number | null;
    createdAt: string;
    items?: { service: { nameKu: string } }[];
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageLayout title="داشبۆرد" subtitle="بارکردن...">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card h-24 animate-pulse bg-gray-100" />
          ))}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="داشبۆرد"
      subtitle="بەخێربێیت بۆ غەسلی هەولێر"
      action={
        <Link href="/new-order" className="btn-primary hidden md:inline-flex">
          + داواکاری نوێ
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-3">
        <StatCard
          title="داواکاری ئەمڕۆ"
          value={data?.todayOrders ?? 0}
          icon={<Car size={16} />}
        />
        <StatCard
          title="لە ڕیزدا"
          value={data?.activeQueue ?? 0}
          icon={<Clock size={16} />}
          color="bg-yellow-50 text-yellow-600"
        />
        <StatCard
          title="داهاتی ئەمڕۆ"
          value={formatIQD(data?.todayRevenue ?? 0)}
          icon={<DollarSign size={16} />}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          title="کڕیارەکان"
          value={data?.totalCustomers ?? 0}
          icon={<Users size={16} />}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="کاتەکانی ئەمڕۆ"
          value={data?.todayAppointments ?? 0}
          icon={<Calendar size={16} />}
          color="bg-cyan-50 text-cyan-600"
        />
        <StatCard
          title="کارایی"
          value="١٠٠٪"
          subtitle="سیستەم چالاکە"
          icon={<TrendingUp size={16} />}
          color="bg-brand-50 text-brand-600"
        />
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">دوایین داواکارییەکان</h3>
          <Link href="/queue" className="text-sm text-brand-600">
            بینینی هەموو
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {data?.recentOrders?.length === 0 && (
            <div className="card text-center text-gray-500">
              <p>هیچ داواکارییەک نییە</p>
              <Link href="/new-order" className="btn-primary mt-3 inline-flex">
                داواکاری نوێ زیاد بکە
              </Link>
            </div>
          )}
          {data?.recentOrders?.map((order) => (
            <OrderCard key={order.id} order={order} showActions={false} />
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Link href="/new-order" className="card flex flex-col items-center gap-2 py-6 text-center transition hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <Car size={24} />
          </div>
          <span className="text-sm font-medium">داواکاری نوێ</span>
        </Link>
        <Link href="/queue" className="card flex flex-col items-center gap-2 py-6 text-center transition hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
            <Clock size={24} />
          </div>
          <span className="text-sm font-medium">ڕیزی چاوەڕوانی</span>
        </Link>
        <Link href="/appointments" className="card flex flex-col items-center gap-2 py-6 text-center transition hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-cyan-600">
            <Calendar size={24} />
          </div>
          <span className="text-sm font-medium">کات دابنێ</span>
        </Link>
        <Link href="/reports" className="card flex flex-col items-center gap-2 py-6 text-center transition hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
            <TrendingUp size={24} />
          </div>
          <span className="text-sm font-medium">ڕاپۆرت</span>
        </Link>
      </div>
    </PageLayout>
  );
}
