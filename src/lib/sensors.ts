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

export async function requestGeo(): Promise<GeoFix> {
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
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 2000 }
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
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 1500 }
  );
  return () => navigator.geolocation.clearWatch(id);
}

/** iOS پێویستی بە مۆڵەتی تایبەت هەیە بۆ قطب‌نما */
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
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  });
  video.srcObject = stream;
  await video.play();
  return stream;
}
