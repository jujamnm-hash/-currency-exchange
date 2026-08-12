"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Camera, Trash2 } from "lucide-react";
import { getDeviceId } from "@/lib/device";
import type { SpatialNoteDTO } from "@/lib/types";

export default function NotesPage() {
  const [notes, setNotes] = useState<SpatialNoteDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/notes?deviceId=${encodeURIComponent(getDeviceId())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "هەڵە");
      setNotes(data.notes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "هەڵە");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function remove(id: string) {
    if (!confirm("ئەم نیشانەیە بسڕدرێتەوە؟")) return;
    const res = await fetch(
      `/api/notes/${id}?deviceId=${encodeURIComponent(getDeviceId())}`,
      { method: "DELETE" }
    );
    if (res.ok) setNotes((n) => n.filter((x) => x.id !== id));
  }

  return (
    <main className="atmosphere grain relative min-h-[100dvh]">
      <div className="relative z-10 mx-auto max-w-lg px-5 pb-16 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <header className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-mist-400 transition hover:text-mist-100"
          >
            <ArrowRight size={16} />
            سەرەتا
          </Link>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 rounded-full bg-ember-400 px-3 py-2 text-sm font-semibold text-ink-950"
          >
            <Camera size={16} />
            کامێرا
          </Link>
        </header>

        <h1 className="font-display text-5xl text-mist-100">تێبینییەکان</h1>
        <p className="mt-2 text-sm text-mist-400">
          هەموو نیشانەکانی ئەم ئامێرە لە داتابەیسی Vercel
        </p>

        {loading && (
          <p className="mt-10 text-sm text-mist-500">بارکردن...</p>
        )}
        {error && (
          <p className="mt-10 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
            <br />
            <span className="text-xs text-red-300/80">
              دڵنیابە DATABASE_URL لە Vercel دانراوە و prisma db push جێبەجێ کراوە.
            </span>
          </p>
        )}

        {!loading && !error && notes.length === 0 && (
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <p className="font-display text-2xl text-ember-400">هێشتا بەتاڵە</p>
            <p className="mt-2 text-sm text-mist-400">
              کامێرا بکەرەوە و یەکەم نیشانەت دابنێ
            </p>
            <Link
              href="/scan"
              className="mt-5 inline-flex rounded-xl bg-ember-400 px-4 py-2.5 text-sm font-semibold text-ink-950"
            >
              دەستپێکردن
            </Link>
          </div>
        )}

        <ul className="mt-8 space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="flex gap-3 rounded-2xl border border-white/10 bg-ink-900/50 p-3"
            >
              {note.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={note.thumbnail}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-ember-400/10 text-ember-400">
                  ن
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-semibold text-mist-100">{note.title}</h2>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-mist-400">
                  {note.content}
                </p>
                <p className="mt-2 text-[11px] text-mist-500">
                  {new Date(note.createdAt).toLocaleString("ku")} ·{" "}
                  {note.latitude.toFixed(4)}, {note.longitude.toFixed(4)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void remove(note.id)}
                className="self-start rounded-lg p-2 text-mist-500 transition hover:bg-red-500/10 hover:text-red-300"
                aria-label="سڕینەوە"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
