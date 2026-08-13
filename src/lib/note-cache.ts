import type { SpatialNoteDTO } from "./types";

const KEY = "nishana_note_cache_v1";
const MAX = 80;

export function loadNoteCache(): SpatialNoteDTO[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SpatialNoteDTO[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveNoteToCache(note: SpatialNoteDTO) {
  if (typeof window === "undefined") return;
  const list = loadNoteCache().filter((n) => n.id !== note.id);
  list.unshift(note);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
}

export function replaceNoteCache(notes: SpatialNoteDTO[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(notes.slice(0, MAX)));
}
