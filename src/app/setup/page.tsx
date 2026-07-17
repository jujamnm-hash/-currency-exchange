"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, AlertCircle, Loader2, Database } from "lucide-react";

interface SetupStatus {
  ok: boolean;
  status: string;
  message?: string;
  serviceCount?: number;
}

export default function SetupPage() {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [setting, setSetting] = useState(false);

  const checkStatus = () => {
    setLoading(true);
    fetch("/api/setup")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ ok: false, status: "error", message: "هەڵە لە پەیوەندی" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const runSetup = async () => {
    setSetting(true);
    try {
      const res = await fetch("/api/setup", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setStatus({ ok: true, status: "ready", serviceCount: data.serviceCount });
      } else {
        alert(data.error ?? "هەڵەیەک ڕوویدا");
      }
    } catch {
      alert("هەڵە لە ڕێکخستن");
    } finally {
      setSetting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="card text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
          <Database size={32} />
        </div>
        <h1 className="text-xl font-bold text-gray-900">ڕێکخستنی غەسلی هەولێر</h1>
        <p className="mt-2 text-sm text-gray-500">دامەزراندن و ڕێکخستنی داتابەیس</p>

        {loading ? (
          <div className="mt-6 flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="animate-spin" size={20} />
            <span>پشکنین...</span>
          </div>
        ) : status?.status === "ready" ? (
          <div className="mt-6">
            <CheckCircle className="mx-auto text-green-500" size={48} />
            <p className="mt-3 font-medium text-green-700">سیستەم ئامادەیە!</p>
            <p className="text-sm text-gray-500">{status.serviceCount} خزمەتگوزاری دانراوە</p>
            <Link href="/dashboard" className="btn-primary mt-4 inline-flex">
              بڕۆ بۆ داشبۆرد
            </Link>
          </div>
        ) : status?.status === "no_database" ? (
          <div className="mt-6">
            <AlertCircle className="mx-auto text-yellow-500" size={48} />
            <p className="mt-3 font-medium text-yellow-700">داتابەیس دانەنراوە</p>
            <p className="mt-2 text-sm text-gray-500">{status.message}</p>
            <div className="mt-4 rounded-xl bg-gray-50 p-4 text-right text-xs text-gray-600">
              <p className="font-bold">هەنگاوەکان:</p>
              <p className="mt-2">١. Vercel Dashboard → Storage → Create Postgres</p>
              <p>٢. Connect to Project</p>
              <p>٣. Redeploy بکە</p>
              <p>٤. دووبارە ئەم پەڕەیە بکەرەوە</p>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <AlertCircle className="mx-auto text-brand-500" size={48} />
            <p className="mt-3 font-medium text-gray-700">داتابەیس پێویستی بە ڕێکخستن هەیە</p>
            <button
              onClick={runSetup}
              disabled={setting}
              className="btn-primary mt-4 w-full"
            >
              {setting ? "چاوەڕوانبە..." : "ڕێکخستنی داتابەیس"}
            </button>
            <button onClick={checkStatus} className="btn-secondary mt-2 w-full">
              دووبارە پشکنین
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
