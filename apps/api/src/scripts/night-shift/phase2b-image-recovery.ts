/**
 * Night Shift — Phase 2b: Broken Image Recovery
 *
 * Reads broken_images.jsonl from Phase 2 output, then for each broken image:
 *   1. Find the product's best active affiliate URL (prefer TY > HB > AMZ)
 *   2. Fetch og:image from that URL
 *   3. HEAD-check the og:image (must be actual image, >=10 KB, image/* content type)
 *   4. If valid, UPDATE product_images.image_url
 *
 * Output:
 *   - reports/<date>/image_recovery.jsonl (before/after per image)
 *   - reports/<date>/phase2b_summary.json
 *
 * Usage: ./run-prod.sh src/scripts/night-shift/phase2b-image-recovery.ts [--report-dir=<path>]
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import * as fs from 'fs';
import * as path from 'path';

interface BrokenImage {
  image_id: number;
  product_id: number;
  url: string;
  status: number | null;
  outcome: string;
  detail?: string;
}

interface RecoveryOutcome {
  image_id: number;
  product_id: number;
  old_url: string;
  new_url: string | null;
  source_affiliate_url: string | null;
  source_platform: string | null;
  action: 'recovered' | 'no_affiliate' | 'no_og_image' | 'og_invalid' | 'same_url' | 'exception';
  detail?: string;
}

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function normalizeForOgFetch(url: string): string {
  // Trendyol EN pages don't expose og:image; the TR canonical does. Strip /en/.
  if (url.includes('trendyol.com/en/')) return url.replace('/en/', '/');
  return url;
}

async function fetchOgImage(rawUrl: string, timeoutMs = 12000): Promise<string | null> {
  const url = normalizeForOgFetch(rawUrl);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal as any,
      redirect: 'follow',
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
      },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const html = await res.text();

    const patterns = [
      /<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i,
      /<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i,
      /<meta\s+(?:property|name)=["']og:image:secure_url["']\s+content=["']([^"']+)["']/i,
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m) {
        const og = m[1];
        if (!og.startsWith('http')) continue;
        if (/logo|placeholder|favicon|sprite/i.test(og)) continue;
        return og;
      }
    }
    return null;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

interface HeadResult {
  ok: boolean;
  contentType?: string;
  contentLength?: number;
  reason?: string;
}
async function headCheck(url: string, timeoutMs = 8000): Promise<HeadResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal as any,
      method: 'HEAD',
      redirect: 'follow',
      headers: { 'User-Agent': USER_AGENT },
    });
    clearTimeout(timer);
    if (!res.ok) return { ok: false, reason: `status ${res.status}` };
    const ct = res.headers.get('content-type') || '';
    const cl = parseInt(res.headers.get('content-length') || '0', 10) || 0;
    if (!ct.startsWith('image/')) return { ok: false, contentType: ct, contentLength: cl, reason: 'not-image' };
    if (cl > 0 && cl < 8000) return { ok: false, contentType: ct, contentLength: cl, reason: 'tiny' };
    return { ok: true, contentType: ct, contentLength: cl };
  } catch (e: any) {
    clearTimeout(timer);
    return { ok: false, reason: String(e?.message || e).slice(0, 80) };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const reportDirArg = args.find((a) => a.startsWith('--report-dir='));
  const reportDir =
    reportDirArg?.split('=')[1] ||
    path.resolve(process.cwd(), '../../night-shift-reports', new Date().toISOString().slice(0, 10));
  fs.mkdirSync(reportDir, { recursive: true });

  const brokenPath = path.join(reportDir, 'broken_images.jsonl');
  if (!fs.existsSync(brokenPath)) {
    console.error(`[phase2b] FATAL: ${brokenPath} not found — run phase2 first`);
    process.exit(1);
  }
  const broken: BrokenImage[] = fs
    .readFileSync(brokenPath, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l));

  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const ds = app.get(DataSource);

  const startedAt = Date.now();
  console.log(`[phase2b] START ${new Date().toISOString()}`);
  console.log(`[phase2b] recovering ${broken.length} broken images`);

  const outcomes: RecoveryOutcome[] = [];
  let recovered = 0;
  let idx = 0;

  const jsonlPath = path.join(reportDir, 'image_recovery.jsonl');
  const jsonlFd = fs.openSync(jsonlPath, 'w');

  for (const b of broken) {
    idx++;
    // Pick best product-page affiliate URL for this product. Search URLs have no
    // useful og:image so we exclude them (e.g. '/search?q=', '/q=' query param).
    const [affRow]: any[] = await ds.query(
      `
      SELECT affiliate_url, platform
      FROM affiliate_links
      WHERE product_id = $1 AND is_active = TRUE AND verification_status != 'dead'
        AND affiliate_url NOT ILIKE '%/search?%'
        AND affiliate_url NOT ILIKE '%/search/%'
        AND affiliate_url NOT ILIKE '%?q=%'
        AND affiliate_url NOT ILIKE '%&q=%'
      ORDER BY CASE platform
        WHEN 'trendyol' THEN 1
        WHEN 'hepsiburada' THEN 2
        WHEN 'amazon_tr' THEN 3
        ELSE 9
      END,
      CASE WHEN price_snapshot IS NOT NULL THEN 0 ELSE 1 END
      LIMIT 1
      `,
      [b.product_id],
    );

    if (!affRow) {
      const o: RecoveryOutcome = {
        image_id: b.image_id,
        product_id: b.product_id,
        old_url: b.url,
        new_url: null,
        source_affiliate_url: null,
        source_platform: null,
        action: 'no_affiliate',
      };
      outcomes.push(o);
      fs.writeSync(jsonlFd, JSON.stringify(o) + '\n');
      continue;
    }

    try {
      const og = await fetchOgImage(affRow.affiliate_url);
      if (!og) {
        const o: RecoveryOutcome = {
          image_id: b.image_id,
          product_id: b.product_id,
          old_url: b.url,
          new_url: null,
          source_affiliate_url: affRow.affiliate_url,
          source_platform: affRow.platform,
          action: 'no_og_image',
        };
        outcomes.push(o);
        fs.writeSync(jsonlFd, JSON.stringify(o) + '\n');
      } else if (og === b.url) {
        const o: RecoveryOutcome = {
          image_id: b.image_id,
          product_id: b.product_id,
          old_url: b.url,
          new_url: og,
          source_affiliate_url: affRow.affiliate_url,
          source_platform: affRow.platform,
          action: 'same_url',
        };
        outcomes.push(o);
        fs.writeSync(jsonlFd, JSON.stringify(o) + '\n');
      } else {
        const head = await headCheck(og);
        if (!head.ok) {
          const o: RecoveryOutcome = {
            image_id: b.image_id,
            product_id: b.product_id,
            old_url: b.url,
            new_url: og,
            source_affiliate_url: affRow.affiliate_url,
            source_platform: affRow.platform,
            action: 'og_invalid',
            detail: head.reason,
          };
          outcomes.push(o);
          fs.writeSync(jsonlFd, JSON.stringify(o) + '\n');
        } else {
          await ds.query(
            `UPDATE product_images SET image_url = $1 WHERE image_id = $2`,
            [og, b.image_id],
          );
          recovered++;
          const o: RecoveryOutcome = {
            image_id: b.image_id,
            product_id: b.product_id,
            old_url: b.url,
            new_url: og,
            source_affiliate_url: affRow.affiliate_url,
            source_platform: affRow.platform,
            action: 'recovered',
            detail: `${head.contentType} ${head.contentLength ?? '?'}B`,
          };
          outcomes.push(o);
          fs.writeSync(jsonlFd, JSON.stringify(o) + '\n');
        }
      }
    } catch (e: any) {
      const o: RecoveryOutcome = {
        image_id: b.image_id,
        product_id: b.product_id,
        old_url: b.url,
        new_url: null,
        source_affiliate_url: affRow?.affiliate_url ?? null,
        source_platform: affRow?.platform ?? null,
        action: 'exception',
        detail: String(e?.message || e).slice(0, 120),
      };
      outcomes.push(o);
      fs.writeSync(jsonlFd, JSON.stringify(o) + '\n');
    }

    if (idx % 5 === 0) {
      const elapsed = Math.round((Date.now() - startedAt) / 1000);
      console.log(
        `[phase2b] progress ${idx}/${broken.length} elapsed=${elapsed}s recovered=${recovered}`,
      );
    }
  }

  fs.closeSync(jsonlFd);

  const actionCounts: Record<string, number> = {};
  for (const o of outcomes) actionCounts[o.action] = (actionCounts[o.action] || 0) + 1;

  const summary = {
    phase: 'phase2b',
    run_at: new Date().toISOString(),
    duration_s: Math.round((Date.now() - startedAt) / 1000),
    cohort: broken.length,
    recovered,
    action_counts: actionCounts,
  };

  fs.writeFileSync(
    path.join(reportDir, 'phase2b_summary.json'),
    JSON.stringify(summary, null, 2),
  );
  console.log(`[phase2b] DONE in ${summary.duration_s}s recovered=${recovered}/${broken.length}`);

  await app.close();
}

main().catch((err) => {
  console.error('[phase2b] FATAL:', err);
  process.exit(1);
});
