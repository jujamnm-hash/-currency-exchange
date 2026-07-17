import {
  generateOrderNumber,
  getNextStatus,
  ORDER_STATUS_FLOW,
  VEHICLE_LABELS,
} from "./utils";

const DB_KEY = "ghassle_hawler_db_v1";

export type VehicleType = keyof typeof VEHICLE_LABELS;
export type OrderStatus = (typeof ORDER_STATUS_FLOW)[number] | "CANCELLED";
export type PaymentMethod = "CASH" | "CARD" | "MOBILE_PAYMENT" | "MEMBERSHIP";

interface Service {
  id: string;
  nameKu: string;
  nameEn: string;
  basePrice: number;
  duration: number;
  category: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
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

interface Order {
  id: string;
  orderNumber: string;
  plateNumber: string;
  vehicleType: VehicleType;
  customerName?: string;
  customerPhone?: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  queuePosition?: number | null;
  createdAt: string;
  items: { service: { nameKu: string }; price: number }[];
  payment?: { method: PaymentMethod; status: string };
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  loyaltyPoints: number;
  vehicles: { plateNumber: string; vehicleType: string }[];
  _count: { orders: number };
}

interface Appointment {
  id: string;
  scheduledAt: string;
  status: string;
  estimatedTotal: number;
  customer: { name: string; phone: string };
  vehicle?: { plateNumber: string };
  items: { service: { nameKu: string }; price: number }[];
}

interface DB {
  services: Service[];
  addons: Addon[];
  multipliers: Multiplier[];
  orders: Order[];
  customers: Customer[];
  appointments: Appointment[];
  settings: Record<string, string>;
  employees: { id: string; name: string; role: string; phone?: string }[];
  inventory: { id: string; nameKu: string; quantity: number; unit: string; minQuantity: number }[];
  membershipPlans: { id: string; nameKu: string; washesCount: number; price: number; validityDays: number }[];
}

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function defaultDB(): DB {
  const services: Service[] = [
    { id: "s1", nameKu: "غەسڵی سادە", nameEn: "Basic Wash", basePrice: 10000, duration: 15, category: "exterior", icon: "droplets", isActive: true, sortOrder: 1 },
    { id: "s2", nameKu: "غەسڵی تەواو", nameEn: "Full Wash", basePrice: 15000, duration: 25, category: "exterior", icon: "sparkles", isActive: true, sortOrder: 2 },
    { id: "s3", nameKu: "غەسڵی پڕیمیەم", nameEn: "Premium Wash", basePrice: 25000, duration: 40, category: "premium", icon: "star", isActive: true, sortOrder: 3 },
    { id: "s4", nameKu: "پاککردنەوەی ناوەوە", nameEn: "Interior Cleaning", basePrice: 20000, duration: 45, category: "interior", icon: "armchair", isActive: true, sortOrder: 4 },
    { id: "s5", nameKu: "واکس و پۆڵیش", nameEn: "Wax & Polish", basePrice: 30000, duration: 60, category: "premium", icon: "gem", isActive: true, sortOrder: 5 },
    { id: "s6", nameKu: "پاککردنەوەی ئەنجام", nameEn: "Engine Cleaning", basePrice: 35000, duration: 50, category: "special", icon: "cog", isActive: true, sortOrder: 6 },
    { id: "s7", nameKu: "غەسڵی ژێرەوە", nameEn: "Undercarriage Wash", basePrice: 12000, duration: 20, category: "exterior", icon: "arrow-down", isActive: true, sortOrder: 7 },
    { id: "s8", nameKu: "پاککردنەوەی پەنجەرە", nameEn: "Window Cleaning", basePrice: 8000, duration: 15, category: "interior", icon: "square", isActive: true, sortOrder: 8 },
  ];

  const multipliers: Multiplier[] = [
    { vehicleType: "SEDAN", multiplier: 1.0, labelKu: "سەدان" },
    { vehicleType: "SUV", multiplier: 1.3, labelKu: "SUV" },
    { vehicleType: "TRUCK", multiplier: 1.5, labelKu: "بارهەڵگر" },
    { vehicleType: "VAN", multiplier: 1.4, labelKu: "ڤان" },
    { vehicleType: "MOTORCYCLE", multiplier: 0.6, labelKu: "ماتۆرسکیل" },
    { vehicleType: "LUXURY", multiplier: 1.8, labelKu: "لوکس" },
  ];

  return {
    services,
    addons: [
      { id: "a1", nameKu: "بۆنخۆش", price: 3000 },
      { id: "a2", nameKu: "پاککردنەوەی تایەر", price: 5000 },
      { id: "a3", nameKu: "پاککردنەوەی داشبۆرد", price: 7000 },
      { id: "a4", nameKu: "ئارۆما", price: 10000 },
      { id: "a5", nameKu: "پاککردنەوەی قاپەکان", price: 15000 },
    ],
    multipliers,
    orders: [],
    customers: [],
    appointments: [],
    settings: {
      shop_name: "غەسلی هەولێر",
      shop_name_en: "Ghassle Hawler Car Wash",
      currency: "IQD",
      opening_time: "08:00",
      closing_time: "22:00",
      phone: "07501234567",
      address: "هەولێر، کوردستان",
    },
    employees: [
      { id: "e1", name: "کارمەند ١", role: "washer", phone: "07501234567" },
      { id: "e2", name: "کارمەند ٢", role: "washer", phone: "07507654321" },
      { id: "e3", name: "بەڕێوەبەر", role: "manager", phone: "07501111111" },
    ],
    inventory: [
      { id: "i1", nameKu: "شامپۆی غەسڵ", quantity: 50, unit: "liter", minQuantity: 10 },
      { id: "i2", nameKu: "واکس", quantity: 20, unit: "liter", minQuantity: 5 },
      { id: "i3", nameKu: "پاککەرەوەی ناوەوە", quantity: 30, unit: "liter", minQuantity: 8 },
    ],
    membershipPlans: [
      { id: "m1", nameKu: "پلانی مانگانە", washesCount: 8, price: 100000, validityDays: 30 },
    ],
  };
}

function load(): DB {
  if (typeof window === "undefined") return defaultDB();
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      const db = defaultDB();
      save(db);
      return db;
    }
    return JSON.parse(raw) as DB;
  } catch {
    return defaultDB();
  }
}

function save(db: DB) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function isToday(d: string) {
  const date = new Date(d);
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

export const localDb = {
  getDashboard() {
    const db = load();
    const todayOrders = db.orders.filter((o) => isToday(o.createdAt));
    const activeQueue = db.orders.filter((o) => !["COMPLETED", "CANCELLED"].includes(o.status));
    const todayRevenue = todayOrders.filter((o) => o.status === "COMPLETED").reduce((s, o) => s + o.total, 0);

    return {
      todayOrders: todayOrders.length,
      activeQueue: activeQueue.length,
      todayRevenue,
      totalCustomers: db.customers.length,
      todayAppointments: db.appointments.filter((a) => isToday(a.scheduledAt)).length,
      recentOrders: [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    };
  },

  getOrders(active?: boolean) {
    const db = load();
    let orders = [...db.orders];
    if (active) orders = orders.filter((o) => !["COMPLETED", "CANCELLED"].includes(o.status));
    return orders.sort((a, b) => (a.queuePosition ?? 99) - (b.queuePosition ?? 99));
  },

  createOrder(data: {
    plateNumber: string;
    vehicleType: VehicleType;
    customerName?: string;
    customerPhone?: string;
    serviceIds: string[];
    addonIds: string[];
    paymentMethod: PaymentMethod;
    notes?: string;
  }) {
    const db = load();
    const mult = db.multipliers.find((m) => m.vehicleType === data.vehicleType)?.multiplier ?? 1;
    const services = db.services.filter((s) => data.serviceIds.includes(s.id));
    const addons = db.addons.filter((a) => data.addonIds.includes(a.id));
    const subtotal = services.reduce((s, x) => s + x.basePrice * mult, 0) + addons.reduce((s, x) => s + x.price, 0);
    const total = subtotal;
    const maxQ = Math.max(0, ...db.orders.filter((o) => !["COMPLETED", "CANCELLED"].includes(o.status)).map((o) => o.queuePosition ?? 0));

    const order: Order = {
      id: uid(),
      orderNumber: generateOrderNumber(),
      plateNumber: data.plateNumber,
      vehicleType: data.vehicleType,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      status: "WAITING",
      subtotal,
      discount: 0,
      tax: 0,
      total,
      notes: data.notes,
      queuePosition: maxQ + 1,
      createdAt: new Date().toISOString(),
      items: services.map((s) => ({ service: { nameKu: s.nameKu }, price: s.basePrice * mult })),
      payment: { method: data.paymentMethod, status: "PAID" },
    };

    db.orders.push(order);

    if (data.customerPhone) {
      let c = db.customers.find((x) => x.phone === data.customerPhone);
      if (!c) {
        c = {
          id: uid(),
          name: data.customerName ?? "کڕیار",
          phone: data.customerPhone,
          loyaltyPoints: 0,
          vehicles: [{ plateNumber: data.plateNumber, vehicleType: data.vehicleType }],
          _count: { orders: 0 },
        };
        db.customers.push(c);
      }
      c._count.orders++;
    }

    save(db);
    return order;
  },

  advanceOrder(id: string) {
    const db = load();
    const order = db.orders.find((o) => o.id === id);
    if (!order) throw new Error("not found");
    const next = getNextStatus(order.status as never);
    if (!next) throw new Error("no next");
    order.status = next as OrderStatus;
    if (next === "COMPLETED") order.queuePosition = null;
    save(db);
    return order;
  },

  cancelOrder(id: string) {
    const db = load();
    const order = db.orders.find((o) => o.id === id);
    if (!order) throw new Error("not found");
    order.status = "CANCELLED";
    order.queuePosition = null;
    save(db);
    return order;
  },

  getServices() {
    const db = load();
    return { services: db.services, addons: db.addons, multipliers: db.multipliers };
  },

  getCustomers(search?: string) {
    const db = load();
    let customers = db.customers;
    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter((c) => c.name.includes(q) || c.phone.includes(q));
    }
    return customers;
  },

  createCustomer(data: { name: string; phone: string; plateNumber?: string }) {
    const db = load();
    const customer: Customer = {
      id: uid(),
      name: data.name,
      phone: data.phone,
      loyaltyPoints: 0,
      vehicles: data.plateNumber ? [{ plateNumber: data.plateNumber, vehicleType: "SEDAN" }] : [],
      _count: { orders: 0 },
    };
    db.customers.push(customer);
    save(db);
    return customer;
  },

  getAppointments() {
    return load().appointments;
  },

  getReports(period: string) {
    const db = load();
    const now = new Date();
    const days = period === "month" ? 30 : period === "week" ? 7 : 0;
    const start = days ? new Date(now.getTime() - days * 86400000) : new Date(now.setHours(0, 0, 0, 0));

    const orders = db.orders.filter((o) => o.status === "COMPLETED" && new Date(o.createdAt) >= start);
    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
    const cashRevenue = orders.filter((o) => o.payment?.method === "CASH").reduce((s, o) => s + o.total, 0);
    const cardRevenue = orders.filter((o) => o.payment?.method === "CARD").reduce((s, o) => s + o.total, 0);

    const serviceBreakdown: Record<string, { count: number; revenue: number }> = {};
    for (const o of orders) {
      for (const item of o.items) {
        const n = item.service.nameKu;
        if (!serviceBreakdown[n]) serviceBreakdown[n] = { count: 0, revenue: 0 };
        serviceBreakdown[n].count++;
        serviceBreakdown[n].revenue += item.price;
      }
    }

    const vehicleBreakdown: Record<string, number> = {};
    for (const o of orders) vehicleBreakdown[o.vehicleType] = (vehicleBreakdown[o.vehicleType] ?? 0) + 1;

    return {
      period,
      totalOrders: orders.length,
      totalRevenue,
      cashRevenue,
      cardRevenue,
      avgOrderValue: orders.length ? totalRevenue / orders.length : 0,
      serviceBreakdown,
      vehicleBreakdown,
    };
  },

  getSettings() {
    const db = load();
    return {
      settings: db.settings,
      employees: db.employees,
      inventory: db.inventory,
      membershipPlans: db.membershipPlans,
    };
  },

  getSetupStatus() {
    const db = load();
    return { ok: true, status: "ready", serviceCount: db.services.length, settingsCount: Object.keys(db.settings).length };
  },
};

export function useLocalMode(): boolean {
  return process.env.NEXT_PUBLIC_STATIC_MODE === "true";
}
