export type GeoFix = {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
};

export type Orientation = {
  heading: number | null;
  beta: number | null;
  gamma: number | null;
};

/** شوێنی نەناسراو — تەنها نیشانەی بینراو + ئامێر بۆ گەڕانەوە */
export const FALLBACK_GEO: GeoFix = {
  latitude: 0,
  longitude: 0,
  accuracy: 99999,
  altitude: null,
};

export async function requestGeo(timeoutMs = 12000): Promise<GeoFix> {
  if (!navigator.geolocation) {
    throw new Error("GPS لەم ئامێرە پشتگیری ناکرێت");
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
        });
      },
      (err) => reject(new Error(err.message || "ناتوانرێت شوێن بخوێنرێتەوە")),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 5000 }
    );
  });
}

export function watchGeo(
  onFix: (fix: GeoFix) => void,
  onError?: (msg: string) => void
): () => void {
  if (!navigator.geolocation) {
    onError?.("GPS پشتگیری ناکرێت");
    return () => {};
  }
  const id = navigator.geolocation.watchPosition(
    (pos) => {
      onFix({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        altitude: pos.coords.altitude,
      });
    },
    (err) => onError?.(err.message || "هەڵەی GPS"),
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 3000 }
  );
  return () => navigator.geolocation.clearWatch(id);
}

/** دەبێت لە کلیکی بەکارهێنەر بانگ بکرێت (iOS) */
export async function ensureOrientationPermission(): Promise<boolean> {
  const DOE = DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<"granted" | "denied">;
  };
  if (typeof DOE.requestPermission === "function") {
    try {
      const state = await DOE.requestPermission();
      return state === "granted";
    } catch {
      return false;
    }
  }
  return true;
}

export function watchOrientation(onOrient: (o: Orientation) => void): () => void {
  const handler = (e: DeviceOrientationEvent) => {
    const anyE = e as DeviceOrientationEvent & { webkitCompassHeading?: number };
    let heading: number | null = null;
    if (typeof anyE.webkitCompassHeading === "number") {
      heading = anyE.webkitCompassHeading;
    } else if (typeof e.alpha === "number") {
      heading = (360 - e.alpha) % 360;
    }
    onOrient({
      heading,
      beta: e.beta,
      gamma: e.gamma,
    });
  };
  window.addEventListener("deviceorientation", handler, true);
  return () => window.removeEventListener("deviceorientation", handler, true);
}

export async function startCamera(
  video: HTMLVideoElement
): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("کامێرا لەم وێبگەڕە پشتگیری ناکرێت");
  }
  const attempts: MediaStreamConstraints[] = [
    {
      audio: false,
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    },
    { audio: false, video: { facingMode: "environment" } },
    { audio: false, video: true },
  ];

  let lastError: unknown;
  for (const constraints of attempts) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      video.muted = true;
      await video.play();
      return stream;
    } catch (err) {
      lastError = err;
    }
  }
  const msg =
    lastError instanceof Error ? lastError.message : "ناتوانرێت کامێرا بکرێتەوە";
  throw new Error(msg);
}
