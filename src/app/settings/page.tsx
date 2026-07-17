"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Settings, Users, Package, Clock } from "lucide-react";
import { api } from "@/lib/api-client";

interface SettingsData {
  settings: Record<string, string>;
  employees: { id: string; name: string; role: string; phone?: string }[];
  inventory: { id: string; nameKu: string; quantity: number; unit: string; minQuantity: number }[];
  membershipPlans: { id: string; nameKu: string; washesCount: number; price: number; validityDays: number }[];
}

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.settings()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageLayout title="ڕێکخستن" subtitle="بارکردن...">
        <div className="card h-40 animate-pulse bg-gray-100" />
      </PageLayout>
    );
  }

  const s = data?.settings ?? {};

  return (
    <PageLayout title="ڕێکخستن" subtitle="زانیاری و ڕێکخستنی دوکان">
      <div className="card mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
            <Settings size={20} />
          </div>
          <div>
            <p className="font-bold text-gray-900">{s.shop_name ?? "غەسلی هەولێر"}</p>
            <p className="text-xs text-gray-500">{s.shop_name_en}</p>
          </div>
        </div>
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">ناونیشان</span>
            <span className="font-medium">{s.address}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">تەلەفۆن</span>
            <span className="font-medium" dir="ltr">{s.phone}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">کاتەکانی کار</span>
            <span className="font-medium">{s.opening_time} - {s.closing_time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">دراو</span>
            <span className="font-medium">{s.currency}</span>
          </div>
        </div>
      </div>

      {data?.employees && data.employees.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-900">
            <Users size={18} /> کارمەندەکان
          </h3>
          <div className="flex flex-col gap-2">
            {data.employees.map((emp) => (
              <div key={emp.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-medium">{emp.name}</p>
                  <p className="text-xs text-gray-400">{emp.role}</p>
                </div>
                {emp.phone && <p className="text-xs text-gray-500" dir="ltr">{emp.phone}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {data?.membershipPlans && data.membershipPlans.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-900">
            <Clock size={18} /> پلانی ئەندامێتی
          </h3>
          {data.membershipPlans.map((plan) => (
            <div key={plan.id} className="card">
              <p className="font-medium">{plan.nameKu}</p>
              <p className="text-xs text-gray-500">
                {plan.washesCount} غەسڵ / {plan.validityDays} ڕۆژ
              </p>
              <p className="mt-1 font-bold text-brand-700">
                {new Intl.NumberFormat("ar-IQ").format(plan.price)} د.ع
              </p>
            </div>
          ))}
        </div>
      )}

      {data?.inventory && data.inventory.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-900">
            <Package size={18} /> کۆگا
          </h3>
          <div className="flex flex-col gap-2">
            {data.inventory.map((item) => {
              const low = item.quantity <= item.minQuantity;
              return (
                <div key={item.id} className={`card ${low ? "border-red-200 bg-red-50" : ""}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{item.nameKu}</p>
                    <p className={`text-sm font-bold ${low ? "text-red-600" : "text-gray-900"}`}>
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                  {low && (
                    <p className="mt-1 text-[10px] text-red-500">⚠️ کەمبووەتەوە!</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PageLayout>
  );
}
