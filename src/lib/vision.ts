/** ناسنامەی بینراوی شت — pHash + پاتچ + هاش + ڕەنگ + لێوار */

export type ColorProfile = {
  regions: number[];
  luma: number[];
  hashes?: string[];
  edges?: number[];
  /** perceptual hash ١٦ hex */
  phash?: string;
  /** پاتچی ١٦×١٦ خۆلێکراو (٠–٢٥٥) بۆ بەراوردکردنی قاڵب */
  patch?: number[];
  /** چەند پاتچی جێگیر لە multi-frame */
  patches?: number[][];
  /** HOG بچووک (٣٢ نرخ) */
  hog?: number[];
  /** BRIEF-like ١٦ hex */
  brief?: string;
};

export type VisualFingerprint = {
  imageHash: string;
  colorProfile: ColorProfile;
  thumbnail: string;
  hashes: string[];
  /** Laplacian variance — بەرزتر = ڕوونتر */
  sharpness?: number;
};

const HASH_SIZE = 9;
const REGION_GRID = 3;
const PATCH_SIZE = 16;
/** تەنها ناوەند — ئۆفسێت فڕۆشەپۆزیتیڤ زیاد دەکات */
const CROP_SCALES = [0.62, 0.72, 0.84];

function clampByte(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function luminance(r: number, g: number, b: number) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function centerCrop(
  video: HTMLVideoElement,
  scale: number
): { sx: number; sy: number; side: number } {
  const w = video.videoWidth;
  const h = video.videoHeight;
  const side = Math.min(w, h) * scale;
  return { sx: (w - side) / 2, sy: (h - side) / 2, side };
}

/** وێنە لە ڤیدیۆ بگرە و ناسنامە دروست بکە */
export function captureFingerprint(
  video: HTMLVideoElement,
  options?: { thumbnailMax?: number; rich?: boolean }
): VisualFingerprint {
  const thumbMax = options?.thumbnailMax ?? 140;
  const rich = options?.rich !== false;
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) throw new Error("کامێرا ئامادە نییە");

  const hashes: string[] = [];
  const scales = rich ? CROP_SCALES : [0.72];

  for (const scale of scales) {
    const { sx, sy, side } = centerCrop(video, scale);
    const hashCanvas = document.createElement("canvas");
    hashCanvas.width = HASH_SIZE;
    hashCanvas.height = HASH_SIZE;
    const hctx = hashCanvas.getContext("2d", { willReadFrequently: true })!;
    hctx.drawImage(video, sx, sy, side, side, 0, 0, HASH_SIZE, HASH_SIZE);
    const hashData = hctx.getImageData(0, 0, HASH_SIZE, HASH_SIZE).data;
    hashes.push(computeDHash(hashData, HASH_SIZE));
    hashes.push(computeAHash(hashData, HASH_SIZE));
  }

  // پاتچ + pHash لە ناوەندی سەرەکی
  const main = centerCrop(video, 0.72);
  const patchCanvas = document.createElement("canvas");
  patchCanvas.width = 32;
  patchCanvas.height = 32;
  const pctx = patchCanvas.getContext("2d", { willReadFrequently: true })!;
  pctx.drawImage(video, main.sx, main.sy, main.side, main.side, 0, 0, 32, 32);
  const patch32 = pctx.getImageData(0, 0, 32, 32).data;
  const phash = computePHash(patch32, 32);
  hashes.push(phash);

  const patch = extractPatch(patch32, 32, PATCH_SIZE);

  const regionCanvas = document.createElement("canvas");
  const regionSize = 48;
  regionCanvas.width = regionSize;
  regionCanvas.height = regionSize;
  const rctx = regionCanvas.getContext("2d", { willReadFrequently: true })!;
  rctx.drawImage(
    video,
    main.sx,
    main.sy,
    main.side,
    main.side,
    0,
    0,
    regionSize,
    regionSize
  );
  const regionData = rctx.getImageData(0, 0, regionSize, regionSize).data;
  const colorProfile = computeColorProfile(regionData, regionSize);
  const uniqueHashes = Array.from(new Set(hashes));
  colorProfile.hashes = uniqueHashes;
  colorProfile.edges = computeEdgeGrid(regionData, regionSize);
  colorProfile.phash = phash;
  colorProfile.patch = patch;
  colorProfile.hog = computeHog(regionData, regionSize);

  const thumbCanvas = document.createElement("canvas");
  const tScale = thumbMax / main.side;
  thumbCanvas.width = Math.round(main.side * tScale);
  thumbCanvas.height = Math.round(main.side * tScale);
  const tctx = thumbCanvas.getContext("2d")!;
  tctx.drawImage(
    video,
    main.sx,
    main.sy,
    main.side,
    main.side,
    0,
    0,
    thumbCanvas.width,
    thumbCanvas.height
  );
  const thumbnail = thumbCanvas.toDataURL("image/jpeg", 0.55);

  const sharpness = measureSharpness(patch32, 32);
  colorProfile.brief = computeBrief(patch);

  return {
    imageHash: uniqueHashes[0],
    colorProfile,
    thumbnail,
    hashes: uniqueHashes,
    sharpness,
  };
}

export async function captureMultiFrameFingerprint(
  video: HTMLVideoElement,
  frames = 8,
  gapMs = 100
): Promise<VisualFingerprint> {
  const collected: VisualFingerprint[] = [];
  for (let i = 0; i < frames; i++) {
    if (i > 0) await sleep(gapMs);
    if (video.readyState < 2) continue;
    const fp = captureFingerprint(video, { thumbnailMax: 120, rich: true });
    // فڕێدانی وێنەی لێڵ
    if ((fp.sharpness ?? 0) < 18) continue;
    collected.push(fp);
  }
  if (collected.length < 3) {
    throw new Error("وێنە لێڵە یان لەرزی — ڕوونایی باشتر و جێگیر بمێنەوە");
  }

  // تەنها چوارچێوە جێگیرەکان بهێڵەرەوە (phash نزیک لە یەکتر)
  const withPh = collected.filter((f) => f.colorProfile.phash);
  const ref = withPh[Math.floor(withPh.length / 2)]?.colorProfile.phash;
  let stable = collected;
  if (ref) {
    stable = collected.filter((f) => {
      const p = f.colorProfile.phash;
      if (!p) return false;
      return hammingDistanceHex(p, ref) <= 10;
    });
    if (stable.length < 3) stable = collected;
  }

  // پێویستە پاتچەکان لێکچووبن
  const patches = stable
    .map((f) => f.colorProfile.patch)
    .filter((p): p is number[] => Boolean(p?.length));
  if (patches.length >= 2) {
    const base = patches[0];
    const ok = patches.filter((p) => patchSimilarity(base, p) >= 0.75);
    if (ok.length >= 2) {
      stable = stable.filter((f) =>
        f.colorProfile.patch ? patchSimilarity(base, f.colorProfile.patch) >= 0.75 : false
      );
    }
  }

  if (stable.length < 2) {
    throw new Error("کامێرا لەرزی — جێگیر بمێنەوە و دووبارە هەوڵ بدە");
  }
  return mergeFingerprints(stable);
}

export function mergeFingerprints(list: VisualFingerprint[]): VisualFingerprint {
  const allHashes = Array.from(new Set(list.flatMap((f) => f.hashes)));
  const regionLen = list[0].colorProfile.regions.length;
  const regions = new Array(regionLen).fill(0);
  const lumaLen = list[0].colorProfile.luma.length;
  const luma = new Array(lumaLen).fill(0);
  const edgeLen = list[0].colorProfile.edges?.length ?? 0;
  const edges = new Array(edgeLen).fill(0);
  const patchLen = list[0].colorProfile.patch?.length ?? 0;
  const patch = new Array(patchLen).fill(0);
  const phashes = list.map((f) => f.colorProfile.phash).filter(Boolean) as string[];

  for (const f of list) {
    for (let i = 0; i < regionLen; i++) regions[i] += f.colorProfile.regions[i] ?? 0;
    for (let i = 0; i < lumaLen; i++) luma[i] += f.colorProfile.luma[i] ?? 0;
    if (edgeLen && f.colorProfile.edges) {
      for (let i = 0; i < edgeLen; i++) edges[i] += f.colorProfile.edges[i] ?? 0;
    }
    if (patchLen && f.colorProfile.patch) {
      for (let i = 0; i < patchLen; i++) patch[i] += f.colorProfile.patch[i] ?? 0;
    }
  }
  const n = list.length;
  const hogLen = list[0].colorProfile.hog?.length ?? 0;
  const hog = new Array(hogLen).fill(0);
  if (hogLen) {
    for (const f of list) {
      if (!f.colorProfile.hog) continue;
      for (let i = 0; i < hogLen; i++) hog[i] += f.colorProfile.hog[i] ?? 0;
    }
  }
  const patches = list
    .map((f) => f.colorProfile.patch)
    .filter((p): p is number[] => Boolean(p?.length))
    .slice(0, 5);

  const profile: ColorProfile = {
    regions: regions.map((v) => clampByte(v / n)),
    luma: luma.map((v) => Math.round((v / n) * 1000) / 1000),
    hashes: allHashes,
    edges: edgeLen ? edges.map((v) => Math.round((v / n) * 1000) / 1000) : undefined,
    phash: phashes[Math.floor(phashes.length / 2)] ?? phashes[0],
    patch: patchLen ? patch.map((v) => clampByte(v / n)) : undefined,
    patches: patches.length ? patches : undefined,
    hog: hogLen ? hog.map((v) => Math.round((v / n) * 1000) / 1000) : undefined,
    brief: list.map((f) => f.colorProfile.brief).filter(Boolean)[
      Math.floor(list.length / 2)
    ] as string | undefined,
  };

  return {
    imageHash: allHashes[0],
    colorProfile: profile,
    thumbnail: list[Math.floor(list.length / 2)].thumbnail,
    hashes: allHashes,
  };
}

function rgbaToGray(data: Uint8ClampedArray, size: number): number[] {
  const gray: number[] = [];
  for (let i = 0; i < size * size; i++) {
    const o = i * 4;
    gray.push(luminance(data[o], data[o + 1], data[o + 2]));
  }
  return gray;
}

function computeDHash(data: Uint8ClampedArray, size: number): string {
  const gray = rgbaToGray(data, size);
  let bits = "";
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      bits += gray[y * size + x] < gray[y * size + x + 1] ? "1" : "0";
    }
  }
  return bitsToHex(bits, 64);
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
  return bitsToHex(bits, 64);
}

/** pHash سادە — DCT ـی ٨×٨ لەسەر ٣٢×٣٢ */
function computePHash(data: Uint8ClampedArray, size: number): string {
  const gray = rgbaToGray(data, size);
  // بچووککردن بۆ ٨×٨ بە ناوەندگیری
  const small = 8;
  const cell = size / small;
  const vals: number[] = [];
  for (let y = 0; y < small; y++) {
    for (let x = 0; x < small; x++) {
      let s = 0;
      let n = 0;
      const x0 = Math.floor(x * cell);
      const y0 = Math.floor(y * cell);
      const x1 = Math.floor((x + 1) * cell);
      const y1 = Math.floor((y + 1) * cell);
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          s += gray[yy * size + xx];
          n++;
        }
      }
      vals.push(s / (n || 1));
    }
  }
  // DCT ـی جیاکاری نزیکەیی: بەراورد لەگەڵ ناوەند (بێ DC)
  const mean =
    vals.slice(1).reduce((a, b) => a + b, 0) / Math.max(1, vals.length - 1);
  let bits = "";
  for (let i = 0; i < 64; i++) {
    bits += (vals[i] ?? 0) >= mean ? "1" : "0";
  }
  return bitsToHex(bits, 64);
}

function bitsToHex(bits: string, len: number): string {
  let b = bits;
  while (b.length < len) b += "0";
  let hex = "";
  for (let i = 0; i < len; i += 4) {
    hex += parseInt(b.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}

/** پاتچی خۆلێکراو (mean/std) بۆ خۆڕاگری ڕووناکی */
function extractPatch(
  data: Uint8ClampedArray,
  srcSize: number,
  outSize: number
): number[] {
  const gray = rgbaToGray(data, srcSize);
  const cell = srcSize / outSize;
  const patch: number[] = [];
  for (let y = 0; y < outSize; y++) {
    for (let x = 0; x < outSize; x++) {
      let s = 0;
      let n = 0;
      const x0 = Math.floor(x * cell);
      const y0 = Math.floor(y * cell);
      const x1 = Math.floor((x + 1) * cell);
      const y1 = Math.floor((y + 1) * cell);
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          s += gray[yy * srcSize + xx];
          n++;
        }
      }
      patch.push(s / (n || 1));
    }
  }
  const mean = patch.reduce((a, b) => a + b, 0) / patch.length;
  let varSum = 0;
  for (const v of patch) varSum += (v - mean) ** 2;
  const std = Math.sqrt(varSum / patch.length) || 1;
  return patch.map((v) => clampByte(((v - mean) / std) * 40 + 128));
}

/** هاوشێوەیی پاتچ ٠–١ (normalized correlation) */
export function patchSimilarity(a?: number[], b?: number[]): number {
  if (!a?.length || !b?.length) return 0;
  const len = Math.min(a.length, b.length);
  let sumA = 0,
    sumB = 0;
  for (let i = 0; i < len; i++) {
    sumA += a[i];
    sumB += b[i];
  }
  const meanA = sumA / len;
  const meanB = sumB / len;
  let num = 0,
    denA = 0,
    denB = 0;
  for (let i = 0; i < len; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  const den = Math.sqrt(denA * denB) || 1;
  const corr = num / den; // -1..1
  return Math.max(0, Math.min(1, (corr + 1) / 2));
}


/** SSIM سادە لەسەر پاتچ ٠–١ */

/** Laplacian variance — پێوانی ڕوونی وێنە */
export function measureSharpness(data: Uint8ClampedArray, size: number): number {
  const gray: number[] = [];
  for (let i = 0; i < size * size; i++) {
    const o = i * 4;
    gray.push(luminance(data[o], data[o + 1], data[o + 2]));
  }
  const vals: number[] = [];
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const lap =
        gray[(y - 1) * size + x] +
        gray[(y + 1) * size + x] +
        gray[y * size + x - 1] +
        gray[y * size + x + 1] -
        4 * gray[y * size + x];
      vals.push(lap);
    }
  }
  const mean = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
  let v = 0;
  for (const x of vals) v += (x - mean) ** 2;
  return Math.round((v / (vals.length || 1)) * 10) / 10;
}

/** BRIEF سادە لەسەر پاتچ */
function computeBrief(patch: number[]): string {
  // جووتە خاڵی جێگیر
  const pairs: Array<[number, number]> = [];
  for (let i = 0; i < 64; i++) {
    const a = (i * 37) % patch.length;
    const b = (i * 91 + 17) % patch.length;
    pairs.push([a, b]);
  }
  let bits = "";
  for (const [a, b] of pairs) {
    bits += (patch[a] ?? 0) < (patch[b] ?? 0) ? "1" : "0";
  }
  let hex = "";
  for (let i = 0; i < 64; i += 4) {
    hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}

export type CaptureQuality = {
  ok: boolean;
  sharpness: number;
  score: number;
  message: string;
};

/** پێوانی ئامادەیی تۆمار لەسەر چوارچێوەی ئێستا */
export function assessCaptureQuality(fp: VisualFingerprint): CaptureQuality {
  const sharpness = fp.sharpness ?? 0;
  const sharpScore = Math.max(0, Math.min(1, sharpness / 60));
  const hasPatch = Boolean(fp.colorProfile.patch?.length);
  const hasPhash = Boolean(fp.colorProfile.phash);
  const score = Math.round(
    (sharpScore * 0.55 + (hasPatch ? 0.25 : 0) + (hasPhash ? 0.2 : 0)) * 100
  );
  if (sharpness < 18) {
    return {
      ok: false,
      sharpness,
      score,
      message: "وێنە لێڵە — ڕوونایی زیاد بکە یان جێگیر بمێنەوە",
    };
  }
  if (sharpness < 28) {
    return {
      ok: false,
      sharpness,
      score,
      message: "هێشتا کەمێک لێڵە — جێگیرتر بمێنەوە",
    };
  }
  return {
    ok: true,
    sharpness,
    score: Math.max(score, 75),
    message: "ناسنامە ئامادەیە — دەتوانیت تۆمار بکەیت",
  };
}

export function patchSSIM(a?: number[], b?: number[]): number {
  if (!a?.length || !b?.length) return 0;
  const len = Math.min(a.length, b.length);
  let sumA = 0,
    sumB = 0;
  for (let i = 0; i < len; i++) {
    sumA += a[i];
    sumB += b[i];
  }
  const meanA = sumA / len;
  const meanB = sumB / len;
  let varA = 0,
    varB = 0,
    cov = 0;
  for (let i = 0; i < len; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    varA += da * da;
    varB += db * db;
    cov += da * db;
  }
  varA /= len;
  varB /= len;
  cov /= len;
  const c1 = (0.01 * 255) ** 2;
  const c2 = (0.03 * 255) ** 2;
  const num = (2 * meanA * meanB + c1) * (2 * cov + c2);
  const den = (meanA ** 2 + meanB ** 2 + c1) * (varA + varB + c2);
  return Math.max(0, Math.min(1, num / (den || 1)));
}

/** باشترین هاوشێوەیی نێوان پاتچی ئێستا و پاتچە پاشەکەوتکراوەکان */
export function bestPatchScore(
  query?: number[],
  stored?: number[],
  extras?: number[][]
): { ncc: number; ssim: number; combined: number } {
  const list = [stored, ...(extras ?? [])].filter(
    (p): p is number[] => Boolean(p?.length)
  );
  if (!query?.length || !list.length) return { ncc: 0, ssim: 0, combined: 0 };

  // خۆڕاگری قەبارە: query لە ٣ قەبارە
  const queries = [0.92, 1, 1.08].map((s) => resizePatch(query, PATCH_SIZE, s));

  let bestN = 0,
    bestS = 0;
  for (const q of queries) {
    for (const p of list) {
      bestN = Math.max(bestN, patchSimilarity(q, p));
      bestS = Math.max(bestS, patchSSIM(q, p));
    }
  }
  return { ncc: bestN, ssim: bestS, combined: bestN * 0.55 + bestS * 0.45 };
}

function resizePatch(patch: number[], size: number, scale: number): number[] {
  const out: number[] = [];
  const cx = (size - 1) / 2;
  const cy = (size - 1) / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sx = cx + (x - cx) / scale;
      const sy = cy + (y - cy) / scale;
      const x0 = Math.max(0, Math.min(size - 1, Math.floor(sx)));
      const y0 = Math.max(0, Math.min(size - 1, Math.floor(sy)));
      const x1 = Math.min(size - 1, x0 + 1);
      const y1 = Math.min(size - 1, y0 + 1);
      const fx = sx - x0;
      const fy = sy - y0;
      const v00 = patch[y0 * size + x0] ?? 128;
      const v10 = patch[y0 * size + x1] ?? 128;
      const v01 = patch[y1 * size + x0] ?? 128;
      const v11 = patch[y1 * size + x1] ?? 128;
      const v =
        v00 * (1 - fx) * (1 - fy) +
        v10 * fx * (1 - fy) +
        v01 * (1 - fx) * fy +
        v11 * fx * fy;
      out.push(v);
    }
  }
  return out;
}

export function hogSimilarity(a?: number[], b?: number[]): number {
  if (!a?.length || !b?.length) return 0.5;
  const len = Math.min(a.length, b.length);
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const cos = dot / (Math.sqrt(na * nb) || 1);
  return Math.max(0, Math.min(1, (cos + 1) / 2));
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


/** HOG بچووک: ٢×٢ خانە × ٨ ئاراستە = ٣٢ */
function computeHog(data: Uint8ClampedArray, size: number): number[] {
  const gray: number[] = [];
  for (let i = 0; i < size * size; i++) {
    const o = i * 4;
    gray.push(luminance(data[o], data[o + 1], data[o + 2]));
  }
  const cells = 2;
  const bins = 8;
  const cell = Math.floor(size / cells);
  const hist = new Array(cells * cells * bins).fill(0);
  for (let cy = 0; cy < cells; cy++) {
    for (let cx = 0; cx < cells; cx++) {
      const base = (cy * cells + cx) * bins;
      for (let y = cy * cell + 1; y < (cy + 1) * cell - 1; y++) {
        for (let x = cx * cell + 1; x < (cx + 1) * cell - 1; x++) {
          const gx = gray[y * size + x + 1] - gray[y * size + x - 1];
          const gy = gray[(y + 1) * size + x] - gray[(y - 1) * size + x];
          const mag = Math.hypot(gx, gy);
          let ang = (Math.atan2(gy, gx) + Math.PI) / (2 * Math.PI); // 0..1
          if (ang >= 1) ang = 0;
          const bin = Math.min(bins - 1, Math.floor(ang * bins));
          hist[base + bin] += mag;
        }
      }
    }
  }
  const norm = Math.hypot(...hist) || 1;
  return hist.map((v) => Math.round((v / norm) * 1000) / 1000);
}

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
  const topN = perQuery.slice(0, Math.min(4, perQuery.length));
  const avgTop = topN.reduce((a, b) => a + b, 0) / topN.length;
  const closeHits = perQuery.filter((d) => d <= 10).length;
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
  const list = [imageHash, ...(profile.hashes ?? []), profile.phash ?? ""].filter(
    Boolean
  );
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
  patchSim?: number;
  patchSSIM?: number;
  phashDist?: number;
  hogSim?: number;
}): number {
  const hashScore = Math.max(0, 1 - opts.hashDist / 12);
  const avgScore =
    opts.avgHashDist != null ? Math.max(0, 1 - opts.avgHashDist / 14) : hashScore;
  const colorScore = Math.max(0, 1 - opts.colorDist / 0.22);
  const patchNcc = opts.patchSim ?? 0;
  const patchS = opts.patchSSIM ?? patchNcc;
  const patchScore = patchNcc * 0.55 + patchS * 0.45;
  const phashScore =
    opts.phashDist != null ? Math.max(0, 1 - opts.phashDist / 12) : 0;
  const hogScore = opts.hogSim ?? 0.5;

  // پاتچ و pHash گرنگترینن بۆ ناسنامەی شت
  const combined =
    patchScore * 0.34 +
    phashScore * 0.2 +
    hashScore * 0.18 +
    avgScore * 0.08 +
    colorScore * 0.1 +
    hogScore * 0.1;

  return Math.round(combined * 1000) / 10;
}

/**
 * دەروازەی AND توند: هەموو سینگناڵەکان دەبێت تێپەڕن.
 * تەنها هەمان شت — نەک نزیکی شوێن یان ڕەنگی گشتی.
 */
export function isConfidentMatch(opts: {
  hashDist: number;
  colorDist: number;
  distanceM: number;
  score: number;
  minScore: number;
  avgHashDist?: number;
  closeHits?: number;
  patchSim?: number;
  patchSSIM?: number;
  phashDist?: number;
  hogSim?: number;
  hasPatch?: boolean;
  briefDist?: number;
}): boolean {
  if (opts.score < opts.minScore) return false;

  const hasPatch = opts.hasPatch ?? typeof opts.patchSim === "number";
  const patchNcc = opts.patchSim ?? 0;
  const patchS = opts.patchSSIM ?? 0;
  const patchOk = Math.max(patchNcc, patchS);
  const ph = opts.phashDist;
  const hog = opts.hogSim;

  // تێبینی نوێ (پاتچ هەیە): AND تەواو
  if (hasPatch) {
    if (patchOk < 0.82) return false;
    if (patchNcc < 0.78 || patchS < 0.74) return false;
    if (opts.hashDist > 9) return false;
    if (opts.colorDist > 0.18) return false;
    if (ph != null && ph > 11) return false;
    if (hog != null && hog < 0.74) return false;
    if (opts.briefDist != null && opts.briefDist > 18) return false;
    return true;
  }

  // تێبینی کۆن بێ پاتچ — زۆر توندتر / نزیک بە قەدەغە
  // پێویستی بە هاشی زۆر بەهێز هەیە؛ باشترە دووبارە تۆمار بکرێتەوە
  return (
    opts.hashDist <= 6 &&
    (opts.avgHashDist ?? opts.hashDist) <= 9 &&
    (opts.closeHits ?? 0) >= 3 &&
    opts.colorDist <= 0.14 &&
    (ph == null || ph <= 8)
  );
}

/** ئەگەر دوو نیشانە نزیک بن لە خاڵ — ڕەت بکەرەوە (ناڕوون) */
export function rejectAmbiguous<T extends { score: number; hashDist: number }>(
  matches: T[],
  minGap = 15
): T[] {
  if (matches.length < 2) return matches;
  const [a, b] = matches;
  if (a.score - b.score < minGap || (a.score - b.score < 20 && Math.abs(a.hashDist - b.hashDist) <= 4)) {
    // ناڕوونە کام شتە — هیچ پیشان مەدە
    return [];
  }
  return matches;
}

export function scoreLocalNote(
  fp: VisualFingerprint,
  note: {
    imageHash: string;
    colorProfile: string;
    latitude: number;
    longitude: number;
  }
): {
  score: number;
  hashDist: number;
  colorDist: number;
  avgHashDist: number;
  closeHits: number;
  patchSim: number;
  patchSSIM: number;
  phashDist: number;
  hogSim: number;
  hasPatch: boolean;
  briefDist?: number;
} {
  const profile = parseColorProfile(note.colorProfile);
  const stored = noteHashes(note.imageHash, profile);
  const consensus = consensusHashDistance(fp.hashes, stored);
  const cDist = colorDistance(fp.colorProfile, profile);
  const patchScore = bestPatchScore(
    fp.colorProfile.patch,
    profile.patch,
    profile.patches
  );
  const phashDist =
    fp.colorProfile.phash && profile.phash
      ? hammingDistanceHex(fp.colorProfile.phash, profile.phash)
      : consensus.best;
  const hogSim = hogSimilarity(fp.colorProfile.hog, profile.hog);
  const hasPatch = Boolean(profile.patch?.length || profile.patches?.length);
  const briefDist =
    fp.colorProfile.brief && profile.brief
      ? hammingDistanceHex(fp.colorProfile.brief, profile.brief)
      : undefined;

  const score = matchScore({
    hashDist: consensus.best,
    colorDist: cDist,
    distanceM: 0,
    headingDelta: 90,
    radiusM: 200,
    visualPrimary: true,
    avgHashDist: consensus.avgTop,
    closeHits: consensus.closeHits,
    patchSim: patchScore.ncc,
    patchSSIM: patchScore.ssim,
    phashDist,
    hogSim,
  });

  return {
    score,
    hashDist: consensus.best,
    colorDist: cDist,
    avgHashDist: consensus.avgTop,
    closeHits: consensus.closeHits,
    patchSim: patchScore.ncc,
    patchSSIM: patchScore.ssim,
    phashDist,
    hogSim,
    hasPatch,
    briefDist,
  };
}
