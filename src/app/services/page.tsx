"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { formatIQD } from "@/lib/utils";
import { Droplets, Sparkles, Star, Armchair, Gem, Cog } from "lucide-react";

interface Service {
  id: string;
  nameKu: string;
  nameEn: string;
  basePrice: number;
  duration: number;
  category: string;
  icon: string;
}

interface Addon {
  id: string;
  nameKu: string;
  price: number;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  droplets: <Droplets size={20} />,
  sparkles: <Sparkles size={20} />,
  star: <Star size={20} />,
  armchair: <Armchair size={20} />,
  gem: <Gem size={20} />,
  cog: <Cog size={20} />,
};

const CATEGORY_LABELS: Record<string, string> = {
  exterior: "دەرەوە",
  interior: "ناوەوە",
  premium: "پڕیمیەم",
  special: "تایبەت",
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => {
        setServices(data.services ?? []);
        setAddons(data.addons ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const grouped = services.reduce(
    (acc, s) => {
      const cat = s.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(s);
      return acc;
    },
    {} as Record<string, Service[]>
  );

  return (
    <PageLayout title="خزمەتگوزارییەکان" subtitle="لیستی خزمەتگوزاری و نرخەکان">
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-20 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : (
        <>
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-6">
              <h3 className="mb-3 text-sm font-bold text-gray-500">
                {CATEGORY_LABELS[category] ?? category}
              </h3>
              <div className="flex flex-col gap-2">
                {items.map((service) => (
                  <div key={service.id} className="card flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                        {ICON_MAP[service.icon] ?? <Droplets size={20} />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{service.nameKu}</p>
                        <p className="text-[10px] text-gray-400">
                          {service.nameEn} • {service.duration} خولەک
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-brand-700">{formatIQD(service.basePrice)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {addons.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-bold text-gray-500">زیادەکان</h3>
              <div className="grid grid-cols-2 gap-2">
                {addons.map((addon) => (
                  <div key={addon.id} className="card text-center">
                    <p className="text-sm font-medium">{addon.nameKu}</p>
                    <p className="text-sm font-bold text-brand-700">{formatIQD(addon.price)}</p>
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
