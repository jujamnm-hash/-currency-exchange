"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { Plus, Search, UserRound } from "lucide-react";
import { useDebtDb } from "@/lib/use-debt-db";
import { addPerson, getPersonBalance } from "@/lib/debt-db";
import { formatIQD } from "@/lib/format";
import { go } from "@/lib/paths";

export default function PeoplePage() {
  const { db, ready, refresh } = useDebtDb();
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = [...db.people];
    if (!term) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.phone.includes(term) ||
        p.notes.toLowerCase().includes(term)
    );
  }, [db.people, q]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const person = addPerson({ name, phone, notes });
    setName("");
    setPhone("");
    setNotes("");
    setShowForm(false);
    refresh();
    go(`/person/?id=${person.id}`);
  }

  if (!ready) return <div className="empty">بارکردن...</div>;

  return (
    <div className="animate-fade-up">
      <div className="section-head" style={{ marginTop: 0 }}>
        <div>
          <h2>کەسەکان</h2>
          <p>کەسانی قەرزدار و قەرز وەرگر</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          <Plus size={18} /> کەسی نوێ
        </button>
      </div>

      {showForm && (
        <form className="panel form-grid mb-4 animate-scale-in" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="name">ناو</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="ناوی کەس" />
          </div>
          <div className="form-grid two">
            <div className="field">
              <label htmlFor="phone">مۆبایل</label>
              <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07xx xxx xxxx" inputMode="tel" />
            </div>
            <div className="field">
              <label htmlFor="notes">تێبینی</label>
              <input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ئارەزوومەندانە" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">پاشەکەوتکردن</button>
        </form>
      )}

      <div className="relative mb-4">
        <Search size={18} className="absolute top-1/2 -translate-y-1/2 right-4 text-ink-400" />
        <input
          className="search-box pr-11"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="گەڕان بە ناو یان مۆبایل..."
        />
      </div>

      <div className="panel">
        {filtered.length === 0 ? (
          <div className="empty">
            <UserRound className="mx-auto mb-3 opacity-40" size={36} />
            هیچ کەسێک نەدۆزرایەوە
          </div>
        ) : (
          filtered.map((person) => {
            const bal = getPersonBalance(person.id, db);
            return (
              <Link key={person.id} href={`/person/?id=${person.id}`} className="list-row">
                <div>
                  <p className="m-0 font-semibold text-lg">{person.name}</p>
                  <p className="m-0 mt-1 text-sm text-ink-400">
                    {person.phone || "بێ ژمارە"} · باڵانس {formatIQD(bal.net)}
                  </p>
                </div>
                <div className="text-left flex flex-col items-end gap-1">
                  {bal.owedToMe > 0 && <span className="pill pill-mint">بۆ من {formatIQD(bal.owedToMe)}</span>}
                  {bal.iOwe > 0 && <span className="pill pill-copper">لە من {formatIQD(bal.iOwe)}</span>}
                  {bal.owedToMe === 0 && bal.iOwe === 0 && <span className="pill pill-muted">سەوز</span>}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
