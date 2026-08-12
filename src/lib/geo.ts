const EARTH_RADIUS_M = 6371000;

/** دووری هاڤێرسین بە مەتر */
export function distanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

/** جیاوازی ئاراستە (٠–١٨٠) */
export function headingDelta(a: number | null | undefined, b: number | null | undefined): number {
  if (a == null || b == null || Number.isNaN(a) || Number.isNaN(b)) return 90;
  let d = Math.abs(a - b) % 360;
  if (d > 180) d = 360 - d;
  return d;
}

/** باکسێکی نزیک بۆ فیلترکردنی خێرای SQL */
export function geoBoundingBox(lat: number, lon: number, radiusM: number) {
  const latDelta = radiusM / 111_320;
  const lonDelta = radiusM / (111_320 * Math.cos((lat * Math.PI) / 180) || 1);
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLon: lon - lonDelta,
    maxLon: lon + lonDelta,
  };
}
