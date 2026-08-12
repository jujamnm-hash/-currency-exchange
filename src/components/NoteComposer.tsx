"use client";

import { useState } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  onSubmit: (title: string, content: string) => Promise<void> | void;
};

export function NoteComposer({ open, busy, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !content.trim()) {
      setError("ناونیشان و تێبینی پێویستن");
      return;
    }
    try {
      await onSubmit(title.trim(), content.trim());
      setTitle("");
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "هەڵەی پاشەکەوت");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/70 p-3 backdrop-blur-sm sm:items-center">
      <form
        onSubmit={handleSubmit}
        className="glass-panel animate-note-rise w-full max-w-md rounded-2xl p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-display text-2xl text-ember-400">نیشانەی نوێ</p>
            <p className="mt-1 text-sm text-mist-400">
              ئەم تێبینییە بەو شتە دەبەسترێتەوە کە کامێراکە دەیبینێت
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-mist-400 transition hover:bg-white/5 hover:text-mist-100"
            aria-label="داخستن"
          >
            <X size={20} />
          </button>
        </div>

        <label className="mb-3 block">
          <span className="mb-1.5 block text-xs text-mist-400">ناونیشان</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="بۆ نموونە: دەرگای کتێبخانە"
            className="w-full rounded-xl border border-white/10 bg-ink-900/80 px-3 py-2.5 text-mist-100 outline-none ring-ember-400/40 placeholder:text-mist-500 focus:ring-2"
            autoFocus
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-1.5 block text-xs text-mist-400">تێبینی</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={8000}
            rows={5}
            placeholder="ئەوەی دەتەوێت لەبیرت نەچێت لێرە بنووسە..."
            className="w-full resize-none rounded-xl border border-white/10 bg-ink-900/80 px-3 py-2.5 text-mist-100 outline-none ring-ember-400/40 placeholder:text-mist-500 focus:ring-2"
          />
        </label>

        {error && (
          <p className="mb-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-ember-400 py-3 text-sm font-semibold text-ink-950 transition hover:bg-ember-300 disabled:opacity-60"
        >
          {busy ? "پاشەکەوت دەکرێت..." : "لەسەر ئەم شتە جێگیر بکە"}
        </button>
      </form>
    </div>
  );
}
