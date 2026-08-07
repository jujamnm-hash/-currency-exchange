const DB_KEY = "org_structure_db_v2";
const OLD_DB_KEY = "org_structure_db_v1";

export interface Market {
  id: string;
  name: string;
  code?: string;
  location?: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Department {
  id: string;
  name: string;
  code?: string;
  description?: string;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface Position {
  id: string;
  name: string;
  code?: string;
  description?: string;
  departmentId?: string | null;
  level: number;
  isActive: boolean;
  sortOrder: number;
}

export interface Employee {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  employeeCode?: string;
  marketIds: string[];
  departmentId?: string | null;
  positionId?: string | null;
  managerId?: string | null;
  hireDate?: string | null;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

interface DB {
  markets: Market[];
  departments: Department[];
  positions: Position[];
  employees: Employee[];
  settings: Record<string, string>;
}

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeEmployee(raw: Record<string, unknown>): Employee {
  const marketIds =
    Array.isArray(raw.marketIds)
      ? (raw.marketIds as string[])
      : raw.marketId
      ? [String(raw.marketId)]
      : [];
  return {
    id: String(raw.id),
    name: String(raw.name || ""),
    phone: (raw.phone as string) || undefined,
    email: (raw.email as string) || undefined,
    employeeCode: (raw.employeeCode as string) || undefined,
    marketIds,
    departmentId: (raw.departmentId as string) || null,
    positionId: (raw.positionId as string) || null,
    managerId: (raw.managerId as string) || null,
    hireDate: (raw.hireDate as string) || null,
    notes: (raw.notes as string) || undefined,
    isActive: raw.isActive !== false,
    createdAt: String(raw.createdAt || new Date().toISOString()),
  };
}

function defaultDB(): DB {
  const markets: Market[] = [
    { id: "m1", name: "مارکێتی ناوەندی", code: "M01", location: "هەولێر", isActive: true, sortOrder: 1 },
    { id: "m2", name: "مارکێتی ١٠٠ مەتر", code: "M02", location: "هەولێر", isActive: true, sortOrder: 2 },
    { id: "m3", name: "مارکێتی ئانکاوا", code: "M03", location: "هەولێر", isActive: true, sortOrder: 3 },
  ];

  const departments: Department[] = [
    { id: "d1", name: "بەڕێوەبەرایەتی گشتی", code: "D01", parentId: null, sortOrder: 1, isActive: true },
    { id: "d2", name: "سەرچاوە مرۆییەکان", code: "D02", parentId: "d1", sortOrder: 2, isActive: true },
    { id: "d3", name: "فرۆشتن", code: "D03", parentId: "d1", sortOrder: 3, isActive: true },
    { id: "d4", name: "کارگێڕی", code: "D04", parentId: "d1", sortOrder: 4, isActive: true },
  ];

  const positions: Position[] = [
    { id: "p1", name: "بەڕێوەبەری گشتی", code: "P01", departmentId: "d1", level: 5, isActive: true, sortOrder: 1 },
    { id: "p2", name: "بەڕێوەبەری مارکێت", code: "P02", departmentId: "d3", level: 4, isActive: true, sortOrder: 2 },
    { id: "p3", name: "سەرپەرشتیاری فرۆشتن", code: "P03", departmentId: "d3", level: 3, isActive: true, sortOrder: 3 },
    { id: "p4", name: "کارمەندی فرۆشتن", code: "P04", departmentId: "d3", level: 2, isActive: true, sortOrder: 4 },
    { id: "p5", name: "کارمەندی کۆگا", code: "P05", departmentId: "d4", level: 2, isActive: true, sortOrder: 5 },
    { id: "p6", name: "کارمەندی سەرچاوە مرۆییەکان", code: "P06", departmentId: "d2", level: 2, isActive: true, sortOrder: 6 },
  ];

  const employees: Employee[] = [
    {
      id: "e1",
      name: "ئارام محەمەد",
      phone: "07501234567",
      employeeCode: "E001",
      marketIds: ["m1", "m2", "m3"],
      departmentId: "d1",
      positionId: "p1",
      managerId: null,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "e2",
      name: "سارا ئەحمەد",
      phone: "07501234568",
      employeeCode: "E002",
      marketIds: ["m1", "m2"],
      departmentId: "d3",
      positionId: "p2",
      managerId: "e1",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "e3",
      name: "هیوا عەلی",
      phone: "07501234569",
      employeeCode: "E003",
      marketIds: ["m1"],
      departmentId: "d3",
      positionId: "p3",
      managerId: "e2",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "e4",
      name: "لانا کەریم",
      phone: "07501234570",
      employeeCode: "E004",
      marketIds: ["m2"],
      departmentId: "d3",
      positionId: "p4",
      managerId: "e2",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "e5",
      name: "دیلان حسن",
      phone: "07501234571",
      employeeCode: "E005",
      marketIds: ["m3", "m1"],
      departmentId: "d4",
      positionId: "p5",
      managerId: "e1",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "e6",
      name: "نۆر خان",
      phone: "07501234572",
      employeeCode: "E006",
      marketIds: ["m1"],
      departmentId: "d2",
      positionId: "p6",
      managerId: "e1",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    markets,
    departments,
    positions,
    employees,
    settings: {
      org_name: "هەیکەلی ئیداری",
      org_subtitle: "سیستەمی ڕێکخستنی کارمەندان",
    },
  };
}

function load(): DB {
  if (typeof window === "undefined") return defaultDB();
  try {
    const raw = localStorage.getItem(DB_KEY) || localStorage.getItem(OLD_DB_KEY);
    if (!raw) {
      const db = defaultDB();
      localStorage.setItem(DB_KEY, JSON.stringify(db));
      return db;
    }
    const parsed = JSON.parse(raw) as {
      markets: Market[];
      departments: Department[];
      positions: Position[];
      employees: Array<Record<string, unknown>>;
      settings: Record<string, string>;
    };
    const db: DB = {
      markets: parsed.markets || [],
      departments: parsed.departments || [],
      positions: parsed.positions || [],
      settings: parsed.settings || {},
      employees: (parsed.employees || []).map((e) => normalizeEmployee(e)),
    };
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return db;
  } catch {
    return defaultDB();
  }
}

function save(db: DB) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function useLocalMode() {
  if (typeof window === "undefined") return false;
  // Force localStorage only when explicitly requested
  if (localStorage.getItem("org_force_local") === "1") return true;
  // Prefer API/database when enabled (Vercel production)
  if (process.env.NEXT_PUBLIC_USE_API === "true") return false;
  // Default: try API first (useLocalMode false), fall back in tryApi
  return false;
}

function enrichEmployee(e: Employee, db: DB) {
  const markets = db.markets.filter((m) => e.marketIds.includes(m.id));
  return {
    ...e,
    markets,
    market: markets[0] ?? null,
    marketNames: markets.map((m) => m.name).join(" · "),
    department: db.departments.find((d) => d.id === e.departmentId) ?? null,
    position: db.positions.find((p) => p.id === e.positionId) ?? null,
    manager: db.employees.find((m) => m.id === e.managerId)
      ? { id: e.managerId!, name: db.employees.find((m) => m.id === e.managerId)!.name }
      : null,
  };
}

export const localDb = {
  getDashboard() {
    const db = load();
    const activeEmployees = db.employees.filter((e) => e.isActive);
    const byMarket = db.markets.map((m) => ({
      id: m.id,
      name: m.name,
      count: activeEmployees.filter((e) => e.marketIds.includes(m.id)).length,
    }));
    const byDepartment = db.departments.map((d) => ({
      id: d.id,
      name: d.name,
      count: activeEmployees.filter((e) => e.departmentId === d.id).length,
    }));
    return {
      totalEmployees: activeEmployees.length,
      totalMarkets: db.markets.filter((m) => m.isActive).length,
      totalDepartments: db.departments.filter((d) => d.isActive).length,
      totalPositions: db.positions.filter((p) => p.isActive).length,
      byMarket,
      byDepartment,
      recentEmployees: activeEmployees
        .slice()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 6)
        .map((e) => enrichEmployee(e, db)),
    };
  },

  getMarkets() {
    return load().markets.sort((a, b) => a.sortOrder - b.sortOrder);
  },

  createMarket(data: { name: string; code?: string; location?: string; description?: string }) {
    const db = load();
    const market: Market = {
      id: uid(),
      name: data.name,
      code: data.code,
      location: data.location,
      description: data.description,
      isActive: true,
      sortOrder: db.markets.length + 1,
    };
    db.markets.push(market);
    save(db);
    return market;
  },

  updateMarket(id: string, data: Partial<Market>) {
    const db = load();
    const idx = db.markets.findIndex((m) => m.id === id);
    if (idx < 0) throw new Error("مارکێت نەدۆزرایەوە");
    db.markets[idx] = { ...db.markets[idx], ...data, id };
    save(db);
    return db.markets[idx];
  },

  deleteMarket(id: string) {
    const db = load();
    db.markets = db.markets.filter((m) => m.id !== id);
    db.employees = db.employees.map((e) => ({
      ...e,
      marketIds: e.marketIds.filter((mid) => mid !== id),
    }));
    save(db);
    return { ok: true };
  },

  getDepartments() {
    return load().departments.sort((a, b) => a.sortOrder - b.sortOrder);
  },

  createDepartment(data: { name: string; code?: string; description?: string; parentId?: string | null }) {
    const db = load();
    const department: Department = {
      id: uid(),
      name: data.name,
      code: data.code,
      description: data.description,
      parentId: data.parentId ?? null,
      sortOrder: db.departments.length + 1,
      isActive: true,
    };
    db.departments.push(department);
    save(db);
    return department;
  },

  updateDepartment(id: string, data: Partial<Department>) {
    const db = load();
    const idx = db.departments.findIndex((d) => d.id === id);
    if (idx < 0) throw new Error("بەش نەدۆزرایەوە");
    db.departments[idx] = { ...db.departments[idx], ...data, id };
    save(db);
    return db.departments[idx];
  },

  deleteDepartment(id: string) {
    const db = load();
    db.departments = db.departments
      .filter((d) => d.id !== id)
      .map((d) => (d.parentId === id ? { ...d, parentId: null } : d));
    db.positions = db.positions.map((p) => (p.departmentId === id ? { ...p, departmentId: null } : p));
    db.employees = db.employees.map((e) => (e.departmentId === id ? { ...e, departmentId: null } : e));
    save(db);
    return { ok: true };
  },

  getPositions() {
    const db = load();
    return db.positions
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((p) => ({
        ...p,
        department: db.departments.find((d) => d.id === p.departmentId) ?? null,
      }));
  },

  createPosition(data: {
    name: string;
    code?: string;
    description?: string;
    departmentId?: string | null;
    level?: number;
  }) {
    const db = load();
    const position: Position = {
      id: uid(),
      name: data.name,
      code: data.code,
      description: data.description,
      departmentId: data.departmentId ?? null,
      level: data.level ?? 1,
      isActive: true,
      sortOrder: db.positions.length + 1,
    };
    db.positions.push(position);
    save(db);
    return {
      ...position,
      department: db.departments.find((d) => d.id === position.departmentId) ?? null,
    };
  },

  updatePosition(id: string, data: Partial<Position>) {
    const db = load();
    const idx = db.positions.findIndex((p) => p.id === id);
    if (idx < 0) throw new Error("پۆست نەدۆزرایەوە");
    db.positions[idx] = { ...db.positions[idx], ...data, id };
    save(db);
    return {
      ...db.positions[idx],
      department: db.departments.find((d) => d.id === db.positions[idx].departmentId) ?? null,
    };
  },

  deletePosition(id: string) {
    const db = load();
    db.positions = db.positions.filter((p) => p.id !== id);
    db.employees = db.employees.map((e) => (e.positionId === id ? { ...e, positionId: null } : e));
    save(db);
    return { ok: true };
  },

  getEmployees(search?: string) {
    const db = load();
    let list = db.employees.slice();
    if (search) {
      const q = search.trim().toLowerCase();
      list = list.filter((e) => {
        const marketNames = db.markets
          .filter((m) => e.marketIds.includes(m.id))
          .map((m) => m.name.toLowerCase())
          .join(" ");
        return (
          e.name.toLowerCase().includes(q) ||
          e.phone?.includes(q) ||
          e.employeeCode?.toLowerCase().includes(q) ||
          marketNames.includes(q)
        );
      });
    }
    return list
      .sort((a, b) => a.name.localeCompare(b.name, "ku"))
      .map((e) => enrichEmployee(e, db));
  },

  createEmployee(data: {
    name: string;
    phone?: string;
    email?: string;
    employeeCode?: string;
    marketIds?: string[];
    marketId?: string | null;
    departmentId?: string | null;
    positionId?: string | null;
    managerId?: string | null;
    notes?: string;
  }) {
    const db = load();
    const marketIds =
      data.marketIds ?? (data.marketId ? [data.marketId] : []);
    const employee: Employee = {
      id: uid(),
      name: data.name,
      phone: data.phone,
      email: data.email,
      employeeCode: data.employeeCode,
      marketIds,
      departmentId: data.departmentId ?? null,
      positionId: data.positionId ?? null,
      managerId: data.managerId ?? null,
      notes: data.notes,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    db.employees.push(employee);
    save(db);
    return enrichEmployee(employee, db);
  },

  updateEmployee(id: string, data: Partial<Employee> & { marketId?: string | null }) {
    const db = load();
    const idx = db.employees.findIndex((e) => e.id === id);
    if (idx < 0) throw new Error("کارمەند نەدۆزرایەوە");
    const { marketId, ...rest } = data;
    const next: Employee = {
      ...db.employees[idx],
      ...rest,
      id,
      marketIds:
        rest.marketIds ??
        (marketId !== undefined ? (marketId ? [marketId] : []) : db.employees[idx].marketIds),
    };
    db.employees[idx] = next;
    save(db);
    return enrichEmployee(db.employees[idx], db);
  },

  deleteEmployee(id: string) {
    const db = load();
    db.employees = db.employees
      .filter((e) => e.id !== id)
      .map((e) => (e.managerId === id ? { ...e, managerId: null } : e));
    save(db);
    return { ok: true };
  },

  getOrgChart() {
    const db = load();
    const active = db.employees.filter((e) => e.isActive).map((e) => enrichEmployee(e, db));
    const roots = active.filter((e) => !e.managerId || !active.some((x) => x.id === e.managerId));

    function build(node: (typeof active)[0]): (typeof active)[0] & { children: ReturnType<typeof build>[] } {
      return {
        ...node,
        children: active.filter((e) => e.managerId === node.id).map(build),
      };
    }

    return {
      tree: roots.map(build),
      departments: db.departments,
      markets: db.markets,
    };
  },

  getSettings() {
    return load().settings;
  },

  updateSettings(data: Record<string, string>) {
    const db = load();
    db.settings = { ...db.settings, ...data };
    save(db);
    return db.settings;
  },

  reset() {
    const db = defaultDB();
    save(db);
    return { ok: true };
  },
};
