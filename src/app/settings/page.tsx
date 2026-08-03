"use client";

import { useRef, useState } from "react";
import {
  clearAll,
  exportJson,
  importJson,
} from "@/lib/debt-db";
import { useDebtDb } from "@/lib/use-debt-db";

export default function SettingsPage() {
  const { refresh } = useDebtDb();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");

  function doExport() {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qarzname-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg("باکئاپ داگیرا");
  }

  function onImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importJson(String(reader.result || ""));
      if (ok) {
        refresh();
        setMsg("داتا هێنرایەوە بە سەرکەوتوویی");
      } else {
        setMsg("فایلی نادروست");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="animate-fade-up">
      <div className="hero-brand">
        <h1>ڕێکخستن</h1>
        <p>باکئاپ، هێنانەوە، و دامەزراندن لەسەر ئایپاد.</p>
      </div>

      <div className="panel form-grid mb-4">
        <h2 className="m-0 font-display text-xl">داتا</h2>
        <p className="m-0 text-ink-400 text-sm leading-relaxed">
          هەموو قەرز و کەسەکان لەسەر ئایپادەکەت دەمێننەوە (localStorage). باکئاپ بکە بۆ پاراستن.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="btn btn-primary" onClick={doExport}>داگرتنی باکئاپ</button>
          <button className="btn btn-secondary" onClick={() => fileRef.current?.click()}>
            هێنانەوەی باکئاپ
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImportFile(f);
              e.target.value = "";
            }}
          />
        </div>
        <button
          className="btn btn-danger w-fit"
          onClick={() => {
            if (confirm("هەموو داتا بسڕدرێتەوە؟ ئەمە ناگەڕێتەوە.")) {
              clearAll();
              refresh();
              setMsg("هەموو داتا سڕایەوە");
            }
          }}
        >
          سڕینەوەی هەموو داتا
        </button>
        {msg && <p className="m-0 text-mint-700 font-semibold">{msg}</p>}
      </div>

      <div className="panel form-grid">
        <h2 className="m-0 font-display text-xl">دامەزراندن لەسەر ئایپاد</h2>
        <ol className="m-0 pr-5 text-ink-600 leading-8">
          <li>لە <strong>Safari</strong> ئەم ماڵپەڕە بکەرەوە</li>
          <li>کرتە لە دوگمەی <strong>Share</strong> (⬆️) بکە</li>
          <li>
            <strong>Add to Home Screen</strong> هەڵبژێرە
          </li>
          <li>ناو: <strong>قەرزنامە</strong> — Add دابگرە</li>
        </ol>
        <p className="m-0 text-sm text-ink-400 leading-relaxed">
          بۆ ئەپی ڕاستەقینەی App Store / Xcode، بڕوانە فایلی{" "}
          <code className="text-mint-700">IPAD-BUILD-GUIDE.md</code> لە پڕۆژەکە.
        </p>
      </div>
    </div>
  );
}
