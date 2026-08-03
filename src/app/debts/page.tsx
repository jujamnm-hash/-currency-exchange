"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDebtDb } from "@/lib/use-debt-db";
import { formatIQD, formatShortDate } from "@/lib/format";
import type { DebtStatus, DebtType } from "@/lib/debt-db";

type Filter = "all" | DebtType | DebtStatus;

export default function DebtsPage() {
  const { db, ready } = useDebtDb();
  const [filter, setFilter] = useState<Filter>("all");
  const peopleMap = useMemo(
    () => new Map(db.people.map((p) => [p.id, p])),
    [db.people]
  );

  const debts = useMemo(() => {
    let list = [...db.debts];
    if (filter === "owed_to_me" || filter === "i_owe") {
      list = list.filter((d) => d.type === filter);
    } else if (filter === "open" || filter === "partial" || filter === "paid") {
      list = list.filter((d) => d.status === filter);
    }
    return list;
  }, [db.debts, filter]);

  if (!ready) return <div className="empty">بارکردن...</div>;

  const chips: { id: Filter; label: string }[] = [
    { id: "all", label: "هەموو" },
    { id: "owed_to_me", label: "بۆ من" },
    { id: "i_owe", label: "لە من" },
    { id: "open", label: "کراوە" },
    { id: "partial", label: "بەشی پارەدراو" },
    { id: "paid", label: "تەواو" },
  ];

  return (
    <div className="animate-fade-up">
      <div className="hero-brand">
        <h1>قەرزەکان</h1>
        <p>هەموو تۆمارەکان بە فلتەر و گەڕان.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`pill ${filter === c.id ? "pill-mint" : "pill-muted"}`}
            style={{ minHeight: "2.2rem", cursor: "pointer", border: "none" }}
            onClick={() => setFilter(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="panel">
        {debts.length === 0 ? (
          <div className="empty">
            هیچ قەرزێک نییە
            <div className="mt-4">
              <Link href="/new-debt/" className="btn btn-primary">قەرزی نوێ</Link>
            </div>
          </div>
        ) : (
          debts.map((debt) => {
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
                  <div className="mt-1 flex flex-col items-end gap-1">
                    <span className={`pill ${debt.type === "owed_to_me" ? "pill-mint" : "pill-copper"}`}>
                      {debt.type === "owed_to_me" ? "بۆ من" : "لە من"}
                    </span>
                    <span className="pill pill-muted">
                      {debt.status === "paid" ? "تەواو" : debt.status === "partial" ? "بەشی پارەدراو" : "کراوە"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
