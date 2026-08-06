"use client";

import { Building2 } from "lucide-react";

export function Header() {
  const now = new Date().toLocaleDateString("ku-IQ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-white shadow-md shadow-brand-200">
            <Building2 size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 md:text-lg">هەیکەلی ئیداری</h1>
            <p className="text-[10px] text-slate-500 md:text-xs">سیستەمی ڕێکخستنی کارمەندان</p>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 md:text-xs">{now}</p>
      </div>
    </header>
  );
}
