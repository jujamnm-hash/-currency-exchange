"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search, UserRound } from "lucide-react";

export type EmployeeSuggestion = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  employeeCode?: string | null;
  market?: { name: string } | null;
  department?: { name: string } | null;
  position?: { name: string } | null;
};

interface EmployeeAutocompleteProps {
  value: string;
  employees: EmployeeSuggestion[];
  onChange: (value: string) => void;
  onSelect: (employee: EmployeeSuggestion) => void;
  placeholder?: string;
  label?: string;
  excludeId?: string | null;
  autoFocus?: boolean;
  className?: string;
}

export function EmployeeAutocomplete({
  value,
  employees,
  onChange,
  onSelect,
  placeholder = "ناوی کارمەند بنووسە...",
  label,
  excludeId,
  autoFocus,
  className = "",
}: EmployeeAutocompleteProps) {
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    const pool = employees.filter((e) => e.id !== excludeId);
    if (!q) return pool.slice(0, 8);
    return pool
      .filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.phone?.includes(q) ||
          e.employeeCode?.toLowerCase().includes(q) ||
          e.position?.name?.toLowerCase().includes(q) ||
          e.market?.name?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [employees, excludeId, value]);

  useEffect(() => {
    setActiveIndex(0);
  }, [suggestions]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(emp: EmployeeSuggestion) {
    onSelect(emp);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || !suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input-field pr-10"
          value={value}
          autoFocus={autoFocus}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
      </div>

      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-2xl border border-slate-200 bg-white py-1 shadow-xl"
        >
          {suggestions.map((emp, idx) => {
            const active = idx === activeIndex;
            return (
              <li key={emp.id} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={`flex w-full items-start gap-3 px-3 py-2.5 text-right transition ${
                    active ? "bg-brand-50" : "hover:bg-slate-50"
                  }`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => pick(emp)}
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-800">
                    <UserRound size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-slate-900">{emp.name}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {[emp.position?.name, emp.department?.name, emp.market?.name]
                        .filter(Boolean)
                        .join(" · ") || "بێ وردەکاری"}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-slate-400">
                      {[emp.employeeCode, emp.phone].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {open && value.trim() && !suggestions.length && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-400 shadow-xl">
          هیچ کارمەندێک بەم ناوە نەدۆزرایەوە — دەتوانیت وەک نوێ پاشەکەوتی بکەیت
        </div>
      )}
    </div>
  );
}
