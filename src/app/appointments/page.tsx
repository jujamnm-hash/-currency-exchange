"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { formatIQD } from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";

interface Appointment {
  id: string;
  scheduledAt: string;
  status: string;
  estimatedTotal: number;
  notes?: string;
  customer: { name: string; phone: string };
  vehicle?: { plateNumber: string };
  items: { service: { nameKu: string }; price: number }[];
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "دیاریکراو",
  CONFIRMED: "پشتڕاستکراو",
  IN_PROGRESS: "لە جێبەجێکردندایە",
  COMPLETED: "تەواوبوو",
  CANCELLED: "هەڵوەشاوە",
  NO_SHOW: "نەهات",
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/appointments")
      .then((r) => r.json())
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageLayout title="کاتەکان" subtitle="بەڕێوەبردنی کاتی پێشوەختە">
      <div className="mb-4 rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
        <p className="font-medium">💡 کڕیارەکان دەتوانن پێشوەختە کات دابنێن</p>
        <p className="mt-1 text-xs opacity-80">بۆ زیادکردنی کات، پەیوەندی بە کڕیار بکە لە بەشی کڕیارەکان</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="card h-24 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-12 text-center text-gray-500">
          <Calendar size={48} className="text-gray-300" />
          <p>هیچ کاتێک دیاری نەکراوە</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {appointments.map((apt) => {
            const date = new Date(apt.scheduledAt);
            return (
              <div key={apt.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{apt.customer.name}</p>
                    <p className="text-xs text-gray-500">{apt.customer.phone}</p>
                    {apt.vehicle && (
                      <p className="mt-1 text-xs text-gray-600">{apt.vehicle.plateNumber}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-600">
                      {apt.items.map((i) => i.service.nameKu).join("، ")}
                    </p>
                  </div>
                  <div className="text-left">
                    <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-800">
                      {STATUS_LABELS[apt.status] ?? apt.status}
                    </span>
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                      <Calendar size={12} />
                      {date.toLocaleDateString("ku-IQ")}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock size={12} />
                      {date.toLocaleTimeString("ku-IQ", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <p className="mt-1 text-sm font-bold text-brand-700">
                      {formatIQD(apt.estimatedTotal)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
