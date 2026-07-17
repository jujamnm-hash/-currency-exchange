import { localDb, useLocalMode } from "./local-db";

async function tryApi<T>(path: string, options?: RequestInit): Promise<T | null> {
  if (useLocalMode()) return null;
  try {
    const res = await fetch(path, options);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const api = {
  async dashboard() {
    return (await tryApi<ReturnType<typeof localDb.getDashboard>>("/api/dashboard")) ?? localDb.getDashboard();
  },

  async orders(active?: boolean) {
    const path = active ? "/api/orders?active=true" : "/api/orders";
    return (await tryApi<Awaited<ReturnType<typeof localDb.getOrders>>>(path)) ?? localDb.getOrders(active);
  },

  async createOrder(data: Parameters<typeof localDb.createOrder>[0]) {
    const result = await tryApi<ReturnType<typeof localDb.createOrder>>("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        serviceIds: data.serviceIds,
        addonIds: data.addonIds,
        paymentMethod: data.paymentMethod,
      }),
    });
    return result ?? localDb.createOrder(data);
  },

  async advanceOrder(id: string) {
    if (useLocalMode()) return localDb.advanceOrder(id);
    const result = await tryApi(`/api/orders`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "advance" }),
    });
    if (result) return result;
    return localDb.advanceOrder(id);
  },

  async cancelOrder(id: string) {
    if (useLocalMode()) return localDb.cancelOrder(id);
    const result = await tryApi(`/api/orders`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "cancel" }),
    });
    if (result) return result;
    return localDb.cancelOrder(id);
  },

  async services() {
    return (await tryApi<ReturnType<typeof localDb.getServices>>("/api/services")) ?? localDb.getServices();
  },

  async customers(search?: string) {
    const path = search ? `/api/customers?search=${encodeURIComponent(search)}` : "/api/customers";
    return (await tryApi<ReturnType<typeof localDb.getCustomers>>(path)) ?? localDb.getCustomers(search);
  },

  async createCustomer(data: Parameters<typeof localDb.createCustomer>[0]) {
    const result = await tryApi<ReturnType<typeof localDb.createCustomer>>("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return result ?? localDb.createCustomer(data);
  },

  async appointments() {
    return (await tryApi<ReturnType<typeof localDb.getAppointments>>("/api/appointments")) ?? localDb.getAppointments();
  },

  async reports(period: string) {
    return (await tryApi<ReturnType<typeof localDb.getReports>>(`/api/reports?period=${period}`)) ?? localDb.getReports(period);
  },

  async settings() {
    return (await tryApi<ReturnType<typeof localDb.getSettings>>("/api/settings")) ?? localDb.getSettings();
  },

  async setupStatus() {
    return (await tryApi<ReturnType<typeof localDb.getSetupStatus>>("/api/setup")) ?? localDb.getSetupStatus();
  },
};
