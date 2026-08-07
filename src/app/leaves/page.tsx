"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/PageLayout";
import { Modal } from "@/components/Modal";
import { EmployeeAutocomplete } from "@/components/EmployeeAutocomplete";
import { api } from "@/lib/api-client";
import { CalendarDays, Clock3, Plus, Pencil, Trash2, BarChart3 } from "lucide-react";

interface Ref {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  name: string;
  phone?: string | null;
  employeeCode?: string | null;
  position?: Ref | null;
  department?: Ref | null;
  markets?: Ref[];
  marketNames?: string;
  market?: Ref | null;
}

interface LeaveRow {
  id: string;
  employeeId: string;
  kind: "DAY" | "HOUR";
  date: string;
  days: number;
  hours: number;
  reason?: string | null;
  year: number;
  month: number;
  employee?: Employee;
}

const KU_MONTHS = [
  "کانوونی دووەم",
  "شوبات",
  "ئادار",
  "نیسان",
  "ئایار",
  "حوزەیران",
  "تەممووز",
  "ئاب",
  "ئەیلوول",
  "تشرینی یەکەم",
  "تشرینی دووەم",
  "کانوونی یەکەم",
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function LeavesPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaves, setLeaves] = useState<LeaveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LeaveRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [form, setForm] = useState({
    employeeId: "",
    employeeName: "",
    kind: "DAY" as "DAY" | "HOUR",
    date: todayISO(),
    days: "1",
    hours: "1",
    reason: "",
  });

  async function load() {
    setLoading(true);
    try {
      const [emps, rows] = await Promise.all([
        api.employees(),
        api.leaves({ year, month }),
      ]);
      setEmployees(emps as Employee[]);
      setLeaves(rows as LeaveRow[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(console.error);
  }, [year, month]);

  const totals = useMemo(
    () => ({
      days: leaves.reduce((s, l) => s + (l.days || 0), 0),
      hours: leaves.reduce((s, l) => s + (l.hours || 0), 0),
    }),
    [leaves]
  );

  function openCreate() {
    setEditing(null);
    setSearchName("");
    setForm({
      employeeId: "",
      employeeName: "",
      kind: "DAY",
      date: todayISO(),
      days: "1",
      hours: "1",
      reason: "",
    });
    setOpen(true);
  }

  function openEdit(row: LeaveRow) {
    setEditing(row);
    setSearchName(row.employee?.name || "");
    setForm({
      employeeId: row.employeeId,
      employeeName: row.employee?.name || "",
      kind: row.kind,
      date: row.date.slice(0, 10),
      days: String(row.days || 1),
      hours: String(row.hours || 1),
      reason: row.reason || "",
    });
    setOpen(true);
  }

  async function save() {
    if (!form.employeeId || !form.date) return;
    if (form.kind === "DAY" && !(Number(form.days) > 0)) return;
    if (form.kind === "HOUR" && !(Number(form.hours) > 0)) return;
    setSaving(true);
    try {
      const payload = {
        employeeId: form.employeeId,
        kind: form.kind,
        date: form.date,
        days: Number(form.days) || 0,
        hours: Number(form.hours) || 0,
        reason: form.reason || undefined,
      };
      if (editing) await api.updateLeave(editing.id, payload);
      else await api.createLeave(payload);
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("دڵنیایت لە سڕینەوەی ئەم تۆمارە؟")) return;
    await api.deleteLeave(id);
    await load();
  }

  const years = Array.from({ length: 6 }, (_, i) => now.getFullYear() - 2 + i);

  return (
    <PageLayout
      title="مۆڵەتی کارمەندان"
      subtitle="تۆماری مۆڵەت بە ڕۆژ و بە کاتژمێر"
      action={
        <div className="flex gap-2">
          <Link href="/leave-reports" className="btn-secondary !py-2.5 text-xs">
            <BarChart3 size={15} />
            ڕاپۆرت
          </Link>
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} />
            تۆماری نوێ
          </button>
        </div>
      }
    >
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="card !p-3">
          <p className="text-[11px] text-slate-500">مانگ</p>
          <select
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {KU_MONTHS.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="card !p-3">
          <p className="text-[11px] text-slate-500">ساڵ</p>
          <select
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="card !p-3">
          <p className="mb-1 flex items-center gap-1 text-[11px] text-slate-500">
            <CalendarDays size={12} /> کۆی ڕۆژ
          </p>
          <p className="text-xl font-bold text-slate-900">{totals.days}</p>
        </div>
        <div className="card !p-3">
          <p className="mb-1 flex items-center gap-1 text-[11px] text-slate-500">
            <Clock3 size={12} /> کۆی کاتژمێر
          </p>
          <p className="text-xl font-bold text-slate-900">{totals.hours}</p>
        </div>
      </div>

      {loading ? (
        <div className="card h-40 animate-pulse bg-slate-100" />
      ) : (
        <div className="space-y-2">
          {leaves.map((l) => (
            <div key={l.id} className="card flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900">{l.employee?.name || "—"}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {[l.employee?.position?.name, l.employee?.department?.name].filter(Boolean).join(" · ") ||
                    "بێ وردەکاری"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-slate-600">{l.date}</span>
                  {l.kind === "DAY" ? (
                    <span className="rounded-lg bg-sky-50 px-2 py-0.5 font-semibold text-sky-800">
                      {l.days} ڕۆژ
                    </span>
                  ) : (
                    <span className="rounded-lg bg-amber-50 px-2 py-0.5 font-semibold text-amber-800">
                      {l.hours} کاتژمێر
                    </span>
                  )}
                  {l.reason && <span className="text-slate-400">{l.reason}</span>}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(l)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                  <Pencil size={16} />
                </button>
                <button onClick={() => remove(l.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {!leaves.length && (
            <div className="card text-center text-sm text-slate-400">
              بۆ ئەم مانگە هیچ مۆڵەتێک تۆمار نەکراوە
            </div>
          )}
        </div>
      )}

      <Modal open={open} title={editing ? "دەستکاری مۆڵەت" : "تۆماری مۆڵەتی نوێ"} onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <EmployeeAutocomplete
            label="کارمەند *"
            value={searchName}
            employees={employees}
            onChange={setSearchName}
            onSelect={(emp) => {
              setSearchName(emp.name);
              setForm((f) => ({ ...f, employeeId: emp.id, employeeName: emp.name }));
            }}
            placeholder="ناوی کارمەند بنووسە یان هەڵبژێرە..."
          />

          <div>
            <label className="label">جۆری مۆڵەت</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, kind: "DAY" })}
                className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  form.kind === "DAY"
                    ? "border-sky-300 bg-sky-50 text-sky-900"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                <CalendarDays size={16} className="mb-1 inline-block" /> بە ڕۆژ
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, kind: "HOUR" })}
                className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  form.kind === "HOUR"
                    ? "border-amber-300 bg-amber-50 text-amber-900"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                <Clock3 size={16} className="mb-1 inline-block" /> بە کاتژمێر
              </button>
            </div>
          </div>

          <div>
            <label className="label">بەروار *</label>
            <input
              type="date"
              className="input-field"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          {form.kind === "DAY" ? (
            <div>
              <label className="label">ژمارەی ڕۆژ *</label>
              <input
                type="number"
                min={0.5}
                step={0.5}
                className="input-field"
                value={form.days}
                onChange={(e) => setForm({ ...form, days: e.target.value })}
              />
            </div>
          ) : (
            <div>
              <label className="label">ژمارەی کاتژمێر *</label>
              <input
                type="number"
                min={0.5}
                step={0.5}
                className="input-field"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="label">هۆکار / تێبینی</label>
            <textarea
              className="input-field min-h-[70px]"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="بۆ نموونە: نەخۆشی، کەسی، ..."
            />
          </div>

          <button
            onClick={save}
            disabled={saving || !form.employeeId || !form.date}
            className="btn-primary w-full"
          >
            {saving ? "پاشەکەوت..." : "پاشەکەوتکردن"}
          </button>
        </div>
      </Modal>
    </PageLayout>
  );
}
