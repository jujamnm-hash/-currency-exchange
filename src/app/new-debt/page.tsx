"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { addDebt, addPerson } from "@/lib/debt-db";
import { useDebtDb } from "@/lib/use-debt-db";
import { parseAmount, todayISO } from "@/lib/format";
import type { DebtType } from "@/lib/debt-db";
import { go } from "@/lib/paths";

function NewDebtInner() {
  const search = useSearchParams();
  const { db, ready, refresh } = useDebtDb();
  const [personId, setPersonId] = useState("");
  const [newPersonName, setNewPersonName] = useState("");
  const [type, setType] = useState<DebtType>("owed_to_me");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayISO());
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const preset = search.get("person");
    if (preset) {
      setPersonId(preset);
      setMode("existing");
    }
  }, [search]);

  const sortedPeople = useMemo(
    () => [...db.people].sort((a, b) => a.name.localeCompare(b.name, "ku")),
    [db.people]
  );

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const value = parseAmount(amount);
    if (value <= 0) return;

    let targetId = personId;
    if (mode === "new") {
      if (!newPersonName.trim()) return;
      const person = addPerson({ name: newPersonName });
      targetId = person.id;
    }
    if (!targetId) return;

    const debt = addDebt({
      personId: targetId,
      type,
      amount: value,
      description,
      date,
    });
    refresh();
    setSaved(true);
    setTimeout(() => {
      go(`/person/?id=${debt.personId}`);
    }, 400);
  }

  if (!ready) return <div className="empty">بارکردن...</div>;

  return (
    <div className="animate-fade-up">
      <div className="hero-brand">
        <h1>قەرزی نوێ</h1>
        <p>بڕ و جۆری قەرز تۆمار بکە — بۆ تۆ یان لەسەر تۆ.</p>
      </div>

      <form className="panel form-grid" onSubmit={onSubmit}>
        <div className="type-toggle">
          <button
            type="button"
            className={`type-option ${type === "owed_to_me" ? "active-owed" : ""}`}
            onClick={() => setType("owed_to_me")}
          >
            قەرزی کەس لای من
          </button>
          <button
            type="button"
            className={`type-option ${type === "i_owe" ? "active-owe" : ""}`}
            onClick={() => setType("i_owe")}
          >
            قەرزی من لای کەس
          </button>
        </div>

        <div className="type-toggle">
          <button
            type="button"
            className={`type-option ${mode === "existing" ? "active-owed" : ""}`}
            onClick={() => setMode("existing")}
          >
            کەسی هەبوو
          </button>
          <button
            type="button"
            className={`type-option ${mode === "new" ? "active-owed" : ""}`}
            onClick={() => setMode("new")}
          >
            کەسی نوێ
          </button>
        </div>

        {mode === "existing" ? (
          <div className="field">
            <label htmlFor="person">کەس</label>
            <select
              id="person"
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              required
            >
              <option value="">هەڵبژێرە...</option>
              {sortedPeople.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {sortedPeople.length === 0 && (
              <p className="text-sm text-ink-400 m-0">
                هیچ کەسێک نییە —{" "}
                <button
                  type="button"
                  className="text-mint-700 font-semibold"
                  onClick={() => setMode("new")}
                >
                  کەسی نوێ زیاد بکە
                </button>
              </p>
            )}
          </div>
        ) : (
          <div className="field">
            <label htmlFor="newName">ناوی کەس</label>
            <input
              id="newName"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              required
              placeholder="ناو بنووسە"
            />
          </div>
        )}

        <div className="form-grid two">
          <div className="field">
            <label htmlFor="amount">بڕ (دینار)</label>
            <input
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="numeric"
              required
              placeholder="مثال: 50000"
            />
          </div>
          <div className="field">
            <label htmlFor="date">بەروار</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="desc">وەسف / هۆکار</label>
          <textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="بۆچی؟ چی؟"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn btn-primary" disabled={saved}>
            {saved ? "پاشەکەوت کرا..." : "تۆمارکردنی قەرز"}
          </button>
          <Link href="/dashboard/" className="btn btn-secondary">
            هەڵوەشاندنەوە
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function NewDebtPage() {
  return (
    <Suspense fallback={<div className="empty">بارکردن...</div>}>
      <NewDebtInner />
    </Suspense>
  );
}
