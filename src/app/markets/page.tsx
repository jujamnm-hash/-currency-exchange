"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Modal } from "@/components/Modal";
import { api } from "@/lib/api-client";
import { Pencil, Trash2, Plus, Store } from "lucide-react";

interface Market {
  id: string;
  name: string;
  code?: string | null;
  location?: string | null;
  description?: string | null;
  isActive: boolean;
}

const empty = { name: "", code: "", location: "", description: "" };

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Market | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    setMarkets(await api.markets());
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }

  function openEdit(m: Market) {
    setEditing(m);
    setForm({
      name: m.name,
      code: m.code || "",
      location: m.location || "",
      description: m.description || "",
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
        location: form.location || undefined,
        description: form.description || undefined,
      };
      if (editing) await api.updateMarket(editing.id, payload);
      else await api.createMarket(payload);
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("دڵنیایت لە سڕینەوەی ئەم مارکێتە؟")) return;
    await api.deleteMarket(id);
    await load();
  }

  return (
    <PageLayout
      title="مارکێتەکان"
      subtitle="ناوی مارکێتەکانت زیاد بکە و کارمەندانیان دابەش بکە"
      action={
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} />
          مارکێتی نوێ
        </button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {markets.map((m) => (
          <div key={m.id} className="card">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <Store size={18} />
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(m)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                  <Pencil size={15} />
                </button>
                <button onClick={() => remove(m.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-slate-900">{m.name}</h3>
            <p className="mt-1 text-xs text-slate-500">
              {[m.code, m.location].filter(Boolean).join(" · ") || "بێ ناونیشان"}
            </p>
            {m.description && <p className="mt-2 text-sm text-slate-600">{m.description}</p>}
          </div>
        ))}
        {!markets.length && (
          <div className="card col-span-full text-center text-sm text-slate-400">هیچ مارکێتێک زیاد نەکراوە</div>
        )}
      </div>

      <Modal open={open} title={editing ? "دەستکاری مارکێت" : "مارکێتی نوێ"} onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <div>
            <label className="label">ناوی مارکێت *</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">کۆد</label>
              <input className="input-field" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <div>
              <label className="label">شوێن</label>
              <input className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
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
