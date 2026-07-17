"use client";

import { Droplets } from "lucide-react";

export function Header() {
  const now = new Date().toLocaleDateString("ku-IQ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md">
            <Droplets size={22} />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 md:text-lg">غەسلی هەولێر</h1>
            <p className="text-[10px] text-gray-500 md:text-xs">Ghassle Hawler Car Wash</p>
          </div>
        </div>
        <div className="text-left">
          <p className="text-[10px] text-gray-400 md:text-xs">{now}</p>
        </div>
      </div>
    </header>
  );
}
