"use client";

import Image from "next/image";
import Link from "next/link";

const FEATURES = [
  { title: "کاشێر", desc: "فرۆشتنی خێرا و پسوڵە" },
  { title: "ژمێریاری", desc: "حیسابات و قازانج" },
  { title: "کۆگا", desc: "کۆنترۆڵی کاڵا" },
  { title: "ڕاپۆرت", desc: "ڕوون و ڕۆژانە" },
];

/** Fixed-timeline cinematic commercial (~24s loop). */
export default function MjCommercial() {
  return (
    <div className="commercial relative min-h-screen overflow-hidden text-ink">
      <div className="commercial-bg absolute inset-0" aria-hidden />
      <div className="commercial-grain absolute inset-0" aria-hidden />

      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 sm:px-10">
        <p className="font-display text-lg font-bold tracking-wide text-teal-700 sm:text-xl">MJ System</p>
        <Link href="/dashboard" className="rounded-xl border border-[var(--line)] bg-white/80 px-3 py-1.5 text-xs font-semibold backdrop-blur">
          چوونە ناو سیستەم
        </Link>
      </header>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-24 sm:px-10">
        <div className="commercial-stage relative mx-auto w-full max-w-5xl">
          {/* Scene 1 — Brand */}
          <section className="commercial-scene scene-1 absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="font-display text-6xl font-bold tracking-tight text-teal-700 sm:text-8xl lg:text-9xl">
              MJ System
            </p>
            <p className="mt-6 text-lg text-ink-soft sm:text-xl">سیستەمی زیرەرەکی بۆ کاروبار</p>
          </section>

          {/* Scene 2 — Promise */}
          <section className="commercial-scene scene-2 absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="font-display text-4xl font-bold leading-tight text-teal-800 sm:text-6xl lg:text-7xl">
              ژمێریاری و کاشێری
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-ink-soft sm:text-2xl">
              یەک سیستەم بۆ فرۆشتن، حیسابات، و کۆنترۆڵی کۆگا — سادە، خێرا، بە کوردی.
            </p>
          </section>

          {/* Scene 3 — Product */}
          <section className="commercial-scene scene-3 absolute inset-0 flex items-center justify-center">
            <div className="product-frame relative aspect-[16/9] w-full overflow-hidden">
              <Image
                src="/mj-system-pos-hero.png"
                alt="کاشێری MJ System لەسەر تەختەی فرۆشتن"
                fill
                priority
                className="product-ken object-cover"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a4f4e]/55 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
                <p className="font-display text-3xl font-bold text-white sm:text-5xl">کاشێری زیرەرەکی</p>
                <p className="mt-2 max-w-xl text-sm text-white/90 sm:text-lg">
                  پسوڵە، نرخی کاڵا، و فرۆشتنی خێرا لەسەر یەک شاشە.
                </p>
              </div>
            </div>
          </section>

          {/* Scene 4 — Features */}
          <section className="commercial-scene scene-4 absolute inset-0 flex flex-col items-center justify-center">
            <p className="mb-10 text-center font-display text-3xl font-bold text-teal-800 sm:text-5xl">
              هەموو ئەوەی پێویستتە
            </p>
            <div className="grid w-full gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f) => (
                <div key={f.title}>
                  <p className="font-display text-3xl font-bold text-teal-700 sm:text-4xl">{f.title}</p>
                  <p className="mt-2 text-base text-ink-soft">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Scene 5 — CTA */}
          <section className="commercial-scene scene-5 absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="font-display text-5xl font-bold text-teal-700 sm:text-7xl">MJ System</p>
            <p className="mt-5 text-xl text-ink sm:text-2xl">ئەمڕۆ سیستەمەکەت دەستپێبکە</p>
            <p className="mt-3 max-w-xl text-base leading-8 text-ink-soft sm:text-lg">
              ژمێریاری + کاشێر + کۆگا — بۆ فرۆشگا و کاروباری بچووک و مامناوەند.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/dashboard" className="btn-primary px-7 py-3.5 text-base">
                بینینی سیستەم
              </Link>
              <Link href="/sales/new" className="btn-ghost px-7 py-3.5 text-base">
                تاقیکردنەوەی کاشێر
              </Link>
            </div>
          </section>
        </div>
      </main>

      <div className="commercial-progress absolute inset-x-0 bottom-0 z-30 h-1 bg-ink/10">
        <div className="commercial-progress-bar h-full bg-teal-700" />
      </div>
    </div>
  );
}
