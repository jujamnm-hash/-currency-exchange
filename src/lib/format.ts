export function formatIQD(amount: number): string {
  const n = Math.round(amount || 0);
  return new Intl.NumberFormat("en-IQ").format(n) + " د.ع";
}

export function formatShortDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  return Number.parseInt(cleaned, 10);
}
