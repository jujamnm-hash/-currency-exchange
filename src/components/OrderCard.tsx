import { formatIQD, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, VEHICLE_LABELS } from "@/lib/utils";
import type { OrderStatus, VehicleType } from "@prisma/client";

interface OrderCardProps {
  order: {
    id: string;
    orderNumber: string;
    plateNumber: string;
    vehicleType: VehicleType;
    customerName?: string | null;
    status: OrderStatus;
    total: number;
    queuePosition?: number | null;
    createdAt: string | Date;
    items?: { service: { nameKu: string } }[];
  };
  onAdvance?: (id: string) => void;
  onCancel?: (id: string) => void;
  showActions?: boolean;
}

export function OrderCard({ order, onAdvance, onCancel, showActions = true }: OrderCardProps) {
  const time = new Date(order.createdAt).toLocaleTimeString("ku-IQ", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {order.queuePosition && (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {order.queuePosition}
              </span>
            )}
            <div>
              <p className="font-bold text-gray-900">{order.plateNumber}</p>
              <p className="text-xs text-gray-500">
                {VEHICLE_LABELS[order.vehicleType]}
                {order.customerName && ` • ${order.customerName}`}
              </p>
            </div>
          </div>
          {order.items && order.items.length > 0 && (
            <p className="mt-2 text-xs text-gray-600">
              {order.items.map((i) => i.service.nameKu).join("، ")}
            </p>
          )}
        </div>
        <div className="text-left">
          <span className={`status-badge ${ORDER_STATUS_COLORS[order.status]}`}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
          <p className="mt-1 text-sm font-bold text-brand-700">{formatIQD(order.total)}</p>
          <p className="text-[10px] text-gray-400">{time}</p>
        </div>
      </div>

      {showActions && order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
        <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
          {onAdvance && (
            <button onClick={() => onAdvance(order.id)} className="btn-success flex-1 text-xs">
              قۆناغی داهاتوو
            </button>
          )}
          {onCancel && order.status === "WAITING" && (
            <button onClick={() => onCancel(order.id)} className="btn-danger text-xs px-3">
              هەڵوەشاندن
            </button>
          )}
        </div>
      )}
    </div>
  );
}
