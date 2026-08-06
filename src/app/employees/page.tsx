"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Modal } from "@/components/Modal";
import { api } from "@/lib/api-client";
import { Pencil, Trash2, Search, UserPlus } from "lucide-react";

interface Ref {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  employeeCode?: string | null;
  marketId?: string | null;
  departmentId?: string | null;
  positionId?: string | null;
  managerId?: string | null;
  notes?: string | null;
  isActive: boolean;
  market?: Ref | null;
  department?: Ref | null;
  position?: Ref | null;
  manager?: Ref | null;
}

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  employeeCode: "",
  marketId: "",
  departmentId: "",
  positionId: "",
  managerId: "",
  notes: "",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [markets, setMarkets] = useState<Ref[]>([]);
  const [departments, setDepartments] = useState<Ref[]>([]);
  const [positions, setPositions] = useState<Ref[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load(q?: string) {
    const [emps, mkts, deps, pos] = await Promise.all([
      api.employees(q),
      api.markets(),
      api.departments(),
      api.positions(),
    ]);
    setEmployees(emps as Employee[]);
    setMarkets(mkts);
    setDepartments(deps);
    setPositions(pos);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(e: Employee) {
    setEditing(e);
    setForm({
      name: e.name,
      phone: e.phone || "",
      email: e.email || "",
      employeeCode: e.employeeCode || "",
      marketId: e.marketId || "",
      departmentId: e.departmentId || "",
      positionId: e.positionId || "",
      managerId: e.managerId || "",
      notes: e.notes || "",
    });
    setOpen(true);
  }

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone || undefined,
        email: form.email || undefined,
        employeeCode: form.employeeCode || undefined,
        marketId: form.marketId || null,
        departmentId: form.departmentId || null,
        positionId: form.positionId || null,
        managerId: form.managerId || null,
        notes: form.notes || undefined,
      };
      if (editing) await api.updateEmployee(editing.id, payload);
      else await api.createEmployee(payload);
      setOpen(false);
      await load(search || undefined);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("دڵنیایت لە سڕینەوەی ئەم کارمەندە؟")) return;
    await api.deleteEmployee(id);
    await load(search || undefined);
  }

  async function onSearch(value: string) {
    setSearch(value);
    await load(value || undefined);
  }

  return (
    <PageLayout
      title="کارمەندان"
      subtitle="دروستکردن و دابەشکردنی کارمەند بە مارکێت، بەش و پۆست"
      action={
        <button onClick={openCreate} className="btn-primary">
          <UserPlus size={16} />
          زیادکردن
        </button>
      }
    >
      <div className="mb-4 relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input-field pr-10"
          placeholder="گەڕان بە ناو، کۆد یان مۆبایل..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        {employees.map((e) => (
          <div key={e.id} className="card flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-slate-900">{e.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                {[e.position?.name, e.department?.name, e.market?.name].filter(Boolean).join(" · ") || "هێشتا دابەش نەکراوە"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
                {e.employeeCode && <span>کۆد: {e.employeeCode}</span>}
                {e.phone && <span>{e.phone}</span>}
                {e.manager && <span>سەرپەرشتیار: {e.manager.name}</span>}
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => openEdit(e)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <Pencil size={16} />
              </button>
              <button onClick={() => remove(e.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {!employees.length && (
          <div className="card text-center text-sm text-slate-400">هیچ کارمەندێک نەدۆزرایەوە</div>
        )}
      </div>

      <Modal open={open} title={editing ? "دەستکاری کارمەند" : "کارمەندی نوێ"} onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <div>
            <label className="label">ناو *</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">کۆدی کارمەند</label>
              <input className="input-field" value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} />
            </div>
            <div>
              <label className="label">مۆبایل</label>
              <input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">ئیمەیڵ</label>
            <input className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">مارکێت</label>
            <select className="input-field" value={form.marketId} onChange={(e) => setForm({ ...form, marketId: e.target.value })}>
              <option value="">— هەڵبژێرە —</option>
              {markets.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">بەشی ئیداری</label>
            <select className="input-field" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
              <option value="">— هەڵبژێرە —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">پۆست</label>
            <select className="input-field" value={form.positionId} onChange={(e) => setForm({ ...form, positionId: e.target.value })}>
              <option value="">— هەڵبژێرە —</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">سەرپەرشتیار</label>
            <select className="input-field" value={form.managerId} onChange={(e) => setForm({ ...form, managerId: e.target.value })}>
              <option value="">— هەڵبژێرە —</option>
              {employees
                .filter((e) => e.id !== editing?.id)
                .map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
            </select>
          </div>
          <div>
            <label className="label">تێبینی</label>
            <textarea className="input-field min-h-[80px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button onClick={save} disabled={saving || !form.name.trim()} className="btn-primary w-full">
            {saving ? "پاشەکەوت..." : "پاشەکەوتکردن"}
          </button>
        </div>
      </Modal>
    </PageLayout>
  );
}
