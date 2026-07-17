"use client";

import { useEffect, useState, useCallback } from "react";
import { PageLayout } from "@/components/PageLayout";
import { OrderCard } from "@/components/OrderCard";
import { ORDER_STATUS_LABELS } from "@/lib/utils";
import type { OrderStatus, VehicleType } from "@prisma/client";
import { api } from "@/lib/api-client";

interface Order {
  id: string;
  orderNumber: string;
  plateNumber: string;
  vehicleType: VehicleType;
  customerName?: string | null;
  status: OrderStatus;
  total: number;
  queuePosition?: number | null;
  createdAt: string;
  items?: { service: { nameKu: string } }[];
}

export default function QueuePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"active" | "all">("active");
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(() => {
    api.orders(filter === "active")
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const advanceOrder = async (id: string) => {
    await api.advanceOrder(id);
    fetchOrders();
  };

  const cancelOrder = async (id: string) => {
    if (!confirm("دڵنیایت لە هەڵوەشاندنەوە؟")) return;
    await api.cancelOrder(id);
    fetchOrders();
  };

  const statusCounts = orders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <PageLayout title="ڕیزی چاوەڕوانی" subtitle={`${orders.length} داواکاری`}>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter("active")}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            filter === "active" ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          چالاک
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            filter === "all" ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          هەموو
        </button>
      </div>

      {filter === "active" && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {Object.entries(statusCounts).map(([status, count]) => (
            <span
              key={status}
              className="whitespace-nowrap rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
            >
              {ORDER_STATUS_LABELS[status as OrderStatus]}: {count}
            </span>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-28 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card text-center text-gray-500 py-8">
          <p className="text-lg">ڕیز بەتاڵە</p>
          <p className="text-sm mt-1">داواکاری نوێ زیاد بکە</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAdvance={advanceOrder}
              onCancel={cancelOrder}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
