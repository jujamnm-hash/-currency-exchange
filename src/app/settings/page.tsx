"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { api } from "@/lib/api-client";

export default function SettingsPage() {
  const [orgName, setOrgName] = useState("");
  const [orgSubtitle, setOrgSubtitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.settings().then((s) => {
      setOrgName(s.org_name || "هەیکەلی ئیداری");
      setOrgSubtitle(s.org_subtitle || "سیستەمی ڕێکخستنی کارمەندان");
    });
  }, []);

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      await api.updateSettings({
        org_name: orgName,
        org_subtitle: orgSubtitle,
      });
      setMessage("پاشەکەوت کرا");
    } finally {
      setSaving(false);
    }
  }

  async function resetData() {
    if (!confirm("هەموو داتاکان دەگەڕێنەوە بۆ نموونەی سەرەتایی. دڵنیایت؟")) return;
    await api.reset();
    setMessage("داتا ڕیسێت کرا — پەڕەکە نوێ بکەرەوە");
    window.location.reload();
  }

  return (
    <PageLayout title="ڕێکخستنەکان" subtitle="ناوی ڕێکخراو و ڕێکخستنی گشتی">
      <div className="card max-w-xl space-y-4">
        <div>
          <label className="label">ناوی ڕێکخراو / هەیکەل</label>
          <input className="input-field" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
        </div>
        <div>
          <label className="label">ژێرنووس</label>
          <input className="input-field" value={orgSubtitle} onChange={(e) => setOrgSubtitle(e.target.value)} />
        </div>
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? "پاشەکەوت..." : "پاشەکەوتکردن"}
        </button>
        {message && <p className="text-sm text-brand-700">{message}</p>}
      </div>

      <div className="card mt-4 max-w-xl">
        <h3 className="mb-2 font-bold text-slate-800">داتا</h3>
        <p className="mb-3 text-sm text-slate-500">
          لەسەر Vercel داتاکان لە داتابەیسی Neon Postgres پاشەکەوت دەبن. بۆ کارکردنی ناوخۆیی بەبێ سێرڤەر
          دەتوانیت داتای ناوخۆیی ڕیسێت بکەیت.
        </p>
        <button onClick={resetData} className="btn-danger">
          ڕیسێتی داتای ناوخۆیی
        </button>
      </div>
    </PageLayout>
  );
}
