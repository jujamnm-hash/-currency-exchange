"use client";

import type { MatchedNote } from "@/lib/types";

type Props = {
  matches: MatchedNote[];
  onSelect: (note: MatchedNote) => void;
};

export function MatchOverlay({ matches, onSelect }: Props) {
  if (!matches.length) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-20 z-20 flex flex-col items-center gap-2 px-4">
      {matches.slice(0, 3).map((note, i) => (
        <button
          key={note.id}
          type="button"
          onClick={() => onSelect(note)}
          style={{ animationDelay: `${i * 80}ms` }}
          className="pointer-events-auto animate-note-rise glass-panel flex w-full max-w-sm items-center gap-3 rounded-2xl p-3 text-right shadow-xl transition hover:border-ember-400/40"
        >
          {note.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={note.thumbnail}
              alt=""
              className="h-14 w-14 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-ember-400/15 text-ember-400">
              ن
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate font-semibold text-mist-100">{note.title}</h3>
              <span className="shrink-0 rounded-md bg-ember-400/15 px-2 py-0.5 text-[11px] text-ember-300">
                {Math.round(note.score)}%
              </span>
            </div>
            <p className="mt-0.5 line-clamp-2 text-xs text-mist-400">{note.content}</p>
            <p className="mt-1 text-[11px] text-mist-500">
              {note.distanceM < 1
                ? "لێرە"
                : `${note.distanceM.toFixed(0)} م دوور`}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
