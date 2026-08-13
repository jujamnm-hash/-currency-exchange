"use client";

import type { MatchedNote } from "@/lib/types";

type Props = {
  matches: MatchedNote[];
  locked?: boolean;
  onSelect: (note: MatchedNote) => void;
};

export function MatchOverlay({ matches, locked, onSelect }: Props) {
  if (!matches.length) return null;
  const top = matches[0];

  return (
    <>
      <button
        type="button"
        onClick={() => onSelect(top)}
        className="absolute left-1/2 top-[40%] z-20 w-[min(92vw,24rem)] -translate-x-1/2 -translate-y-1/2 animate-note-rise"
      >
        <div
          className={`glass-panel rounded-2xl p-3 shadow-[0_0_50px_rgba(232,163,92,0.35)] ${
            locked
              ? "border-2 border-ember-300 ring-2 ring-ember-400/50"
              : "border border-ember-400/40 ring-1 ring-ember-400/30"
          }`}
        >
          <div className="flex items-start gap-3">
            {top.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={top.thumbnail}
                alt=""
                className="h-16 w-16 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-ember-400 text-lg font-bold text-ink-950">
                ن
              </div>
            )}
            <div className="min-w-0 flex-1 text-right">
              <p className="text-[11px] font-medium text-ember-300">
                {locked ? "قفڵ کرا · " : ""}
                {Math.round(top.score)}% هاوشێوەیی
              </p>
              <h3 className="mt-0.5 truncate text-lg font-semibold text-mist-100">
                {top.title}
              </h3>
              <p className="mt-1 line-clamp-3 text-sm leading-6 text-mist-300">
                {top.content}
              </p>
            </div>
          </div>
          <p className="mt-2 text-center text-[11px] text-mist-500">
            دەستی لێبدە بۆ بینینی تەواو
          </p>
        </div>
      </button>

      {matches.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 top-[max(5.5rem,env(safe-area-inset-top))] z-20 flex flex-col items-center gap-2 px-4">
          {matches.slice(1, 3).map((note, i) => (
            <button
              key={note.id}
              type="button"
              onClick={() => onSelect(note)}
              style={{ animationDelay: `${i * 80}ms` }}
              className="pointer-events-auto animate-note-rise glass-panel flex w-full max-w-sm items-center gap-3 rounded-2xl p-3 text-right shadow-xl"
            >
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-mist-100">
                  {note.title}
                </h3>
                <p className="line-clamp-1 text-xs text-mist-400">{note.content}</p>
              </div>
              <span className="shrink-0 text-[11px] text-ember-300">
                {Math.round(note.score)}%
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
