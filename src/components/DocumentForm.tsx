"use client";

import { useState, useTransition } from "react";

type ProductOption = {
  id: string;
  name: string;
  sku: string;
  sellPrice: number;
  costPrice: number;
  quantity: number;
};

type PartyOption = { id: string; name: string };

type Line = {
  key: string;
  productId: string;
  quantity: number;
  unitPrice: number;
};

export function DocumentForm({
  mode,
  products,
  parties,
  action,
}: {
  mode: "sale" | "purchase";
  products: ProductOption[];
  parties: PartyOption[];
  action: (formData: FormData) => Promise<{ number: string } | void>;
}) {
  const [lines, setLines] = useState<Line[]>([
    { key: "1", productId: "", quantity: 1, unitPrice: 0 },
  ]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [paid, setPaid] = useState(0);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const total = subtotal - discount + tax;

  function updateLine(key: string, patch: Partial<Line>) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  function onProductChange(key: string, productId: string) {
    const p = products.find((x) => x.id === productId);
    updateLine(key, {
      productId,
      unitPrice: p ? (mode === "sale" ? p.sellPrice : p.costPrice) : 0,
    });
  }

  function submit(formData: FormData) {
    formData.set(
      "linesJson",
      JSON.stringify(
        lines
          .filter((l) => l.productId)
          .map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
          })),
      ),
    );
    formData.set("discount", String(discount));
    formData.set("tax", String(tax));
    formData.set("paidAmount", String(paid));
    start(async () => {
      try {
        setMessage("");
        const res = await action(formData);
        setMessage(res?.number ? `سەرکەوتوو: ${res.number}` : "سەرکەوتوو پاشەکەوت کرا");
        setLines([{ key: String(Date.now()), productId: "", quantity: 1, unitPrice: 0 }]);
        setDiscount(0);
        setTax(0);
        setPaid(0);
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "هەڵە ڕوویدا");
      }
    });
  }

  return (
    <form action={submit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1.5 block text-ink-muted">
            {mode === "sale" ? "کڕیار" : "دابینکەر"}
          </span>
          <select name="partyId" className="input">
            <option value="">{mode === "sale" ? "کڕیاری ڕاستەوخۆ" : "بێ دابینکەر"}</option>
            {parties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-ink-muted">بەروار</span>
          <input
            type="date"
            name="date"
            className="input"
            defaultValue={new Date().toISOString().slice(0, 10)}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-ink-muted">تێبینی</span>
          <input name="notes" className="input" placeholder="ئارەزوومەندانە" />
        </label>
      </div>

      <div className="panel overflow-hidden">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>کاڵا</th>
                <th>بڕ</th>
                <th>نرخ</th>
                <th>کۆ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.key}>
                  <td className="min-w-[220px]">
                    <select
                      className="input"
                      value={line.productId}
                      onChange={(e) => onProductChange(line.key, e.target.value)}
                    >
                      <option value="">هەڵبژێرە</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) — کۆگا: {p.quantity}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      className="input w-28"
                      value={line.quantity}
                      onChange={(e) =>
                        updateLine(line.key, { quantity: Number(e.target.value) || 0 })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      className="input w-36"
                      value={line.unitPrice}
                      onChange={(e) =>
                        updateLine(line.key, { unitPrice: Number(e.target.value) || 0 })
                      }
                    />
                  </td>
                  <td className="font-medium">
                    {(line.quantity * line.unitPrice).toLocaleString("en-IQ")}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="text-sm text-[var(--rose)]"
                      onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                    >
                      سڕینەوە
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-[var(--line)] p-3">
          <button
            type="button"
            className="btn-ghost"
            onClick={() =>
              setLines((prev) => [
                ...prev,
                { key: String(Date.now()), productId: "", quantity: 1, unitPrice: 0 },
              ])
            }
          >
            + کاڵای تر
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <label className="text-sm">
          <span className="mb-1.5 block text-ink-muted">داشکاندن</span>
          <input
            type="number"
            className="input"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value) || 0)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block text-ink-muted">باج</span>
          <input
            type="number"
            className="input"
            value={tax}
            onChange={(e) => setTax(Number(e.target.value) || 0)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block text-ink-muted">پارەی وەرگیراو / دراو</span>
          <input
            type="number"
            className="input"
            value={paid}
            onChange={(e) => setPaid(Number(e.target.value) || 0)}
          />
        </label>
        <div className="rounded-xl bg-teal-50 px-4 py-3">
          <p className="text-xs text-ink-muted">کۆی گشتی</p>
          <p className="font-display text-2xl font-bold text-teal-700">
            {total.toLocaleString("en-IQ")}
          </p>
          <p className="text-xs text-ink-muted">کۆی لاوەکی: {subtotal.toLocaleString("en-IQ")}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "چاوەڕوان بە..." : mode === "sale" ? "تۆمارکردنی فرۆشتن" : "تۆمارکردنی کڕین"}
        </button>
        {message && <p className="text-sm text-teal-700">{message}</p>}
      </div>
    </form>
  );
}
