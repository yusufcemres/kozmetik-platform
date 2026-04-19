/**
 * Image quality gate. Runs on every resolved `image_url` in Stage 2, whether it
 * came from the JSON payload or Tavily fallback. Rejects small/non-product
 * images before they land in product_images — prevents blurry thumbnails and
 * logo-instead-of-product cases that shipped twice in batch-3/4.
 *
 * Rules:
 *  - Content-Length < 5KB → logo/placeholder (most CDN product shots ≥ 15KB)
 *  - min(width, height) < 300px → too small for retina product card
 *  - Aspect outside [0.75, 1.33] → not square-ish, probably banner/logo
 *  - URL path matches /logo|favicon|placeholder|brand-|sprite/ → reject by name
 *
 * No external image lib — parses JPEG SOF / PNG IHDR / WebP VP8X headers from
 * the first 64 KB via HTTP Range request. Falls back to content-length-only
 * heuristic if dimensions can't be read (rare, e.g. unusual chunk order).
 */

export type ImageQualityResult =
  | { ok: true; width: number; height: number; bytes: number; contentType: string }
  | { ok: false; reason: string };

const MIN_BYTES = 5 * 1024;
const MIN_DIMENSION = 300;
const ASPECT_LOW = 0.75;
const ASPECT_HIGH = 1.33;
const NAME_REJECT_RE = /\b(logo|favicon|placeholder|brand[-_]|sprite|icon-)\b/i;

function parseJpeg(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) return null;
    const marker = buf[i + 1];
    const seg = buf.readUInt16BE(i + 2);
    // SOF markers (not SOS 0xDA, not DHT 0xC4, not DAC 0xCC)
    const isSof =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (isSof) {
      const height = buf.readUInt16BE(i + 5);
      const width = buf.readUInt16BE(i + 7);
      return { width, height };
    }
    i += 2 + seg;
  }
  return null;
}

function parsePng(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 24) return null;
  const sig = buf.subarray(0, 8);
  if (sig[0] !== 0x89 || sig[1] !== 0x50 || sig[2] !== 0x4e || sig[3] !== 0x47) return null;
  // IHDR always at offset 16-23 (width+height BE uint32)
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}

function parseWebp(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 30) return null;
  if (buf.toString('ascii', 0, 4) !== 'RIFF') return null;
  if (buf.toString('ascii', 8, 12) !== 'WEBP') return null;
  const chunk = buf.toString('ascii', 12, 16);
  if (chunk === 'VP8X') {
    // canvas width minus one at 24 (24-bit LE), height minus one at 27
    const w = 1 + (buf.readUInt16LE(24) | (buf[26] << 16));
    const h = 1 + (buf.readUInt16LE(27) | (buf[29] << 16));
    return { width: w, height: h };
  }
  if (chunk === 'VP8 ') {
    // Lossy: dimensions at offset 26 (14-bit LE each)
    if (buf.length < 30) return null;
    const w = buf.readUInt16LE(26) & 0x3fff;
    const h = buf.readUInt16LE(28) & 0x3fff;
    return { width: w, height: h };
  }
  if (chunk === 'VP8L') {
    // Lossless: 4 bytes at offset 21, 14-bit width then 14-bit height
    if (buf.length < 25) return null;
    const b0 = buf[21], b1 = buf[22], b2 = buf[23], b3 = buf[24];
    const w = 1 + (((b1 & 0x3f) << 8) | b0);
    const h = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
    return { width: w, height: h };
  }
  return null;
}

function readDimensions(buf: Buffer): { width: number; height: number } | null {
  return parseJpeg(buf) ?? parsePng(buf) ?? parseWebp(buf);
}

export async function checkImageQuality(
  url: string,
  opts: { timeoutMs?: number } = {},
): Promise<ImageQualityResult> {
  if (NAME_REJECT_RE.test(url)) {
    return { ok: false, reason: `URL path logo/placeholder olarak işaretli: ${url.slice(0, 80)}` };
  }

  const timeoutMs = opts.timeoutMs ?? 8000;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-65535' },
      signal: ctl.signal,
    });
    if (!res.ok && res.status !== 206) {
      return { ok: false, reason: `HTTP ${res.status} (${url.slice(0, 80)})` };
    }
    const contentType = res.headers.get('content-type') ?? '';
    if (contentType && !/^image\//i.test(contentType)) {
      return { ok: false, reason: `content-type '${contentType}' image değil.` };
    }
    const arr = new Uint8Array(await res.arrayBuffer());
    const buf = Buffer.from(arr);
    const bytes =
      Number(res.headers.get('content-range')?.split('/')?.[1]) ||
      Number(res.headers.get('content-length')) ||
      buf.length;

    if (bytes > 0 && bytes < MIN_BYTES) {
      return { ok: false, reason: `Dosya ${bytes} bayt (< ${MIN_BYTES}), muhtemelen logo/placeholder.` };
    }

    const dims = readDimensions(buf);
    if (!dims) {
      // Fallback: byte size OK, parse failed → warn but don't block.
      return {
        ok: true,
        width: 0,
        height: 0,
        bytes,
        contentType,
      };
    }

    const { width, height } = dims;
    const minDim = Math.min(width, height);
    const aspect = height === 0 ? 0 : width / height;

    if (minDim < MIN_DIMENSION) {
      return { ok: false, reason: `Çözünürlük ${width}x${height} — min ${MIN_DIMENSION}px gerekli.` };
    }
    if (aspect < ASPECT_LOW || aspect > ASPECT_HIGH) {
      return {
        ok: false,
        reason: `Aspect ratio ${aspect.toFixed(2)} (${width}x${height}) — ürün görüntüsü için [${ASPECT_LOW}-${ASPECT_HIGH}] aralığı gerekli.`,
      };
    }

    return { ok: true, width, height, bytes, contentType };
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      return { ok: false, reason: `Timeout ${timeoutMs}ms` };
    }
    return { ok: false, reason: `fetch exception: ${e?.message ?? e}` };
  } finally {
    clearTimeout(timer);
  }
}
