/** نیشانەی بینراو — dHash + پرۆفایلی ڕەنگ بۆ ناسینەوەی شت/شوێن */

export type ColorProfile = {
  /** ٩ ناوچە × RGB ناوەند (٠–٢٥٥) */
  regions: number[];
  /** هیستۆگرامی سادەی ڕووناکی (٨ بن) */
  luma: number[];
};

export type VisualFingerprint = {
  imageHash: string;
  colorProfile: ColorProfile;
  thumbnail: string;
};

const HASH_SIZE = 9; // 8×8 differences → 64 bits
const REGION_GRID = 3;

function clampByte(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

/** وێنە لە ڤیدیۆ بگرە و fingerprint دروست بکە */
export function captureFingerprint(
  video: HTMLVideoElement,
  options?: { thumbnailMax?: number }
): VisualFingerprint {
  const thumbMax = options?.thumbnailMax ?? 180;
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) {
    throw new Error("کامێرا ئامادە نییە");
  }

  // ناوەندی چوارچێوە — سەرنجی شتەکە
  const side = Math.min(w, h) * 0.72;
  const sx = (w - side) / 2;
  const sy = (h - side) / 2;

  const hashCanvas = document.createElement("canvas");
  hashCanvas.width = HASH_SIZE;
  hashCanvas.height = HASH_SIZE;
  const hctx = hashCanvas.getContext("2d", { willReadFrequently: true })!;
  hctx.drawImage(video, sx, sy, side, side, 0, 0, HASH_SIZE, HASH_SIZE);
  const hashData = hctx.getImageData(0, 0, HASH_SIZE, HASH_SIZE).data;
  const imageHash = computeDHash(hashData, HASH_SIZE);

  const regionCanvas = document.createElement("canvas");
  const regionSize = 48;
  regionCanvas.width = regionSize;
  regionCanvas.height = regionSize;
  const rctx = regionCanvas.getContext("2d", { willReadFrequently: true })!;
  rctx.drawImage(video, sx, sy, side, side, 0, 0, regionSize, regionSize);
  const regionData = rctx.getImageData(0, 0, regionSize, regionSize).data;
  const colorProfile = computeColorProfile(regionData, regionSize);

  const thumbCanvas = document.createElement("canvas");
  const scale = thumbMax / side;
  thumbCanvas.width = Math.round(side * scale);
  thumbCanvas.height = Math.round(side * scale);
  const tctx = thumbCanvas.getContext("2d")!;
  tctx.drawImage(video, sx, sy, side, side, 0, 0, thumbCanvas.width, thumbCanvas.height);
  const thumbnail = thumbCanvas.toDataURL("image/jpeg", 0.62);

  return { imageHash, colorProfile, thumbnail };
}

function luminance(r: number, g: number, b: number) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/** Difference hash — بەراوردکردنی خێرا و خۆڕاگر بۆ گۆڕانی ڕووناکی */
function computeDHash(data: Uint8ClampedArray, size: number): string {
  const gray: number[] = [];
  for (let i = 0; i < size * size; i++) {
    const o = i * 4;
    gray.push(luminance(data[o], data[o + 1], data[o + 2]));
  }

  let bits = "";
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const left = gray[y * size + x];
      const right = gray[y * size + x + 1];
      bits += left < right ? "1" : "0";
    }
  }

  // ٦٤ بیت → ١٦ hex
  let hex = "";
  for (let i = 0; i < 64; i += 4) {
    hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}

function computeColorProfile(data: Uint8ClampedArray, size: number): ColorProfile {
  const cell = Math.floor(size / REGION_GRID);
  const regions: number[] = [];
  const luma = new Array(8).fill(0);

  for (let gy = 0; gy < REGION_GRID; gy++) {
    for (let gx = 0; gx < REGION_GRID; gx++) {
      let r = 0,
        g = 0,
        b = 0,
        n = 0;
      const x0 = gx * cell;
      const y0 = gy * cell;
      for (let y = y0; y < y0 + cell; y++) {
        for (let x = x0; x < x0 + cell; x++) {
          const o = (y * size + x) * 4;
          r += data[o];
          g += data[o + 1];
          b += data[o + 2];
          const L = luminance(data[o], data[o + 1], data[o + 2]);
          luma[Math.min(7, Math.floor(L / 32))]++;
          n++;
        }
      }
      regions.push(clampByte(r / n), clampByte(g / n), clampByte(b / n));
    }
  }

  const total = luma.reduce((a, c) => a + c, 0) || 1;
  const lumaNorm = luma.map((v) => Math.round((v / total) * 1000) / 1000);
  return { regions, luma: lumaNorm };
}

export function hammingDistanceHex(a: string, b: string): number {
  if (!a || !b || a.length !== b.length) return 64;
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    const x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    dist += (x & 1) + ((x >> 1) & 1) + ((x >> 2) & 1) + ((x >> 3) & 1);
  }
  return dist;
}

export function colorDistance(a: ColorProfile, b: ColorProfile): number {
  if (!a?.regions?.length || !b?.regions?.length) return 1;
  const len = Math.min(a.regions.length, b.regions.length);
  let sum = 0;
  for (let i = 0; i < len; i++) {
    sum += Math.abs(a.regions[i] - b.regions[i]);
  }
  const regionScore = sum / (len * 255);

  let lumaSum = 0;
  const bins = Math.min(a.luma?.length ?? 0, b.luma?.length ?? 0);
  for (let i = 0; i < bins; i++) {
    lumaSum += Math.abs((a.luma[i] ?? 0) - (b.luma[i] ?? 0));
  }
  const lumaScore = bins ? lumaSum / 2 : 1;
  return regionScore * 0.7 + lumaScore * 0.3;
}

export function parseColorProfile(raw: string): ColorProfile {
  try {
    return JSON.parse(raw) as ColorProfile;
  } catch {
    return { regions: [], luma: [] };
  }
}

/**
 * خاڵی هاوشێوەیی ٠–١٠٠
 * hash نزیک + ڕەنگ هاوشێوە + دووری کەم + ئاراستەی هاوشێوە
 */
export function matchScore(opts: {
  hashDist: number;
  colorDist: number;
  distanceM: number;
  headingDelta: number;
  radiusM: number;
}): number {
  const hashScore = Math.max(0, 1 - opts.hashDist / 22);
  const colorScore = Math.max(0, 1 - opts.colorDist / 0.35);
  const distScore = Math.max(0, 1 - opts.distanceM / opts.radiusM);
  const headScore = Math.max(0, 1 - opts.headingDelta / 80);

  const combined =
    hashScore * 0.45 + colorScore * 0.25 + distScore * 0.2 + headScore * 0.1;
  return Math.round(combined * 1000) / 10;
}
