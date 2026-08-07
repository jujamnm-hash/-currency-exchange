"use client";

import { useEffect, useMemo, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Modal } from "@/components/Modal";
import { EmployeeAutocomplete } from "@/components/EmployeeAutocomplete";
import { api } from "@/lib/api-client";
import { ClipboardList, Clock3, Pencil, Plus, Store, Trash2 } from "lucide-react";

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

interface DailyWorkRow {
  id: string;
  employeeId: string;
  marketId?: string | null;
  date: string;
  title: string;
  description?: string | null;
  hours: number;
  employee?: Employee;
  market?: Ref | null;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function DailyWorksPage() {
  const [date, setDate] = useState(todayISO());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [markets, setMarkets] = useState<Ref[]>([]);
  const [works, setWorks] = useState<DailyWorkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DailyWorkRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [form, setForm] = useState({
    employeeId: "",
    marketId: "",
    date: todayISO(),
    title: "",
    description: "",
    hours: "1",
  });

  async function load(selectedDate = date) {
    setLoading(true);
    try {
      const [emps, mkts, rows] = await Promise.all([
        api.employees(),
        api.markets(),
        api.dailyWorks({ date: selectedDate }),
      ]);
      setEmployees(emps as Employee[]);
      setMarkets(mkts);
      setWorks(rows as DailyWorkRow[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(date).catch(console.error);
  }, [date]);

  const totals = useMemo(
    () => ({
      count: works.length,
      hours: works.reduce((s, w) => s + (w.hours || 0), 0),
      people: new Set(works.map((w) => w.employeeId)).size,
    }),
    [works]
  );

  const selectedEmployee = employees.find((e) => e.id === form.employeeId);
  const employeeMarkets = selectedEmployee?.markets?.length
    ? selectedEmployee.markets
    : markets;

  function openCreate() {
    setEditing(null);
    setSearchName("");
    setForm({
      employeeId: "",
      marketId: "",
      date,
      title: "",
      description: "",
      hours: "1",
    });
    setOpen(true);
  }

  function openEdit(row: DailyWorkRow) {
    setEditing(row);
    setSearchName(row.employee?.name || "");
    setForm({
      employeeId: row.employeeId,
      marketId: row.marketId || "",
      date: row.date.slice(0, 10),
      title: row.title,
      description: row.description || "",
      hours: String(row.hours || 0),
    });
    setOpen(true);
  }

  async function save() {
    if (!form.employeeId || !form.date || !form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        employeeId: form.employeeId,
        marketId: form.marketId || null,
        date: form.date,
        title: form.title.trim(),
        description: form.description || undefined,
        hours: Number(form.hours) || 0,
      };
      if (editing) await api.updateDailyWork(editing.id, payload);
      else await api.createDailyWork(payload);
      setOpen(false);
      if (form.date !== date) setDate(form.date);
      else await load(form.date);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("دڵنیایت لە سڕینەوەی ئەم تۆمارە؟")) return;
    await api.deleteDailyWork(id);
    await load(date);
  }

  return (
    <PageLayout
      title="کاری ڕۆژانە"
      subtitle="تۆماری ئەو کارانەی کارمەند لە ڕۆژێکدا کردوویەتی"
      action={
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} />
          تۆماری نوێ
        </button>
      }
    >
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="card !p-3 col-span-2 md:col-span-1">
          <p className="text-[11px] text-slate-500">بەروار</p>
          <input
            type="date"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="card !p-3">
          <p className="mb-1 flex items-center gap-1 text-[11px] text-slate-500">
            <ClipboardList size={12} /> تۆمار
          </p>
          <p className="text-xl font-bold text-slate-900">{totals.count}</p>
        </div>
        <div className="card !p-3">
          <p className="mb-1 text-[11px] text-slate-500">کارمەند</p>
          <p className="text-xl font-bold text-slate-900">{totals.people}</p>
        </div>
        <div className="card !p-3">
          <p className="mb-1 flex items-center gap-1 text-[11px] text-slate-500">
            <Clock3 size={12} /> کاتژمێر
          </p>
          <p className="text-xl font-bold text-brand-800">{totals.hours}</p>
        </div>
      </div>

      {loading ? (
        <div className="card h-40 animate-pulse bg-slate-100" />
      ) : (
        <div className="space-y-2">
          {works.map((w) => (
            <div key={w.id} className="card flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-slate-900">{w.employee?.name || "—"}</p>
                  {w.hours > 0 && (
                    <span className="rounded-lg bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-800">
                      {w.hours} کاتژمێر
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-700">{w.title}</p>
                {w.description && (
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{w.description}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
                  <span>{w.date}</span>
                  {w.market?.name && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-amber-800">
                      <Store size={10} />
                      {w.market.name}
                    </span>
                  )}
                  {w.employee?.position?.name && <span>{w.employee.position.name}</span>}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(w)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                  <Pencil size={16} />
                </button>
                <button onClick={() => remove(w.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {!works.length && (
            <div className="card text-center text-sm text-slate-400">
              بۆ ئەم ڕۆژە هیچ کارێک تۆمار نەکراوە
            </div>
          )}
        </div>
      )}

      <Modal
        open={open}
        title={editing ? "دەستکاری کاری ڕۆژانە" : "تۆماری کاری ڕۆژانە"}
        onClose={() => setOpen(false)}
      >
        <div className="space-y-3">
          <EmployeeAutocomplete
            label="کارمەند *"
            value={searchName}
            employees={employees}
            onChange={setSearchName}
            onSelect={(emp) => {
              setSearchName(emp.name);
              const em = emp as Employee;
              setForm((f) => ({
                ...f,
                employeeId: emp.id,
                marketId: em.markets?.[0]?.id || f.marketId,
              }));
            }}
            placeholder="ناوی کارمەند بنووسە یان هەڵبژێرە..."
          />

          <div>
            <label className="label">بەروار *</label>
            <input
              type="date"
              className="input-field"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div>
            <label className="label">ناونیشانی کار / چی کردووە؟ *</label>
            <input
              className="input-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="بۆ نموونە: فرۆشتن، ڕێکخستنی کۆگا، سەردانی کڕیار..."
            />
          </div>

          <div>
            <label className="label">وردەکاری کار</label>
            <textarea
              className="input-field min-h-[90px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="باسی ئەو کارانە بکە کە ئەمڕۆ کردوویەتی..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">کاتژمێر</label>
              <input
                type="number"
                min={0}
                step={0.5}
                className="input-field"
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
              />
            </div>
            <div>
              <label className="label">مارکێت</label>
              <select
                className="input-field"
                value={form.marketId}
                onChange={(e) => setForm({ ...form, marketId: e.target.value })}
              >
                <option value="">— هەڵبژێرە —</option>
                {employeeMarkets.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={save}
            disabled={saving || !form.employeeId || !form.title.trim() || !form.date}
            className="btn-primary w-full"
          >
            {saving ? "پاشەکەوت..." : "پاشەکەوتکردن"}
          </button>
        </div>
      </Modal>
    </PageLayout>
  );
}
