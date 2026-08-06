"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Modal } from "@/components/Modal";
import { EmployeeAutocomplete } from "@/components/EmployeeAutocomplete";
import { api } from "@/lib/api-client";
import { Pencil, Trash2, UserPlus, Store } from "lucide-react";

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
  marketIds?: string[];
  departmentId?: string | null;
  positionId?: string | null;
  managerId?: string | null;
  notes?: string | null;
  isActive: boolean;
  markets?: Ref[];
  market?: Ref | null;
  marketNames?: string;
  department?: Ref | null;
  position?: Ref | null;
  manager?: Ref | null;
}

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  employeeCode: "",
  marketIds: [] as string[],
  departmentId: "",
  positionId: "",
  managerId: "",
  notes: "",
};

function marketLabel(e: Employee) {
  if (e.marketNames) return e.marketNames;
  if (e.markets?.length) return e.markets.map((m) => m.name).join(" · ");
  return e.market?.name || "";
}

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
      marketIds: e.marketIds?.length
        ? e.marketIds
        : e.markets?.map((m) => m.id) || (e.market ? [e.market.id] : []),
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

  function toggleMarket(id: string) {
    setForm((prev) => ({
      ...prev,
      marketIds: prev.marketIds.includes(id)
        ? prev.marketIds.filter((mid) => mid !== id)
        : [...prev.marketIds, id],
    }));
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
        marketIds: form.marketIds,
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
          e.employeeCode?.toLowerCase().includes(q) ||
          marketLabel(e).toLowerCase().includes(q)
      )
    );
  }

  return (
    <PageLayout
      title="کارمەندان"
      subtitle="ناو بنووسە → هەڵبژێرە → چەند مارکێت بۆ کارمەند زیاد بکە"
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
        onSelect={(emp) => {
          setSearch(emp.name);
          fillFromEmployee(emp as Employee);
        }}
        placeholder="ناوی کارمەند بنووسە بۆ هەڵبژاردن..."
      />

      <div className="space-y-2">
        {employees.map((e) => (
          <div
            key={e.id}
            role="button"
            tabIndex={0}
            onClick={() => fillFromEmployee(e)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter" || ev.key === " ") fillFromEmployee(e);
            }}
            className="card flex w-full cursor-pointer items-start justify-between gap-3 text-right transition hover:border-brand-200 hover:shadow-md"
          >
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-900">{e.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                {[e.position?.name, e.department?.name].filter(Boolean).join(" · ") || "هێشتا دابەش نەکراوە"}
              </p>
              {marketLabel(e) && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(e.markets?.length ? e.markets : marketLabel(e).split(" · ").map((name, i) => ({ id: String(i), name }))).map(
                    (m) => (
                      <span
                        key={m.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800"
                      >
                        <Store size={11} />
                        {m.name}
                      </span>
                    )
                  )}
                </div>
              )}
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
                  fillFromEmployee(e);
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
            <label className="label">مارکێتەکان (دەتوانیت چەند دانە هەڵبژێریت)</label>
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
              {markets.map((m) => {
                const checked = form.marketIds.includes(m.id);
                return (
                  <label
                    key={m.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                      checked
                        ? "border-brand-300 bg-white shadow-sm"
                        : "border-transparent bg-transparent hover:bg-white/70"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-brand-700"
                      checked={checked}
                      onChange={() => toggleMarket(m.id)}
                    />
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
                      <Store size={14} className="text-amber-700" />
                      {m.name}
                    </span>
                  </label>
                );
              })}
              {!markets.length && (
                <p className="text-xs text-slate-400">سەرەتا مارکێتێک زیاد بکە</p>
              )}
              {form.marketIds.length > 0 && (
                <p className="pt-1 text-[11px] font-medium text-brand-700">
                  {form.marketIds.length} مارکێت هەڵبژێردراوە
                </p>
              )}
            </div>
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
