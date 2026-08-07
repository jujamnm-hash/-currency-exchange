"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Modal } from "@/components/Modal";
import { api } from "@/lib/api-client";
import { buildDepartmentTree } from "@/lib/utils";
import { Pencil, Trash2, Plus, ChevronLeft } from "lucide-react";

interface Department {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  parentId?: string | null;
  isActive: boolean;
}

const empty = { name: "", code: "", description: "", parentId: "" };

export default function StructurePage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    setDepartments(await api.departments());
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  function openCreate(parentId?: string) {
    setEditing(null);
    setForm({ ...empty, parentId: parentId || "" });
    setOpen(true);
  }

  function openEdit(d: Department) {
    setEditing(d);
    setForm({
      name: d.name,
      code: d.code || "",
      description: d.description || "",
      parentId: d.parentId || "",
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
        parentId: form.parentId || null,
      };
      if (editing) await api.updateDepartment(editing.id, payload);
      else await api.createDepartment(payload);
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("دڵنیایت لە سڕینەوەی ئەم بەشە؟")) return;
    await api.deleteDepartment(id);
    await load();
  }

  const tree = buildDepartmentTree(departments);

  function renderNode(node: (typeof tree)[0], depth = 0) {
    return (
      <div key={node.id} className="space-y-2">
        <div
          className="card flex items-center justify-between gap-3"
          style={{ marginInlineStart: depth * 16 }}
        >
          <div className="flex items-center gap-2">
            {depth > 0 && <ChevronLeft size={14} className="text-slate-300" />}
            <div>
              <p className="font-bold text-slate-900">{node.name}</p>
              <p className="text-xs text-slate-500">
                {[node.code, node.description].filter(Boolean).join(" · ") || "بەشی ئیداری"}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => openCreate(node.id)}
              className="rounded-lg p-2 text-brand-700 hover:bg-brand-50"
              title="ژێربەش زیاد بکە"
            >
              <Plus size={15} />
            </button>
            <button onClick={() => openEdit(node)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
              <Pencil size={15} />
            </button>
            <button onClick={() => remove(node.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
        {node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  }

  return (
    <PageLayout
      title="هەیکەلی ئیداری"
      subtitle="ناوی بەش و یەکەکانی ئیدارەی خۆت زیاد بکە"
      action={
        <button onClick={() => openCreate()} className="btn-primary">
          <Plus size={16} />
          بەشی نوێ
        </button>
      }
    >
      <div className="space-y-2">
        {tree.map((node) => renderNode(node))}
        {!departments.length && (
          <div className="card text-center text-sm text-slate-400">هیچ بەشێکی ئیداری زیاد نەکراوە</div>
        )}
      </div>

      <Modal open={open} title={editing ? "دەستکاری بەش" : "بەشی ئیداری نوێ"} onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <div>
            <label className="label">ناوی بەش *</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">کۆد</label>
            <input className="input-field" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </div>
          <div>
            <label className="label">سەربەش (باوان)</label>
            <select className="input-field" value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
              <option value="">— سەرەکی —</option>
              {departments
                .filter((d) => d.id !== editing?.id)
                .map((d) => (
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
