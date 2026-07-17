import { VehicleType, OrderStatus, PaymentMethod } from "@prisma/client";

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  SEDAN: "سەدان",
  SUV: "SUV",
  TRUCK: "بارهەڵگر",
  VAN: "ڤان",
  MOTORCYCLE: "ماتۆرسکیل",
  LUXURY: "لوکس",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  WAITING: "چاوەڕوانی",
  CHECK_IN: "تۆمارکراو",
  WASHING: "لە غەسڵکردندایە",
  DRYING: "لە وشککردندایە",
  DETAILING: "وردەکاری",
  QUALITY_CHECK: "پشکنینی جۆری",
  READY: "ئامادەیە",
  COMPLETED: "تەواوبوو",
  CANCELLED: "هەڵوەشاوە",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  WAITING: "bg-yellow-100 text-yellow-800",
  CHECK_IN: "bg-blue-100 text-blue-800",
  WASHING: "bg-cyan-100 text-cyan-800",
  DRYING: "bg-indigo-100 text-indigo-800",
  DETAILING: "bg-purple-100 text-purple-800",
  QUALITY_CHECK: "bg-orange-100 text-orange-800",
  READY: "bg-green-100 text-green-800",
  COMPLETED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-800",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "کاش",
  CARD: "کارت",
  MOBILE_PAYMENT: "مۆبایل",
  MEMBERSHIP: "ئەندامێتی",
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "WAITING",
  "CHECK_IN",
  "WASHING",
  "DRYING",
  "DETAILING",
  "QUALITY_CHECK",
  "READY",
  "COMPLETED",
];

export function formatIQD(amount: number): string {
  return new Intl.NumberFormat("ar-IQ", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount) + " د.ع";
}

export function generateOrderNumber(): string {
  const date = new Date();
  const prefix = "GH";
  const dateStr = date.toISOString().slice(2, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `${prefix}${dateStr}${random}`;
}

export function getNextStatus(current: OrderStatus): OrderStatus | null {
  const idx = ORDER_STATUS_FLOW.indexOf(current);
  if (idx === -1 || idx >= ORDER_STATUS_FLOW.length - 1) return null;
  return ORDER_STATUS_FLOW[idx + 1];
}

export async function calculateOrderTotal(
  serviceIds: string[],
  addonIds: string[],
  vehicleType: VehicleType,
  discount: number = 0
): Promise<{ subtotal: number; tax: number; total: number }> {
  const { prisma } = await import("./prisma");

  const [services, addons, multiplier] = await Promise.all([
    prisma.service.findMany({ where: { id: { in: serviceIds } } }),
    prisma.serviceAddon.findMany({ where: { id: { in: addonIds } } }),
    prisma.vehiclePriceMultiplier.findUnique({ where: { vehicleType } }),
  ]);

  const mult = multiplier?.multiplier ?? 1;
  const servicesTotal = services.reduce((sum, s) => sum + s.basePrice * mult, 0);
  const addonsTotal = addons.reduce((sum, a) => sum + a.price, 0);
  const subtotal = servicesTotal + addonsTotal;
  const tax = 0;
  const total = Math.max(0, subtotal + tax - discount);

  return { subtotal, tax, total };
}
