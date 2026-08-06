"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Modal } from "@/components/Modal";
import { EmployeeAutocomplete } from "@/components/EmployeeAutocomplete";
import { api } from "@/lib/api-client";
import { Pencil, Trash2, UserPlus } from "lucide-react";

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
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [markets, setMarkets] = useState<Ref[]>([]);
  const [departments, setDepartments] = useState<Ref[]>([]);
  const [positions, setPositions] = useState<Ref[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [pickedHint, setPickedHint] = useState("");

  async function load(q?: string) {
    const [emps, all, mkts, deps, pos] = await Promise.all([
      api.employees(q),
      api.employees(),
      api.markets(),
      api.departments(),
      api.positions(),
    ]);
    setEmployees(emps as Employee[]);
    setAllEmployees(all as Employee[]);
    setMarkets(mkts);
    setDepartments(deps);
    setPositions(pos);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  function fillFromEmployee(e: Employee) {
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
    setPickedHint(`زانیاریەکانی «${e.name}» هاتنەوە`);
    setOpen(true);
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setPickedHint("");
    setOpen(true);
  }

  function openEdit(e: Employee) {
    fillFromEmployee(e);
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
      setPickedHint("");
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

  function onSearchChange(value: string) {
    setSearch(value);
    // debounce-ish: filter locally from allEmployees for snappy UX
    const q = value.trim().toLowerCase();
    if (!q) {
      setEmployees(allEmployees);
      return;
    }
    setEmployees(
      allEmployees.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.phone?.includes(q) ||
          e.employeeCode?.toLowerCase().includes(q)
      )
    );
  }

  function onPickFromSearch(emp: Employee) {
    setSearch(emp.name);
    fillFromEmployee(emp);
  }

  return (
    <PageLayout
      title="کارمەندان"
      subtitle="ناو بنووسە → لە لیست هەڵبژێرە → هەموو زانیاری دێتەوە"
      action={
        <button onClick={openCreate} className="btn-primary">
          <UserPlus size={16} />
          زیادکردن
        </button>
      }
    >
      <EmployeeAutocomplete
        className="mb-4"
        value={search}
        employees={allEmployees}
        onChange={onSearchChange}
        onSelect={(emp) => onPickFromSearch(emp as Employee)}
        placeholder="ناوی کارمەند بنووسە بۆ هەڵبژاردن..."
      />

      <div className="space-y-2">
        {employees.map((e) => (
          <div
            key={e.id}
            role="button"
            tabIndex={0}
            onClick={() => openEdit(e)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter" || ev.key === " ") openEdit(e);
            }}
            className="card flex w-full cursor-pointer items-start justify-between gap-3 text-right transition hover:border-brand-200 hover:shadow-md"
          >
            <div>
              <p className="font-bold text-slate-900">{e.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                {[e.position?.name, e.department?.name, e.market?.name].filter(Boolean).join(" · ") ||
                  "هێشتا دابەش نەکراوە"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
                {e.employeeCode && <span>کۆد: {e.employeeCode}</span>}
                {e.phone && <span>{e.phone}</span>}
                {e.manager && <span>سەرپەرشتیار: {e.manager.name}</span>}
              </div>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={(ev) => {
                  ev.stopPropagation();
                  openEdit(e);
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={(ev) => {
                  ev.stopPropagation();
                  remove(e.id);
                }}
                className="rounded-lg p-2 text-red-500 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {!employees.length && (
          <div className="card text-center text-sm text-slate-400">هیچ کارمەندێک نەدۆزرایەوە</div>
        )}
      </div>

      <Modal
        open={open}
        title={editing ? "زانیاری کارمەند" : "کارمەندی نوێ"}
        onClose={() => {
          setOpen(false);
          setPickedHint("");
        }}
      >
        <div className="space-y-3">
          {pickedHint && (
            <div className="rounded-xl bg-brand-50 px-3 py-2 text-xs font-medium text-brand-800">
              {pickedHint}
            </div>
          )}

          <EmployeeAutocomplete
            label="ناو *"
            value={form.name}
            employees={allEmployees}
            excludeId={editing?.id}
            onChange={(name) => {
              setForm({ ...form, name });
              setPickedHint("");
            }}
            onSelect={(emp) => fillFromEmployee(emp as Employee)}
            placeholder="ناو بنووسە یان لە لیست هەڵبژێرە..."
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">کۆدی کارمەند</label>
              <input
                className="input-field"
                value={form.employeeCode}
                onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
              />
            </div>
            <div>
              <label className="label">مۆبایل</label>
              <input
                className="input-field"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">ئیمەیڵ</label>
            <input
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
              {markets.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">بەشی ئیداری</label>
            <select
              className="input-field"
              value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
            >
              <option value="">— هەڵبژێرە —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">پۆست</label>
            <select
              className="input-field"
              value={form.positionId}
              onChange={(e) => setForm({ ...form, positionId: e.target.value })}
            >
              <option value="">— هەڵبژێرە —</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">سەرپەرشتیار</label>
            <select
              className="input-field"
              value={form.managerId}
              onChange={(e) => setForm({ ...form, managerId: e.target.value })}
            >
              <option value="">— هەڵبژێرە —</option>
              {allEmployees
                .filter((e) => e.id !== editing?.id)
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="label">تێبینی</label>
            <textarea
              className="input-field min-h-[80px]"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <button onClick={save} disabled={saving || !form.name.trim()} className="btn-primary w-full">
            {saving ? "پاشەکەوت..." : editing ? "نوێکردنەوەی زانیاری" : "پاشەکەوتکردن"}
          </button>
        </div>
      </Modal>
    </PageLayout>
  );
}
