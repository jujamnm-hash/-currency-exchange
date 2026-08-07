"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageLayout } from "@/components/PageLayout";
import { api } from "@/lib/api-client";
import { CalendarDays, Clock3, Users, FileText, Plus } from "lucide-react";

interface ReportEmployee {
  employee: {
    id: string;
    name: string;
    employeeCode?: string | null;
    position?: { name: string } | null;
    department?: { name: string } | null;
    marketNames?: string;
  };
  totalDays: number;
  totalHours: number;
  dayCount: number;
  hourCount: number;
  records: number;
}

interface ReportData {
  year: number;
  month: number;
  totalDays: number;
  totalHours: number;
  totalRecords: number;
  employeesWithLeave: number;
  byEmployee: ReportEmployee[];
  leaves: Array<{
    id: string;
    kind: "DAY" | "HOUR";
    date: string;
    days: number;
    hours: number;
    reason?: string | null;
    employee?: { name: string };
  }>;
}

const KU_MONTHS = [
  "کانوونی دووەم",
  "شوبات",
  "ئادار",
  "نیسان",
  "ئایار",
  "حوزەیران",
  "تەممووز",
  "ئاب",
  "ئەیلوول",
  "تشرینی یەکەم",
  "تشرینی دووەم",
  "کانوونی یەکەم",
];

export default function LeaveReportsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .leaveReport(year, month)
      .then((res) => setData(res as ReportData))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year, month]);

  const years = Array.from({ length: 6 }, (_, i) => now.getFullYear() - 2 + i);

  return (
    <PageLayout
      title="ڕاپۆرتی مۆڵەت"
      subtitle="پوختەی مانگانەی مۆڵەت بە ڕۆژ و بە کاتژمێر"
      action={
        <Link href="/leaves" className="btn-primary">
          <Plus size={16} />
          تۆماری مۆڵەت
        </Link>
      }
    >
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="card !p-3">
          <p className="text-[11px] text-slate-500">مانگ</p>
          <select
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {KU_MONTHS.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="card !p-3">
          <p className="text-[11px] text-slate-500">ساڵ</p>
          <select
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="card !p-3 md:col-span-2">
          <p className="text-[11px] text-slate-500">ماوەی ڕاپۆرت</p>
          <p className="mt-1 text-base font-bold text-slate-900">
            {KU_MONTHS[month - 1]} {year}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="card h-48 animate-pulse bg-slate-100" />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            <div className="card !p-3">
              <p className="mb-1 flex items-center gap-1 text-[11px] text-slate-500">
                <CalendarDays size={12} /> کۆی ڕۆژ
              </p>
              <p className="text-2xl font-bold text-sky-800">{data?.totalDays ?? 0}</p>
            </div>
            <div className="card !p-3">
              <p className="mb-1 flex items-center gap-1 text-[11px] text-slate-500">
                <Clock3 size={12} /> کۆی کاتژمێر
              </p>
              <p className="text-2xl font-bold text-amber-800">{data?.totalHours ?? 0}</p>
            </div>
            <div className="card !p-3">
              <p className="mb-1 flex items-center gap-1 text-[11px] text-slate-500">
                <Users size={12} /> کارمەندی مۆڵەتدار
              </p>
              <p className="text-2xl font-bold text-slate-900">{data?.employeesWithLeave ?? 0}</p>
            </div>
            <div className="card !p-3">
              <p className="mb-1 flex items-center gap-1 text-[11px] text-slate-500">
                <FileText size={12} /> ژمارەی تۆمار
              </p>
              <p className="text-2xl font-bold text-slate-900">{data?.totalRecords ?? 0}</p>
            </div>
          </div>

          <section className="card mb-4">
            <h3 className="mb-3 font-bold text-slate-800">پوختە بەپێی کارمەند</h3>
            <div className="space-y-2">
              {(data?.byEmployee || []).map((row) => (
                <div
                  key={row.employee.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5"
                >
                  <div>
                    <p className="font-bold text-slate-900">{row.employee.name}</p>
                    <p className="text-xs text-slate-500">
                      {[row.employee.position?.name, row.employee.department?.name, row.employee.employeeCode]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs font-semibold">
                    <span className="rounded-lg bg-sky-100 px-2 py-1 text-sky-800">{row.totalDays} ڕۆژ</span>
                    <span className="rounded-lg bg-amber-100 px-2 py-1 text-amber-800">
                      {row.totalHours} کاتژمێر
                    </span>
                    <span className="rounded-lg bg-white px-2 py-1 text-slate-500">{row.records} تۆمار</span>
                  </div>
                </div>
              ))}
              {!data?.byEmployee?.length && (
                <p className="text-center text-sm text-slate-400">بۆ ئەم مانگە ڕاپۆرت نییە</p>
              )}
            </div>
          </section>

          <section className="card">
            <h3 className="mb-3 font-bold text-slate-800">وردەکاری تۆمارەکان</h3>
            <div className="space-y-2">
              {(data?.leaves || []).map((l) => (
                <div
                  key={l.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{l.employee?.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {l.date}
                      {l.reason ? ` · ${l.reason}` : ""}
                    </p>
                  </div>
                  {l.kind === "DAY" ? (
                    <span className="rounded-lg bg-sky-50 px-2 py-1 text-xs font-bold text-sky-800">
                      {l.days} ڕۆژ
                    </span>
                  ) : (
                    <span className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">
                      {l.hours} کاتژمێر
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </PageLayout>
  );
}
