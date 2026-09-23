"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Scene = {
  id: string;
  duration: number;
};

const SCENES: Scene[] = [
  { id: "brand", duration: 3500 },
  { id: "promise", duration: 4000 },
  { id: "product", duration: 5000 },
  { id: "features", duration: 4500 },
  { id: "cta", duration: 5000 },
];

const FEATURES = [
  { title: "کاشێر", desc: "فرۆشتنی خێرا و پسوڵە" },
  { title: "ژمێریاری", desc: "حیسابات و قازانج" },
  { title: "کۆگا", desc: "کۆنترۆڵی کاڵا" },
  { title: "ڕاپۆرت", desc: "ڕوون و ڕۆژانە" },
];

export default function MjCommercial() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const scene = SCENES[index];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      setIndex((prev) => (prev + 1) % SCENES.length);
    }, scene.duration);
    return () => window.clearTimeout(timer);
  }, [index, playing, scene.duration]);

  return (
    <div className="commercial relative min-h-screen overflow-hidden text-ink" data-scene={scene.id}>
      <div className="commercial-bg absolute inset-0" aria-hidden />
      <div className="commercial-grain absolute inset-0" aria-hidden />

      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 sm:px-10">
        <p className="font-display text-lg font-bold tracking-wide text-teal-700 sm:text-xl">MJ System</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="rounded-xl border border-[var(--line)] bg-white/80 px-3 py-1.5 text-xs font-semibold backdrop-blur"
          >
            {playing ? "وەستان" : "دەستپێکردنەوە"}
          </button>
          {SCENES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`گۆڕین بۆ دیمەنی ${i + 1}`}
              onClick={() => {
                setIndex(i);
                setPlaying(true);
              }}
              className={`h-1.5 w-6 rounded-full transition ${i === index ? "bg-teal-700" : "bg-ink/15"}`}
            />
          ))}
        </div>
      </header>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-24 sm:px-10">
        {scene.id === "brand" && (
          <section key="brand" className="scene-enter text-center">
            <p className="brand-mark font-display text-6xl font-bold tracking-tight text-teal-700 sm:text-8xl lg:text-9xl">
              MJ System
            </p>
            <p className="scene-sub mt-6 text-lg text-ink-soft sm:text-xl">سیستەمی زیرەرەکی بۆ کاروبار</p>
          </section>
        )}

        {scene.id === "promise" && (
          <section key="promise" className="scene-enter mx-auto max-w-4xl text-center">
            <p className="font-display text-4xl font-bold leading-tight text-teal-800 sm:text-6xl lg:text-7xl">
              ژمێریاری و کاشێری
            </p>
            <p className="mt-6 text-lg leading-9 text-ink-soft sm:text-2xl">
              یەک سیستەم بۆ فرۆشتن، حیسابات، و کۆنترۆڵی کۆگا — سادە، خێرا، بە کوردی.
            </p>
          </section>
        )}

        {scene.id === "product" && (
          <section key="product" className="scene-enter relative mx-auto w-full max-w-5xl">
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
        )}

        {scene.id === "features" && (
          <section key="features" className="scene-enter mx-auto w-full max-w-5xl">
            <p className="mb-10 text-center font-display text-3xl font-bold text-teal-800 sm:text-5xl">
              هەموو ئەوەی پێویستتە
            </p>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  className="feature-item"
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  <p className="font-display text-3xl font-bold text-teal-700 sm:text-4xl">{f.title}</p>
                  <p className="mt-2 text-base text-ink-soft">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {scene.id === "cta" && (
          <section key="cta" className="scene-enter mx-auto max-w-3xl text-center">
            <p className="font-display text-5xl font-bold text-teal-700 sm:text-7xl">MJ System</p>
            <p className="mt-5 text-xl text-ink sm:text-2xl">ئەمڕۆ سیستەمەکەت دەستپێبکە</p>
            <p className="mt-3 text-base leading-8 text-ink-soft sm:text-lg">
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
        )}
      </main>
    </div>
  );
}
