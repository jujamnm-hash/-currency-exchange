"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Modal } from "@/components/Modal";
import { api } from "@/lib/api-client";
import { Pencil, Trash2, Plus, Briefcase } from "lucide-react";

interface Position {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  departmentId?: string | null;
  level: number;
  isActive: boolean;
  department?: { id: string; name: string } | null;
}

interface Department {
  id: string;
  name: string;
}

const empty = { name: "", code: "", description: "", departmentId: "", level: "2" };

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Position | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [pos, deps] = await Promise.all([api.positions(), api.departments()]);
    setPositions(pos as Position[]);
    setDepartments(deps);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }

  function openEdit(p: Position) {
    setEditing(p);
    setForm({
      name: p.name,
      code: p.code || "",
      description: p.description || "",
      departmentId: p.departmentId || "",
      level: String(p.level ?? 2),
    });
    setOpen(true);
  }

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code || undefined,
        description: form.description || undefined,
        departmentId: form.departmentId || null,
        level: Number(form.level) || 1,
      };
      if (editing) await api.updatePosition(editing.id, payload);
      else await api.createPosition(payload);
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("دڵنیایت لە سڕینەوەی ئەم پۆستە؟")) return;
    await api.deletePosition(id);
    await load();
  }

  return (
    <PageLayout
      title="پۆستەکان"
      subtitle="پۆست و پلەکان دروست بکە و بە کارمەندان دابەشیان بکە"
      action={
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} />
          پۆستی نوێ
        </button>
      }
    >
      <div className="space-y-2">
        {positions.map((p) => (
          <div key={p.id} className="card flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                <Briefcase size={18} />
              </div>
              <div>
                <p className="font-bold text-slate-900">{p.name}</p>
                <p className="text-xs text-slate-500">
                  {[p.code, p.department?.name, `ئاست ${p.level}`].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <Pencil size={15} />
              </button>
              <button onClick={() => remove(p.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {!positions.length && (
          <div className="card text-center text-sm text-slate-400">هیچ پۆستێک زیاد نەکراوە</div>
        )}
      </div>

      <Modal open={open} title={editing ? "دەستکاری پۆست" : "پۆستی نوێ"} onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <div>
            <label className="label">ناوی پۆست *</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">کۆد</label>
              <input className="input-field" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <div>
              <label className="label">ئاست (١-٥)</label>
              <input
                type="number"
                min={1}
                max={5}
                className="input-field"
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
              />
            </div>
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
            <label className="label">وەسف</label>
            <textarea className="input-field min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <button onClick={save} disabled={saving || !form.name.trim()} className="btn-primary w-full">
            {saving ? "پاشەکەوت..." : "پاشەکەوتکردن"}
          </button>
        </div>
      </Modal>
    </PageLayout>
  );
}
