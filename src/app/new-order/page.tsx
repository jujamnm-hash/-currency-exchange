"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/PageLayout";
import { formatIQD, VEHICLE_LABELS } from "@/lib/utils";
import type { VehicleType } from "@prisma/client";
import { Check } from "lucide-react";
import { api } from "@/lib/api-client";

interface Service {
  id: string;
  nameKu: string;
  basePrice: number;
  duration: number;
  category: string;
}

interface Addon {
  id: string;
  nameKu: string;
  price: number;
}

interface Multiplier {
  vehicleType: VehicleType;
  multiplier: number;
  labelKu: string;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [multipliers, setMultipliers] = useState<Multiplier[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [vehicleType, setVehicleType] = useState<VehicleType>("SEDAN");
  const [plateNumber, setPlateNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.services().then((data) => {
      setServices(data.services ?? []);
      setAddons(data.addons ?? []);
      setMultipliers(data.multipliers ?? []);
    });
  }, []);

  const multiplier = multipliers.find((m) => m.vehicleType === vehicleType)?.multiplier ?? 1;

  const calculateTotal = () => {
    const servicesTotal = services
      .filter((s) => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + s.basePrice * multiplier, 0);
    const addonsTotal = addons
      .filter((a) => selectedAddons.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0);
    return servicesTotal + addonsTotal;
  };

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber || selectedServices.length === 0) {
      alert("ژمارەی ئۆتۆمبێل و لانیکەم یەک خزمەتگوزاری هەڵبژێرە");
      return;
    }

    setSubmitting(true);
    try {
      await api.createOrder({
        plateNumber,
        vehicleType,
        customerName,
        customerPhone,
        serviceIds: selectedServices,
        addonIds: selectedAddons,
        paymentMethod: paymentMethod as "CASH" | "CARD" | "MOBILE_PAYMENT",
        notes,
      });
      router.push("/queue");
    } catch {
      alert("هەڵە لە ناردنی داواکاری");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout title="داواکاری نوێ" subtitle="زیادکردنی سەیارەی نوێ بۆ ڕیز">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="card">
          <h3 className="mb-3 font-bold text-gray-900">زانیاری سەیارە</h3>
          <div className="grid gap-3">
            <div>
              <label className="label">ژمارەی ئۆتۆمبێل *</label>
              <input
                className="input-field"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="بۆ نموونە: 12345 هەولێر"
                required
              />
            </div>
            <div>
              <label className="label">جۆری سەیارە</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(VEHICLE_LABELS) as VehicleType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setVehicleType(type)}
                    className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                      vehicleType === type
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    {VEHICLE_LABELS[type]}
                    {multipliers.find((m) => m.vehicleType === type) && (
                      <span className="block text-[10px] text-gray-400">
                        ×{multipliers.find((m) => m.vehicleType === type)?.multiplier}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">ناوی کڕیار</label>
                <input
                  className="input-field"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="ناو"
                />
              </div>
              <div>
                <label className="label">ژمارەی تەلەفۆن</label>
                <input
                  className="input-field"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="0750..."
                  type="tel"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="mb-3 font-bold text-gray-900">خزمەتگوزارییەکان *</h3>
          <div className="grid gap-2">
            {services.map((service) => {
              const selected = selectedServices.includes(service.id);
              const price = service.basePrice * multiplier;
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggleService(service.id)}
                  className={`flex items-center justify-between rounded-xl border p-3 text-right transition ${
                    selected
                      ? "border-brand-500 bg-brand-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        selected ? "border-brand-500 bg-brand-500 text-white" : "border-gray-300"
                      }`}
                    >
                      {selected && <Check size={12} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{service.nameKu}</p>
                      <p className="text-[10px] text-gray-400">{service.duration} خولەک</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-brand-700">{formatIQD(price)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {addons.length > 0 && (
          <div className="card">
            <h3 className="mb-3 font-bold text-gray-900">زیادەکان</h3>
            <div className="grid grid-cols-2 gap-2">
              {addons.map((addon) => {
                const selected = selectedAddons.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    className={`rounded-xl border p-3 text-center text-sm transition ${
                      selected
                        ? "border-brand-500 bg-brand-50"
                        : "border-gray-200"
                    }`}
                  >
                    <p className="font-medium">{addon.nameKu}</p>
                    <p className="text-xs text-brand-700">{formatIQD(addon.price)}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="card">
          <h3 className="mb-3 font-bold text-gray-900">پارەدان</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "CASH", label: "کاش" },
              { value: "CARD", label: "کارت" },
              { value: "MOBILE_PAYMENT", label: "مۆبایل" },
            ].map((method) => (
              <button
                key={method.value}
                type="button"
                onClick={() => setPaymentMethod(method.value)}
                className={`rounded-xl border py-2 text-sm font-medium transition ${
                  paymentMethod === method.value
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                {method.label}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <label className="label">تێبینی</label>
            <textarea
              className="input-field"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="تێبینی زیادە..."
            />
          </div>
        </div>

        <div className="sticky bottom-20 rounded-2xl bg-brand-600 p-4 text-white shadow-lg md:bottom-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">کۆی گشتی</p>
              <p className="text-2xl font-bold">{formatIQD(calculateTotal())}</p>
            </div>
            <button
              type="submit"
              disabled={submitting || selectedServices.length === 0}
              className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-700 transition active:scale-95 disabled:opacity-50"
            >
              {submitting ? "چاوەڕوانبە..." : "تۆمارکردن"}
            </button>
          </div>
        </div>
      </form>
    </PageLayout>
  );
}
