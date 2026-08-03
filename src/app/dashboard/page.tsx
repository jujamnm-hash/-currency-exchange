"use client";

import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";
import { useDebtDb } from "@/lib/use-debt-db";
import { getTotals } from "@/lib/debt-db";
import { formatIQD, formatShortDate } from "@/lib/format";

export default function DashboardPage() {
  const { db, ready } = useDebtDb();
  const totals = getTotals(db);
  const recent = [...db.debts].slice(0, 8);
  const peopleMap = new Map(db.people.map((p) => [p.id, p]));

  if (!ready) {
    return <div className="empty">بارکردن...</div>;
  }

  return (
    <div className="animate-fade-up">
      <div className="hero-brand">
        <h1>قەرزنامە</h1>
        <p>تۆماری قەرزەکانت لە یەک شوێن — بۆ ئایپاد ئامادەکراوە و داتا لەسەر ئامێرەکەت دەمێنێتەوە.</p>
      </div>

      <div className="stat-grid">
        <div className="stat stat-owed animate-scale-in" style={{ animationDelay: "40ms" }}>
          <span className="stat-label">قەرزی کەسان لای من</span>
          <span className="stat-value">{formatIQD(totals.owedToMe)}</span>
        </div>
        <div className="stat stat-owe animate-scale-in" style={{ animationDelay: "90ms" }}>
          <span className="stat-label">قەرزی من لای کەسان</span>
          <span className="stat-value">{formatIQD(totals.iOwe)}</span>
        </div>
        <div className="stat stat-net animate-scale-in" style={{ animationDelay: "140ms" }}>
          <span className="stat-label">باڵانسی گشتی</span>
          <span className="stat-value">{formatIQD(totals.net)}</span>
        </div>
      </div>

      <div className="section-head">
        <div>
          <h2>کردارە خێراکان</h2>
          <p>{totals.openCount} قەرزی کراوە · {totals.peopleCount} کەس</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/new-debt/" className="btn btn-primary w-full">
          <Plus size={18} /> قەرزی نوێ تۆمار بکە
        </Link>
        <Link href="/people/" className="btn btn-secondary w-full">
          بینینی کەسەکان
        </Link>
      </div>

      <div className="section-head">
        <div>
          <h2>دوایین قەرزەکان</h2>
          <p>نوێترین تۆمارەکان</p>
        </div>
        <Link href="/debts/" className="text-sm font-semibold text-mint-700 inline-flex items-center gap-1">
          هەموو <ArrowLeft size={16} />
        </Link>
      </div>

      <div className="panel">
        {recent.length === 0 ? (
          <div className="empty">
            هێشتا قەرز تۆمار نەکراوە.
            <div className="mt-4">
              <Link href="/new-debt/" className="btn btn-primary">
                یەکەم قەرز زیاد بکە
              </Link>
            </div>
          </div>
        ) : (
          recent.map((debt) => {
            const person = peopleMap.get(debt.personId);
            return (
              <Link key={debt.id} href={`/person/?id=${debt.personId}`} className="list-row">
                <div>
                  <p className="m-0 font-semibold">{person?.name ?? "کەسی نەناسراو"}</p>
                  <p className="m-0 mt-1 text-sm text-ink-400">
                    {debt.description || "بێ وەسف"} · {formatShortDate(debt.date)}
                  </p>
                </div>
                <div className="text-left">
                  <p className="m-0 font-semibold">{formatIQD(debt.remaining)}</p>
                  <span className={`pill ${debt.type === "owed_to_me" ? "pill-mint" : "pill-copper"}`}>
                    {debt.type === "owed_to_me" ? "بۆ من" : "لە من"}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
