export type DebtType = "owed_to_me" | "i_owe";
export type DebtStatus = "open" | "partial" | "paid";

export interface Person {
  id: string;
  name: string;
  phone: string;
  notes: string;
  createdAt: string;
}

export interface Debt {
  id: string;
  personId: string;
  type: DebtType;
  amount: number;
  remaining: number;
  description: string;
  date: string;
  status: DebtStatus;
  createdAt: string;
}

export interface Payment {
  id: string;
  debtId: string;
  amount: number;
  date: string;
  note: string;
  createdAt: string;
}

export interface DebtDB {
  people: Person[];
  debts: Debt[];
  payments: Payment[];
  version: number;
}

const DB_KEY = "qarzname_db_v1";

function emptyDb(): DebtDB {
  return { people: [], debts: [], payments: [], version: 1 };
}

function uid(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function loadDb(): DebtDB {
  if (typeof window === "undefined") return emptyDb();
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return emptyDb();
    const parsed = JSON.parse(raw) as DebtDB;
    return {
      people: parsed.people ?? [],
      debts: parsed.debts ?? [],
      payments: parsed.payments ?? [],
      version: parsed.version ?? 1,
    };
  } catch {
    return emptyDb();
  }
}

export function saveDb(db: DebtDB): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  window.dispatchEvent(new CustomEvent("qarzname-db-changed"));
}

export function addPerson(input: {
  name: string;
  phone?: string;
  notes?: string;
}): Person {
  const db = loadDb();
  const person: Person = {
    id: uid(),
    name: input.name.trim(),
    phone: (input.phone ?? "").trim(),
    notes: (input.notes ?? "").trim(),
    createdAt: new Date().toISOString(),
  };
  db.people.unshift(person);
  saveDb(db);
  return person;
}

export function updatePerson(
  id: string,
  patch: Partial<Pick<Person, "name" | "phone" | "notes">>
): Person | null {
  const db = loadDb();
  const idx = db.people.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  db.people[idx] = {
    ...db.people[idx],
    ...patch,
    name: (patch.name ?? db.people[idx].name).trim(),
    phone: (patch.phone ?? db.people[idx].phone).trim(),
    notes: (patch.notes ?? db.people[idx].notes).trim(),
  };
  saveDb(db);
  return db.people[idx];
}

export function deletePerson(id: string): void {
  const db = loadDb();
  const debtIds = new Set(db.debts.filter((d) => d.personId === id).map((d) => d.id));
  db.people = db.people.filter((p) => p.id !== id);
  db.debts = db.debts.filter((d) => d.personId !== id);
  db.payments = db.payments.filter((p) => !debtIds.has(p.debtId));
  saveDb(db);
}

export function addDebt(input: {
  personId: string;
  type: DebtType;
  amount: number;
  description?: string;
  date?: string;
}): Debt {
  const amount = Math.round(input.amount);
  const debt: Debt = {
    id: uid(),
    personId: input.personId,
    type: input.type,
    amount,
    remaining: amount,
    description: (input.description ?? "").trim(),
    date: input.date || new Date().toISOString().slice(0, 10),
    status: "open",
    createdAt: new Date().toISOString(),
  };
  const db = loadDb();
  db.debts.unshift(debt);
  saveDb(db);
  return debt;
}

export function addPayment(input: {
  debtId: string;
  amount: number;
  date?: string;
  note?: string;
}): Payment | null {
  const db = loadDb();
  const debt = db.debts.find((d) => d.id === input.debtId);
  if (!debt || debt.remaining <= 0) return null;

  const amount = Math.min(Math.round(input.amount), debt.remaining);
  if (amount <= 0) return null;

  const payment: Payment = {
    id: uid(),
    debtId: debt.id,
    amount,
    date: input.date || new Date().toISOString().slice(0, 10),
    note: (input.note ?? "").trim(),
    createdAt: new Date().toISOString(),
  };

  debt.remaining -= amount;
  debt.status = debt.remaining <= 0 ? "paid" : "partial";
  db.payments.unshift(payment);
  saveDb(db);
  return payment;
}

export function deleteDebt(id: string): void {
  const db = loadDb();
  db.debts = db.debts.filter((d) => d.id !== id);
  db.payments = db.payments.filter((p) => p.debtId !== id);
  saveDb(db);
}

export function getPersonBalance(personId: string, db = loadDb()) {
  const debts = db.debts.filter((d) => d.personId === personId && d.remaining > 0);
  let owedToMe = 0;
  let iOwe = 0;
  for (const d of debts) {
    if (d.type === "owed_to_me") owedToMe += d.remaining;
    else iOwe += d.remaining;
  }
  return { owedToMe, iOwe, net: owedToMe - iOwe };
}

export function getTotals(db = loadDb()) {
  let owedToMe = 0;
  let iOwe = 0;
  let openCount = 0;
  for (const d of db.debts) {
    if (d.remaining <= 0) continue;
    openCount += 1;
    if (d.type === "owed_to_me") owedToMe += d.remaining;
    else iOwe += d.remaining;
  }
  return {
    owedToMe,
    iOwe,
    net: owedToMe - iOwe,
    openCount,
    peopleCount: db.people.length,
  };
}

export function exportJson(): string {
  return JSON.stringify(loadDb(), null, 2);
}

export function importJson(raw: string): boolean {
  try {
    const parsed = JSON.parse(raw) as DebtDB;
    if (!Array.isArray(parsed.people) || !Array.isArray(parsed.debts)) return false;
    saveDb({
      people: parsed.people,
      debts: parsed.debts,
      payments: Array.isArray(parsed.payments) ? parsed.payments : [],
      version: 1,
    });
    return true;
  } catch {
    return false;
  }
}

export function clearAll(): void {
  saveDb(emptyDb());
}
