"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Camera, Crosshair, List, Plus, WifiOff } from "lucide-react";
import { getDeviceId } from "@/lib/device";
import {
  ensureOrientationPermission,
  FALLBACK_GEO,
  requestGeo,
  startCamera,
  watchGeo,
  watchOrientation,
  type GeoFix,
  type Orientation,
} from "@/lib/sensors";
import { captureFingerprint } from "@/lib/vision";
import type { MatchedNote } from "@/lib/types";
import { MatchOverlay } from "./MatchOverlay";
import { NoteComposer } from "./NoteComposer";

type ViewNote = MatchedNote | null;

export function CameraAR() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const geoRef = useRef<GeoFix | null>(null);
  const orientRef = useRef<Orientation>({ heading: null, beta: null, gamma: null });
  const scanningRef = useRef(false);
  const lastScanRef = useRef(0);
  const stopGeoRef = useRef<(() => void) | null>(null);
  const stopOrientRef = useRef<(() => void) | null>(null);

  const [started, setStarted] = useState(false);
  const [starting, setStarting] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("پەنجە لە دەستپێکردن بدە");
  const [matches, setMatches] = useState<MatchedNote[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewNote, setViewNote] = useState<ViewNote>(null);
  const [geoOk, setGeoOk] = useState(false);
  const [heading, setHeading] = useState<number | null>(null);
  const [dbOk, setDbOk] = useState<boolean | null>(null);

  useEffect(() => {
    return () => {
      stopGeoRef.current?.();
      stopOrientRef.current?.();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const beginSession = useCallback(async () => {
    setStarting(true);
    setError(null);
    setStatus("مۆڵەت و کامێرا...");

    try {
      const health = await fetch("/api/health").then((r) => r.json());
      setDbOk(Boolean(health.ok));
      if (!health.ok) {
        setStatus("داتابەیس ئامادە نییە — دووبارە هەوڵ بدە");
      }
    } catch {
      setDbOk(false);
    }

    try {
      // لە کلیکی بەکارهێنەر — پێویستە بۆ iOS
      await ensureOrientationPermission();

      try {
        const fix = await requestGeo(8000);
        geoRef.current = fix;
        setGeoOk(true);
      } catch {
        setGeoOk(false);
        geoRef.current = null;
      }

      if (!videoRef.current) {
        throw new Error("ڤیدیۆ ئامادە نییە");
      }
      streamRef.current = await startCamera(videoRef.current);
      setReady(true);
      setStarted(true);
      setStatus(
        geoRef.current
          ? "کامێرا ئامادەیە — + بۆ نوسین لەسەر شت"
          : "کامێرا ئامادەیە — GPS نییە، هێشتا دەتوانیت بنووسیت"
      );

      stopGeoRef.current?.();
      stopGeoRef.current = watchGeo(
        (fix) => {
          geoRef.current = fix;
          setGeoOk(true);
        },
        () => setGeoOk(false)
      );
      stopOrientRef.current?.();
      stopOrientRef.current = watchOrientation((o) => {
        orientRef.current = o;
        setHeading(o.heading);
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "ناتوانرێت کامێرا بکرێتەوە. HTTPS و مۆڵەت پێویستن."
      );
      setStarted(false);
      setReady(false);
    } finally {
      setStarting(false);
    }
  }, []);

  async function resolveGeoForSave(): Promise<GeoFix> {
    if (geoRef.current && geoRef.current.accuracy < 50000) {
      return geoRef.current;
    }
    try {
      const fix = await requestGeo(6000);
      geoRef.current = fix;
      setGeoOk(true);
      return fix;
    } catch {
      return FALLBACK_GEO;
    }
  }

  const scanOnce = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !ready || scanningRef.current) return;
    if (video.readyState < 2) return;

    const now = Date.now();
    if (now - lastScanRef.current < 1400) return;
    lastScanRef.current = now;
    scanningRef.current = true;

    const geo = geoRef.current ?? FALLBACK_GEO;

    try {
      const fp = captureFingerprint(video, { thumbnailMax: 140 });
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: geo.latitude,
          longitude: geo.longitude,
          heading: orientRef.current.heading,
          imageHash: fp.imageHash,
          colorProfile: fp.colorProfile,
          deviceId: getDeviceId(),
          radiusM:
            geo.accuracy >= 50000
              ? 500
              : Math.max(40, Math.min(150, (geo.accuracy || 30) * 2.5)),
          visualOnly: geo.accuracy >= 50000,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "هەڵەی گەڕان");
      setMatches(data.matches || []);
      if ((data.matches || []).length) {
        setStatus(`${data.matches.length} نیشانە دۆزرایەوە — دەستی لێبدە`);
      } else {
        setStatus("هیچ نیشانەیەک لێرە نییە — دوگمەی + داگرە");
      }
    } catch {
      setStatus("گەڕان سەرنەکەوت — دووبارە هەوڵ بدە");
    } finally {
      scanningRef.current = false;
    }
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const id = window.setInterval(() => {
      void scanOnce();
    }, 1600);
    return () => window.clearInterval(id);
  }, [ready, scanOnce]);

  function openComposer() {
    if (!ready) {
      setStatus("سەرەتا دەستپێکردن داگرە");
      return;
    }
    setComposerOpen(true);
  }

  async function saveNote(title: string, content: string) {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      throw new Error("کامێرا ئامادە نییە — چاوەڕوان بە تا وێنە دەردەکەوێت");
    }
    setSaving(true);
    setStatus("پاشەکەوت...");
    try {
      const geo = await resolveGeoForSave();
      const fp = captureFingerprint(video, { thumbnailMax: 120 });
      const thumbnail =
        fp.thumbnail.length > 100_000 ? null : fp.thumbnail;

      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          latitude: geo.latitude,
          longitude: geo.longitude,
          accuracy: geo.accuracy,
          altitude: geo.altitude,
          heading: orientRef.current.heading,
          imageHash: fp.imageHash,
          colorProfile: fp.colorProfile,
          thumbnail,
          deviceId: getDeviceId(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail =
          typeof data?.details === "object"
            ? JSON.stringify(data.details)
            : "";
        throw new Error(data.error || detail || "پاشەکەوت سەرنەکەوت");
      }
      setComposerOpen(false);
      setStatus("✓ نیشانە لەسەر شتەکە جێگیر کرا");
      setMatches((prev) => [
        {
          ...data.note,
          score: 100,
          distanceM: 0,
          hashDist: 0,
          colorDist: 0,
        },
        ...prev,
      ]);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-ink-950">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink-950/55 via-transparent to-ink-950/70" />

      {ready && (
        <div className="pointer-events-none absolute inset-x-0 top-1/3 h-24 overflow-hidden opacity-40">
          <div className="h-full w-full animate-scan-line bg-gradient-to-b from-transparent via-ember-400/30 to-transparent" />
        </div>
      )}

      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Link
          href="/"
          className="glass-panel flex items-center gap-2 rounded-full px-3 py-2 text-sm text-mist-100"
        >
          <ArrowRight size={16} />
          <span className="font-display text-lg leading-none text-ember-400">نیشانە</span>
        </Link>
        <div className="flex items-center gap-2">
          {ready && (
            <span
              className={`glass-panel rounded-full px-2.5 py-1 text-[11px] ${
                geoOk ? "text-emerald-300" : "text-amber-300"
              }`}
            >
              {geoOk ? "GPS" : "بێ GPS"}
            </span>
          )}
          {dbOk === false && (
            <span className="glass-panel flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] text-red-300">
              <WifiOff size={12} /> DB
            </span>
          )}
          <Link
            href="/notes"
            className="glass-panel rounded-full p-2 text-mist-100"
            aria-label="لیستی تێبینییەکان"
          >
            <List size={18} />
          </Link>
        </div>
      </header>

      <MatchOverlay matches={matches} onSelect={setViewNote} />

      {ready && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="reticle animate-reticle-pulse relative h-44 w-44 rounded-full border border-ember-400/50">
            <div className="absolute inset-3 rounded-full border border-dashed border-white/20" />
            <div className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-ember-400" />
            <div className="absolute bottom-0 left-1/2 h-3 w-px -translate-x-1/2 bg-ember-400" />
            <div className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-ember-400" />
            <div className="absolute right-0 top-1/2 h-px w-3 -translate-y-1/2 bg-ember-400" />
            <Crosshair
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-ember-400/80"
              size={22}
            />
          </div>
        </div>
      )}

      {/* شاشەی دەستپێکردن — کلیک پێویستە بۆ مۆڵەتی iOS */}
      {!started && !error && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-ink-950/92 px-6 text-center backdrop-blur-sm">
          <p className="font-display text-5xl text-ember-400">نیشانە</p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-mist-300">
            کامێراکەت بخە سەر شتێک، تێبینی بنووسە. کاتێ دووبارە دەیبینیتەوە
            نوسینەکەت دەگەڕێتەوە.
          </p>
          <button
            type="button"
            onClick={() => void beginSession()}
            disabled={starting}
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-ember-400 px-8 py-4 text-base font-semibold text-ink-950 shadow-[0_12px_40px_rgba(232,163,92,0.35)] disabled:opacity-60"
          >
            <Camera size={22} />
            {starting ? "دەستپێدەکات..." : "دەستپێکردن — کامێرا بکەرەوە"}
          </button>
          <p className="mt-4 text-xs text-mist-500">
            مۆڵەتی کامێرا (و ئەگەر گونجاو شوێن) بدە
          </p>
        </div>
      )}

      {ready && (
        <div className="absolute inset-x-0 bottom-0 z-30 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6">
          <p className="mb-3 text-center text-xs text-mist-200/90">{status}</p>
          {heading != null && (
            <p className="mb-3 text-center text-[11px] text-mist-500">
              ئاراستە: {Math.round(heading)}°
            </p>
          )}
          <div className="mx-auto flex max-w-md items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => void scanOnce()}
              className="glass-panel min-h-12 rounded-full px-4 py-3 text-sm text-mist-100"
            >
              گەڕان
            </button>
            <button
              type="button"
              onClick={openComposer}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-ember-400 text-ink-950 shadow-[0_0_40px_rgba(232,163,92,0.35)] transition active:scale-95 hover:bg-ember-300"
              aria-label="تێبینی زیاد بکە"
            >
              <Plus size={28} />
            </button>
            <button
              type="button"
              onClick={() => matches[0] && setViewNote(matches[0])}
              disabled={!matches.length}
              className="glass-panel min-h-12 rounded-full px-4 py-3 text-sm text-mist-100 disabled:opacity-40"
            >
              پیشاندان
            </button>
          </div>
          <p className="mt-3 text-center text-[11px] text-mist-500">
            دوگمەی نارنجی + = نوسین لەسەر شتەکە
          </p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-ink-950/90 p-6 text-center">
          <div className="max-w-sm">
            <p className="font-display text-3xl text-ember-400">کامێرا</p>
            <p className="mt-3 text-sm text-mist-300">{error}</p>
            <p className="mt-2 text-xs text-mist-500">
              Settings → Safari/Chrome → Camera = Allow. پاشان دووبارە هەوڵ بدە.
            </p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                void beginSession();
              }}
              className="mt-6 rounded-xl bg-ember-400 px-5 py-3 text-sm font-semibold text-ink-950"
            >
              دووبارە هەوڵبدە
            </button>
          </div>
        </div>
      )}

      <NoteComposer
        open={composerOpen}
        busy={saving}
        onClose={() => setComposerOpen(false)}
        onSubmit={saveNote}
      />

      {viewNote && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/75 p-3 backdrop-blur-sm sm:items-center">
          <div className="glass-panel animate-note-rise w-full max-w-md overflow-hidden rounded-2xl shadow-2xl">
            {viewNote.thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={viewNote.thumbnail}
                alt=""
                className="h-40 w-full object-cover"
              />
            )}
            <div className="p-5">
              <p className="text-xs text-ember-300">نیشانەی دۆزراوە</p>
              <h2 className="mt-1 font-display text-3xl text-mist-100">
                {viewNote.title}
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-mist-300">
                {viewNote.content}
              </p>
              <p className="mt-4 text-[11px] text-mist-500">
                هاوشێوەیی {Math.round(viewNote.score)}% ·{" "}
                {new Date(viewNote.createdAt).toLocaleString("ku")}
              </p>
              <button
                type="button"
                onClick={() => setViewNote(null)}
                className="mt-5 w-full rounded-xl bg-white/10 py-3 text-sm text-mist-100"
              >
                داخستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
