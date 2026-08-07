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

  async markets() {
    return (await tryApi<ReturnType<typeof localDb.getMarkets>>("/api/markets")) ?? localDb.getMarkets();
  },

  async createMarket(data: Parameters<typeof localDb.createMarket>[0]) {
    const result = await tryApi<ReturnType<typeof localDb.createMarket>>("/api/markets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return result ?? localDb.createMarket(data);
  },

  async updateMarket(id: string, data: Parameters<typeof localDb.updateMarket>[1]) {
    const result = await tryApi<ReturnType<typeof localDb.updateMarket>>("/api/markets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    return result ?? localDb.updateMarket(id, data);
  },

  async deleteMarket(id: string) {
    const result = await tryApi<{ ok: boolean }>("/api/markets", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return result ?? localDb.deleteMarket(id);
  },

  async departments() {
    return (
      (await tryApi<ReturnType<typeof localDb.getDepartments>>("/api/departments")) ??
      localDb.getDepartments()
    );
  },

  async createDepartment(data: Parameters<typeof localDb.createDepartment>[0]) {
    const result = await tryApi<ReturnType<typeof localDb.createDepartment>>("/api/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return result ?? localDb.createDepartment(data);
  },

  async updateDepartment(id: string, data: Parameters<typeof localDb.updateDepartment>[1]) {
    const result = await tryApi<ReturnType<typeof localDb.updateDepartment>>("/api/departments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    return result ?? localDb.updateDepartment(id, data);
  },

  async deleteDepartment(id: string) {
    const result = await tryApi<{ ok: boolean }>("/api/departments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return result ?? localDb.deleteDepartment(id);
  },

  async positions() {
    return (await tryApi<ReturnType<typeof localDb.getPositions>>("/api/positions")) ?? localDb.getPositions();
  },

  async createPosition(data: Parameters<typeof localDb.createPosition>[0]) {
    const result = await tryApi<ReturnType<typeof localDb.createPosition>>("/api/positions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return result ?? localDb.createPosition(data);
  },

  async updatePosition(id: string, data: Parameters<typeof localDb.updatePosition>[1]) {
    const result = await tryApi<ReturnType<typeof localDb.updatePosition>>("/api/positions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    return result ?? localDb.updatePosition(id, data);
  },

  async deletePosition(id: string) {
    const result = await tryApi<{ ok: boolean }>("/api/positions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return result ?? localDb.deletePosition(id);
  },

  async employees(search?: string) {
    const path = search ? `/api/employees?search=${encodeURIComponent(search)}` : "/api/employees";
    return (await tryApi<ReturnType<typeof localDb.getEmployees>>(path)) ?? localDb.getEmployees(search);
  },

  async createEmployee(data: Parameters<typeof localDb.createEmployee>[0]) {
    const result = await tryApi<ReturnType<typeof localDb.createEmployee>>("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return result ?? localDb.createEmployee(data);
  },

  async updateEmployee(id: string, data: Parameters<typeof localDb.updateEmployee>[1]) {
    const result = await tryApi<ReturnType<typeof localDb.updateEmployee>>("/api/employees", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    return result ?? localDb.updateEmployee(id, data);
  },

  async deleteEmployee(id: string) {
    const result = await tryApi<{ ok: boolean }>("/api/employees", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return result ?? localDb.deleteEmployee(id);
  },

  async orgChart() {
    return (await tryApi<ReturnType<typeof localDb.getOrgChart>>("/api/org-chart")) ?? localDb.getOrgChart();
  },

  async settings() {
    return (await tryApi<ReturnType<typeof localDb.getSettings>>("/api/settings")) ?? localDb.getSettings();
  },

  async updateSettings(data: Record<string, string>) {
    const result = await tryApi<ReturnType<typeof localDb.updateSettings>>("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return result ?? localDb.updateSettings(data);
  },

  async reset() {
    return localDb.reset();
  },

  async leaves(filters?: { year?: number; month?: number; employeeId?: string }) {
    const params = new URLSearchParams();
    if (filters?.year) params.set("year", String(filters.year));
    if (filters?.month) params.set("month", String(filters.month));
    if (filters?.employeeId) params.set("employeeId", filters.employeeId);
    const qs = params.toString();
    const path = qs ? `/api/leaves?${qs}` : "/api/leaves";
    return (await tryApi<ReturnType<typeof localDb.getLeaves>>(path)) ?? localDb.getLeaves(filters);
  },

  async leaveReport(year: number, month: number) {
    const path = `/api/leaves?report=1&year=${year}&month=${month}`;
    return (
      (await tryApi<ReturnType<typeof localDb.getLeaveReport>>(path)) ??
      localDb.getLeaveReport(year, month)
    );
  },

  async createLeave(data: Parameters<typeof localDb.createLeave>[0]) {
    const result = await tryApi<ReturnType<typeof localDb.createLeave>>("/api/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return result ?? localDb.createLeave(data);
  },

  async updateLeave(id: string, data: Parameters<typeof localDb.updateLeave>[1]) {
    const result = await tryApi<ReturnType<typeof localDb.updateLeave>>("/api/leaves", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    return result ?? localDb.updateLeave(id, data);
  },

  async deleteLeave(id: string) {
    const result = await tryApi<{ ok: boolean }>("/api/leaves", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return result ?? localDb.deleteLeave(id);
  },
};
