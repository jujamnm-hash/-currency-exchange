/** نیشانەی بینراو — چەند هاش + ڕەنگ + لێواری بۆ ناسینەوەی خۆڕاگرتر */

export type ColorProfile = {
  regions: number[];
  luma: number[];
  hashes?: string[];
  /** تۆڕی وزەی لێوار (١٦ نرخ) */
  edges?: number[];
};

export type VisualFingerprint = {
  imageHash: string;
  colorProfile: ColorProfile;
  thumbnail: string;
  hashes: string[];
};

const HASH_SIZE = 9;
const REGION_GRID = 3;
const CROP_SCALES = [0.5, 0.68, 0.82, 0.92];
/** ئۆفسێتەکان بۆ خۆڕاگری جوڵەی کەمی کامێرا */
const OFFSETS: Array<[number, number]> = [
  [0, 0],
  [0.04, 0],
  [-0.04, 0],
  [0, 0.04],
  [0, -0.04],
];

function clampByte(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function luminance(r: number, g: number, b: number) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** وێنە لە ڤیدیۆ بگرە و fingerprint دروست بکە */
export function captureFingerprint(
  video: HTMLVideoElement,
  options?: { thumbnailMax?: number; rich?: boolean }
): VisualFingerprint {
  const thumbMax = options?.thumbnailMax ?? 160;
  const rich = options?.rich !== false;
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) {
    throw new Error("کامێرا ئامادە نییە");
  }

  const hashes: string[] = [];
  const offsets = rich ? OFFSETS : ([[0, 0]] as Array<[number, number]>);
  const scales = rich ? CROP_SCALES : [0.72];

  for (const scale of scales) {
    for (const [ox, oy] of offsets) {
      const side = Math.min(w, h) * scale;
      let sx = (w - side) / 2 + ox * w;
      let sy = (h - side) / 2 + oy * h;
      sx = Math.max(0, Math.min(w - side, sx));
      sy = Math.max(0, Math.min(h - side, sy));

      const hashCanvas = document.createElement("canvas");
      hashCanvas.width = HASH_SIZE;
      hashCanvas.height = HASH_SIZE;
      const hctx = hashCanvas.getContext("2d", { willReadFrequently: true })!;
      hctx.drawImage(video, sx, sy, side, side, 0, 0, HASH_SIZE, HASH_SIZE);
      const hashData = hctx.getImageData(0, 0, HASH_SIZE, HASH_SIZE).data;
      hashes.push(computeDHash(hashData, HASH_SIZE));
      hashes.push(computeAHash(hashData, HASH_SIZE));
    }
  }

  const uniqueHashes = Array.from(new Set(hashes));

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
  colorProfile.hashes = uniqueHashes;
  colorProfile.edges = computeEdgeGrid(regionData, regionSize);

  const thumbCanvas = document.createElement("canvas");
  const tScale = thumbMax / mainSide;
  thumbCanvas.width = Math.round(mainSide * tScale);
  thumbCanvas.height = Math.round(mainSide * tScale);
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
    imageHash: uniqueHashes[0],
    colorProfile,
    thumbnail,
    hashes: uniqueHashes,
  };
}

/** ٣–٥ چوارچێوە بگرە و یەکیان بکە — باشتر بۆ پاشەکەوت */
export async function captureMultiFrameFingerprint(
  video: HTMLVideoElement,
  frames = 4,
  gapMs = 140
): Promise<VisualFingerprint> {
  const collected: VisualFingerprint[] = [];
  for (let i = 0; i < frames; i++) {
    if (i > 0) await sleep(gapMs);
    if (video.readyState < 2) continue;
    collected.push(captureFingerprint(video, { thumbnailMax: 120, rich: true }));
  }
  if (!collected.length) {
    throw new Error("نەتوانرا وێنە بگردرێت — کامێرا جێگیر بکە");
  }
  return mergeFingerprints(collected);
}

export function mergeFingerprints(list: VisualFingerprint[]): VisualFingerprint {
  const allHashes = Array.from(new Set(list.flatMap((f) => f.hashes)));
  const regionLen = list[0].colorProfile.regions.length;
  const regions = new Array(regionLen).fill(0);
  const lumaLen = list[0].colorProfile.luma.length;
  const luma = new Array(lumaLen).fill(0);
  const edgeLen = list[0].colorProfile.edges?.length ?? 0;
  const edges = new Array(edgeLen).fill(0);

  for (const f of list) {
    for (let i = 0; i < regionLen; i++) regions[i] += f.colorProfile.regions[i] ?? 0;
    for (let i = 0; i < lumaLen; i++) luma[i] += f.colorProfile.luma[i] ?? 0;
    if (edgeLen && f.colorProfile.edges) {
      for (let i = 0; i < edgeLen; i++) edges[i] += f.colorProfile.edges[i] ?? 0;
    }
  }
  const n = list.length;
  const profile: ColorProfile = {
    regions: regions.map((v) => clampByte(v / n)),
    luma: luma.map((v) => Math.round((v / n) * 1000) / 1000),
    hashes: allHashes,
    edges: edgeLen ? edges.map((v) => Math.round((v / n) * 1000) / 1000) : undefined,
  };

  // باشترین thumbnail — یەکەم
  return {
    imageHash: allHashes[0],
    colorProfile: profile,
    thumbnail: list[0].thumbnail,
    hashes: allHashes,
  };
}

function computeDHash(data: Uint8ClampedArray, size: number): string {
  const gray: number[] = [];
  for (let i = 0; i < size * size; i++) {
    const o = i * 4;
    gray.push(luminance(data[o], data[o + 1], data[o + 2]));
  }
  let bits = "";
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      bits += gray[y * size + x] < gray[y * size + x + 1] ? "1" : "0";
    }
  }
  let hex = "";
  for (let i = 0; i < 64; i += 4) {
    hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}

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
  return {
    regions,
    luma: luma.map((v) => Math.round((v / total) * 1000) / 1000),
  };
}

/** تۆڕی ٤×٤ وزەی لێوار */
function computeEdgeGrid(data: Uint8ClampedArray, size: number): number[] {
  const grid = 4;
  const cell = Math.floor(size / grid);
  const out: number[] = [];
  for (let gy = 0; gy < grid; gy++) {
    for (let gx = 0; gx < grid; gx++) {
      let energy = 0;
      let n = 0;
      const x0 = gx * cell;
      const y0 = gy * cell;
      for (let y = y0; y < y0 + cell - 1; y++) {
        for (let x = x0; x < x0 + cell - 1; x++) {
          const o = (y * size + x) * 4;
          const oR = (y * size + x + 1) * 4;
          const oD = ((y + 1) * size + x) * 4;
          const L = luminance(data[o], data[o + 1], data[o + 2]);
          const R = luminance(data[oR], data[oR + 1], data[oR + 2]);
          const D = luminance(data[oD], data[oD + 1], data[oD + 2]);
          energy += Math.abs(L - R) + Math.abs(L - D);
          n++;
        }
      }
      out.push(Math.round(((energy / (n || 1)) / 255) * 1000) / 1000);
    }
  }
  return out;
}

function edgeDistance(a?: number[], b?: number[]): number {
  if (!a?.length || !b?.length) return 0.5;
  const len = Math.min(a.length, b.length);
  let sum = 0;
  for (let i = 0; i < len; i++) sum += Math.abs(a[i] - b[i]);
  return sum / len;
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

/**
 * دووری هاش بە کۆدەنگی — کەمتر فڕۆشەپۆزیتیڤ
 * best تەنها بەس نییە؛ دەبێت چەند هاش نزیک بن.
 */
export function consensusHashDistance(
  query: string[],
  stored: string[]
): { best: number; avgTop: number; closeHits: number } {
  if (!query.length || !stored.length) {
    return { best: 64, avgTop: 64, closeHits: 0 };
  }
  const perQuery: number[] = [];
  for (const q of query) {
    let best = 64;
    for (const s of stored) {
      best = Math.min(best, hammingDistanceHex(q, s));
    }
    perQuery.push(best);
  }
  perQuery.sort((a, b) => a - b);
  const best = perQuery[0] ?? 64;
  const topN = perQuery.slice(0, Math.min(5, perQuery.length));
  const avgTop = topN.reduce((a, b) => a + b, 0) / topN.length;
  const closeHits = perQuery.filter((d) => d <= 12).length;
  return { best, avgTop, closeHits };
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
  const eDist = edgeDistance(a.edges, b.edges);
  return regionScore * 0.55 + lumaScore * 0.25 + eDist * 0.2;
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

export function matchScore(opts: {
  hashDist: number;
  colorDist: number;
  distanceM: number;
  headingDelta: number;
  radiusM: number;
  visualPrimary?: boolean;
  avgHashDist?: number;
  closeHits?: number;
}): number {
  const hashScore = Math.max(0, 1 - opts.hashDist / 16);
  const avgScore =
    opts.avgHashDist != null ? Math.max(0, 1 - opts.avgHashDist / 18) : hashScore;
  const colorScore = Math.max(0, 1 - opts.colorDist / 0.28);
  const hitBonus = Math.min(1, (opts.closeHits ?? 0) / 4);

  // GPS ناتوانێت بە تەنها match دروست بکات — تەنها بینراو
  const combined =
    hashScore * 0.45 + avgScore * 0.2 + colorScore * 0.25 + hitBonus * 0.1;
  return Math.round(combined * 1000) / 10;
}

/**
 * تەنها کاتێ ڕاستە کە شتەکە بەڕاستی هاوشێوەی بینراو بێت.
 * نزیکبوونی GPS بەس نییە.
 */
export function isConfidentMatch(opts: {
  hashDist: number;
  colorDist: number;
  distanceM: number;
  score: number;
  minScore: number;
  avgHashDist?: number;
  closeHits?: number;
}): boolean {
  const avg = opts.avgHashDist ?? opts.hashDist;
  const hits = opts.closeHits ?? 0;

  const strongVisual =
    opts.hashDist <= 10 && opts.colorDist <= 0.18 && opts.score >= opts.minScore;
  const consensusVisual =
    opts.hashDist <= 12 &&
    avg <= 14 &&
    hits >= 2 &&
    opts.colorDist <= 0.2 &&
    opts.score >= opts.minScore;
  const veryStrongHash =
    opts.hashDist <= 7 && opts.colorDist <= 0.25 && opts.score >= opts.minScore - 5;

  return strongVisual || consensusVisual || veryStrongHash;
}

/** گەڕانی خێرای خۆجێیی — توند؛ تەنها هەمان شت */
export function scoreLocalNote(
  fp: VisualFingerprint,
  note: {
    imageHash: string;
    colorProfile: string;
    latitude: number;
    longitude: number;
  },
  _geo?: { latitude: number; longitude: number } | null
): {
  score: number;
  hashDist: number;
  colorDist: number;
  avgHashDist: number;
  closeHits: number;
} {
  const profile = parseColorProfile(note.colorProfile);
  const stored = noteHashes(note.imageHash, profile);
  const consensus = consensusHashDistance(fp.hashes, stored);
  const cDist = colorDistance(fp.colorProfile, profile);
  const score = matchScore({
    hashDist: consensus.best,
    colorDist: cDist,
    distanceM: 0,
    headingDelta: 90,
    radiusM: 200,
    visualPrimary: true,
    avgHashDist: consensus.avgTop,
    closeHits: consensus.closeHits,
  });
  return {
    score,
    hashDist: consensus.best,
    colorDist: cDist,
    avgHashDist: consensus.avgTop,
    closeHits: consensus.closeHits,
  };
}
