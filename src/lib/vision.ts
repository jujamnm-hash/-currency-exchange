/** نیشانەی بینراو — چەند هاش + پرۆفایلی ڕەنگ بۆ ناسینەوەی خۆڕاگرتر */

export type ColorProfile = {
  /** ٩ ناوچە × RGB ناوەند (٠–٢٥٥) */
  regions: number[];
  /** هیستۆگرامی سادەی ڕووناکی (٨ بن) */
  luma: number[];
  /** هاشە یاریدەدەرەکان (چەند قەبارەی چوارچێوە) */
  hashes?: string[];
};

export type VisualFingerprint = {
  imageHash: string;
  colorProfile: ColorProfile;
  thumbnail: string;
  hashes: string[];
};

const HASH_SIZE = 9; // 8×8 differences → 64 bits
const REGION_GRID = 3;
/** قەبارەکانی ناوەند بۆ خۆڕاگری گۆڕانی دووری/زوم */
const CROP_SCALES = [0.55, 0.72, 0.88];

function clampByte(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function luminance(r: number, g: number, b: number) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/** وێنە لە ڤیدیۆ بگرە و fingerprint دروست بکە */
export function captureFingerprint(
  video: HTMLVideoElement,
  options?: { thumbnailMax?: number }
): VisualFingerprint {
  const thumbMax = options?.thumbnailMax ?? 160;
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) {
    throw new Error("کامێرا ئامادە نییە");
  }

  const hashes: string[] = [];
  for (const scale of CROP_SCALES) {
    const side = Math.min(w, h) * scale;
    const sx = (w - side) / 2;
    const sy = (h - side) / 2;
    const hashCanvas = document.createElement("canvas");
    hashCanvas.width = HASH_SIZE;
    hashCanvas.height = HASH_SIZE;
    const hctx = hashCanvas.getContext("2d", { willReadFrequently: true })!;
    hctx.drawImage(video, sx, sy, side, side, 0, 0, HASH_SIZE, HASH_SIZE);
    const hashData = hctx.getImageData(0, 0, HASH_SIZE, HASH_SIZE).data;
    hashes.push(computeDHash(hashData, HASH_SIZE));
    hashes.push(computeAHash(hashData, HASH_SIZE));
  }

  // پرۆفایلی ڕەنگ لە ناوەندی سەرەکی
  const mainSide = Math.min(w, h) * 0.72;
  const sx = (w - mainSide) / 2;
  const sy = (h - mainSide) / 2;
  const regionCanvas = document.createElement("canvas");
  const regionSize = 48;
  regionCanvas.width = regionSize;
  regionCanvas.height = regionSize;
  const rctx = regionCanvas.getContext("2d", { willReadFrequently: true })!;
  rctx.drawImage(video, sx, sy, mainSide, mainSide, 0, 0, regionSize, regionSize);
  const regionData = rctx.getImageData(0, 0, regionSize, regionSize).data;
  const colorProfile = computeColorProfile(regionData, regionSize);
  colorProfile.hashes = hashes;

  const thumbCanvas = document.createElement("canvas");
  const scale = thumbMax / mainSide;
  thumbCanvas.width = Math.round(mainSide * scale);
  thumbCanvas.height = Math.round(mainSide * scale);
  const tctx = thumbCanvas.getContext("2d")!;
  tctx.drawImage(
    video,
    sx,
    sy,
    mainSide,
    mainSide,
    0,
    0,
    thumbCanvas.width,
    thumbCanvas.height
  );
  const thumbnail = thumbCanvas.toDataURL("image/jpeg", 0.55);

  return {
    imageHash: hashes[0],
    colorProfile,
    thumbnail,
    hashes,
  };
}

/** Difference hash */
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

  let hex = "";
  for (let i = 0; i < 64; i += 4) {
    hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}

/** Average hash — خۆڕاگرتر بۆ گۆڕانی گشتی ڕووناکی */
function computeAHash(data: Uint8ClampedArray, size: number): string {
  const gray: number[] = [];
  let sum = 0;
  const n = (size - 1) * (size - 1);
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const o = (y * size + x) * 4;
      const v = luminance(data[o], data[o + 1], data[o + 2]);
      gray.push(v);
      sum += v;
    }
  }
  const avg = sum / n;
  let bits = "";
  for (const v of gray) bits += v >= avg ? "1" : "0";
  while (bits.length < 64) bits += "0";
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
  if (!a || !b) return 64;
  const len = Math.min(a.length, b.length);
  let dist = 0;
  for (let i = 0; i < len; i++) {
    const x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    dist += (x & 1) + ((x >> 1) & 1) + ((x >> 2) & 1) + ((x >> 3) & 1);
  }
  dist += Math.abs(a.length - b.length) * 4;
  return dist;
}

/** کەمترین دووری نێوان دوو کۆمەڵە هاش */
export function bestHashDistance(query: string[], stored: string[]): number {
  if (!query.length || !stored.length) return 64;
  let best = 64;
  for (const q of query) {
    for (const s of stored) {
      best = Math.min(best, hammingDistanceHex(q, s));
    }
  }
  return best;
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

export function noteHashes(imageHash: string, profile: ColorProfile): string[] {
  const list = [imageHash, ...(profile.hashes ?? [])].filter(Boolean);
  return Array.from(new Set(list.map((h) => h.toLowerCase())));
}

/**
 * خاڵی هاوشێوەیی ٠–١٠٠ — نەرمتر بۆ گەڕانەوەی ڕاستەقینە
 */
export function matchScore(opts: {
  hashDist: number;
  colorDist: number;
  distanceM: number;
  headingDelta: number;
  radiusM: number;
  visualPrimary?: boolean;
}): number {
  // hashDist ٠–٣٢ هێشتا بەسوودە
  const hashScore = Math.max(0, 1 - opts.hashDist / 32);
  const colorScore = Math.max(0, 1 - opts.colorDist / 0.45);
  const distScore = Math.max(0, 1 - opts.distanceM / Math.max(opts.radiusM, 1));
  const headScore = Math.max(0, 1 - opts.headingDelta / 120);

  let combined: number;
  if (opts.visualPrimary) {
    combined = hashScore * 0.7 + colorScore * 0.3;
  } else {
    combined =
      hashScore * 0.5 + colorScore * 0.25 + distScore * 0.15 + headScore * 0.1;
  }
  return Math.round(combined * 1000) / 10;
}

/** ئایا ئەم هاش/ڕەنگە بەسە بۆ پیشاندان؟ */
export function isConfidentMatch(opts: {
  hashDist: number;
  colorDist: number;
  distanceM: number;
  score: number;
  minScore: number;
}): boolean {
  if (opts.score >= opts.minScore) return true;
  // هاشی زۆر نزیک — تەنانەت ئەگەر خاڵی گشتی نزم بێت
  if (opts.hashDist <= 12) return true;
  // نزیک لە شوێن + هاشی مامناوەند
  if (opts.distanceM <= 40 && opts.hashDist <= 20) return true;
  // ڕەنگ + هاش مامناوەند
  if (opts.hashDist <= 16 && opts.colorDist <= 0.22) return true;
  return false;
}
