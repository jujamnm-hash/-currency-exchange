"use client";

import Link from "next/link";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Trash2 } from "lucide-react";
import { useDebtDb } from "@/lib/use-debt-db";
import {
  addPayment,
  deleteDebt,
  deletePerson,
  getPersonBalance,
} from "@/lib/debt-db";
import { formatIQD, formatShortDate, parseAmount, todayISO } from "@/lib/format";
import { go } from "@/lib/paths";

function PersonDetailInner() {
  const search = useSearchParams();
  const id = search.get("id") || "";
  const { db, ready, refresh } = useDebtDb();
  const person = db.people.find((p) => p.id === id);
  const debts = useMemo(
    () => db.debts.filter((d) => d.personId === id),
    [db.debts, id]
  );
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");

  if (!ready) return <div className="empty">بارکردن...</div>;

  if (!id || !person) {
    return (
      <div className="empty">
        کەس نەدۆزرایەوە
        <div className="mt-4">
          <Link href="/people/" className="btn btn-secondary">گەڕانەوە</Link>
        </div>
      </div>
    );
  }

  const bal = getPersonBalance(person.id, db);

  function onPay(e: FormEvent) {
    e.preventDefault();
    if (!payingId) return;
    const amount = parseAmount(payAmount);
    if (amount <= 0) return;
    addPayment({ debtId: payingId, amount, note: payNote, date: todayISO() });
    setPayingId(null);
    setPayAmount("");
    setPayNote("");
    refresh();
  }

  return (
    <div className="animate-fade-up">
      <Link href="/people/" className="inline-flex items-center gap-2 text-mint-700 font-semibold mb-4">
        <ArrowRight size={18} /> گەڕانەوە بۆ کەسەکان
      </Link>

      <div className="hero-brand">
        <h1>{person.name}</h1>
        <p>
          {person.phone || "بێ ژمارەی مۆبایل"}
          {person.notes ? ` · ${person.notes}` : ""}
        </p>
      </div>

      <div className="stat-grid mb-4">
        <div className="stat stat-owed">
          <span className="stat-label">قەرزی ئەم کەسە لای من</span>
          <span className="stat-value">{formatIQD(bal.owedToMe)}</span>
        </div>
        <div className="stat stat-owe">
          <span className="stat-label">قەرزی من لای ئەم کەسە</span>
          <span className="stat-value">{formatIQD(bal.iOwe)}</span>
        </div>
        <div className="stat stat-net">
          <span className="stat-label">باڵانس</span>
          <span className="stat-value">{formatIQD(bal.net)}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <Link href={`/new-debt/?person=${person.id}`} className="btn btn-primary">
          قەرزی نوێ بۆ ئەم کەسە
        </Link>
        <button
          className="btn btn-danger"
          onClick={() => {
            if (confirm(`سڕینەوەی ${person.name} و هەموو قەرزەکانی؟`)) {
              deletePerson(person.id);
              go("/people/");
            }
          }}
        >
          <Trash2 size={16} /> سڕینەوەی کەس
        </button>
      </div>

      <div className="section-head">
        <div>
          <h2>قەرزەکان</h2>
          <p>{debts.length} تۆمار</p>
        </div>
      </div>

      <div className="panel">
        {debts.length === 0 ? (
          <div className="empty">هیچ قەرزێک بۆ ئەم کەسە نییە</div>
        ) : (
          debts.map((debt) => {
            const payments = db.payments.filter((p) => p.debtId === debt.id);
            return (
              <div key={debt.id} className="border-b border-ink-100/60 py-4 last:border-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`pill ${debt.type === "owed_to_me" ? "pill-mint" : "pill-copper"}`}>
                        {debt.type === "owed_to_me" ? "بۆ من" : "لە من"}
                      </span>
                      <span className="pill pill-muted">
                        {debt.status === "paid" ? "تەواو" : debt.status === "partial" ? "بەشی پارەدراو" : "کراوە"}
                      </span>
                    </div>
                    <p className="m-0 font-semibold text-lg">
                      {formatIQD(debt.remaining)} / {formatIQD(debt.amount)}
                    </p>
                    <p className="m-0 mt-1 text-sm text-ink-400">
                      {debt.description || "بێ وەسف"} · {formatShortDate(debt.date)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {debt.remaining > 0 && (
                      <button
                        className="btn btn-copper"
                        onClick={() => {
                          setPayingId(debt.id);
                          setPayAmount(String(debt.remaining));
                        }}
                      >
                        پارەدان
                      </button>
                    )}
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        if (confirm("ئەم قەرزە بسڕدرێتەوە؟")) {
                          deleteDebt(debt.id);
                          refresh();
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {payingId === debt.id && (
                  <form className="mt-3 form-grid animate-scale-in" onSubmit={onPay}>
                    <div className="form-grid two">
                      <div className="field">
                        <label>بڕی پارەدان</label>
                        <input
                          value={payAmount}
                          onChange={(e) => setPayAmount(e.target.value)}
                          inputMode="numeric"
                          required
                        />
                      </div>
                      <div className="field">
                        <label>تێبینی</label>
                        <input
                          value={payNote}
                          onChange={(e) => setPayNote(e.target.value)}
                          placeholder="ئارەزوومەندانە"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="btn btn-primary">
                        پاشەکەوتکردنی پارەدان
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setPayingId(null)}
                      >
                        هەڵوەشاندنەوە
                      </button>
                    </div>
                  </form>
                )}

                {payments.length > 0 && (
                  <div className="mt-3 pr-2 border-r-2 border-mint-200">
                    {payments.map((p) => (
                      <p key={p.id} className="m-0 mb-1 text-sm text-ink-500">
                        پارەدان: {formatIQD(p.amount)} · {formatShortDate(p.date)}
                        {p.note ? ` · ${p.note}` : ""}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function PersonDetailPage() {
  return (
    <Suspense fallback={<div className="empty">بارکردن...</div>}>
      <PersonDetailInner />
    </Suspense>
  );
}
