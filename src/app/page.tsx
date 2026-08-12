import Link from "next/link";
import { Camera, MapPinned, ScanSearch } from "lucide-react";

export default function HomePage() {
  return (
    <main className="atmosphere grain relative min-h-[100dvh] overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="lens-glow absolute -left-24 top-24 h-72 w-72 rounded-full bg-ember-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[55vh] w-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(36,72,110,0.35),transparent_60%)]" />
        {/* full-bleed atmospheric hero plane */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(120deg, transparent 40%, rgba(232,163,92,0.08) 50%, transparent 60%), repeating-linear-gradient(90deg, rgba(243,240,232,0.03) 0 1px, transparent 1px 48px)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-lg flex-col px-6 pb-10 pt-[max(2rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between text-sm text-mist-400">
          <span>AR Spatial Notes</span>
          <Link href="/notes" className="transition hover:text-ember-300">
            تێبینییەکان
          </Link>
        </div>

        <section className="mt-16 flex flex-1 flex-col justify-center">
          <p className="animate-fade-up text-sm tracking-[0.2em] text-ember-400">
            NISHANA
          </p>
          <h1
            className="animate-fade-up mt-3 font-display text-7xl leading-none text-mist-100 sm:text-8xl"
            style={{ animationDelay: "80ms" }}
          >
            نیشانە
          </h1>
          <p
            className="animate-fade-up mt-6 max-w-sm text-base leading-8 text-mist-300"
            style={{ animationDelay: "160ms" }}
          >
            کامێراکەت بخە سەر هەر شتێک، تێبینی بنووسە — کاتێ دووبارە
            دەیبینیتەوە، نوسینەکەت دەگەڕێتەوە.
          </p>

          <div
            className="animate-fade-up mt-10 flex flex-col gap-3"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              href="/scan"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ember-400 px-6 py-4 text-base font-semibold text-ink-950 shadow-[0_12px_40px_rgba(232,163,92,0.28)] transition hover:bg-ember-300"
            >
              <Camera size={20} />
              دەستپێکردنی کامێرا
            </Link>
            <Link
              href="/notes"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm text-mist-100 backdrop-blur transition hover:bg-white/10"
            >
              بینینی تێبینییە پاشەکەوتکراوەکان
            </Link>
          </div>
        </section>

        <section className="mt-auto grid gap-4 border-t border-white/10 pt-8 text-sm text-mist-400">
          <div className="flex gap-3">
            <ScanSearch className="mt-0.5 shrink-0 text-ember-400" size={18} />
            <p>ناسینەوە بە نیشانەی بینراو + GPS + ئاراستەی ئامێر</p>
          </div>
          <div className="flex gap-3">
            <MapPinned className="mt-0.5 shrink-0 text-ember-400" size={18} />
            <p>داتابەیس لە Vercel Postgres — تێبینییەکان لە هەموو شوێنێک پارێزراون</p>
          </div>
        </section>
      </div>
    </main>
  );
}
