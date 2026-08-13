import { Decimal } from "@prisma/client/runtime/library";

export type MoneyLike = number | string | Decimal;

export function toNumber(value: MoneyLike | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  return Number(value.toString()) || 0;
}

export function formatMoney(value: MoneyLike, currencyLabel = "دینار"): string {
  const n = toNumber(value);
  const formatted = new Intl.NumberFormat("en-IQ", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(n));
  return `${formatted} ${currencyLabel}`;
}

export function formatQty(value: MoneyLike): string {
  const n = toNumber(value);
  return new Intl.NumberFormat("en-IQ", {
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
  }).format(n);
}

export function formatDateKu(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}
