/**
 * Night Shift — Phase 2: Image Health
 *
 * 2a. HEAD-check every product_images.image_url (10 concurrent workers)
 * 2c. Low-quality URL upgrade (Amazon _SL300_ -> _SL1500_, Trendyol small -> full)
 *
 * 2b (fallback pipeline: OG scrape + incidecoder) is deferred to v2.
 *
 * Non-destructive: flags broken images by writing to reports/<date>/broken_images.jsonl
 * and performs URL upgrades with before/after log. No DB schema changes.
 *
 * Output:
 *   - reports/<date>/image_health.json
 *   - reports/<date>/broken_images.jsonl
 *   - reports/<date>/image_upgrades.jsonl
 *   - reports/<date>/phase2_summary.json
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

interface ImageRow {
  image_id: number;
  product_id: number;
  image_url: string;
}

interface HeadResult {
  image_id: number;
  product_id: number;
  url: string;
  status: number | null;
  content_type: string | null;
  content_length: number | null;
  outcome: 'ok' | 'broken_404' | 'broken_403' | 'broken_5xx' | 'timeout' | 'wrong_type' | 'tiny' | 'redirect' | 'exception';
  detail?: string;
}

const TIMEOUT_MS = 8000;
const CONCURRENCY = 10;
const TINY_THRESHOLD = 5 * 1024; // <5KB

async function headCheck(img: ImageRow): Promise<HeadResult> {
  try {
    const res = await axios.head(img.image_url, {
      timeout: TIMEOUT_MS,
      maxRedirects: 3,
      validateStatus: () => true,
      headers: { 'User-Agent': 'revela-nightshift/1.0' },
    });
    const status = res.status;
    const ct = String(res.headers['content-type'] || '');
    const cl = res.headers['content-length'] ? parseInt(String(res.headers['content-length']), 10) : null;

    if (status === 404) return { image_id: img.image_id, product_id: img.product_id, url: img.image_url, status, content_type: ct, content_length: cl, outcome: 'broken_404' };
    if (status === 403) return { image_id: img.image_id, product_id: img.product_id, url: img.image_url, status, content_type: ct, content_length: cl, outcome: 'broken_403' };
    if (status >= 500) return { image_id: img.image_id, product_id: img.product_id, url: img.image_url, status, content_type: ct, content_length: cl, outcome: 'broken_5xx' };
    if (status >= 300 && status < 400) return { image_id: img.image_id, product_id: img.product_id, url: img.image_url, status, content_type: ct, content_length: cl, outcome: 'redirect' };
    if (status >= 200 && status < 300) {
      if (ct && !ct.startsWith('image/')) {
        return { image_id: img.image_id, product_id: img.product_id, url: img.image_url, status, content_type: ct, content_length: cl, outcome: 'wrong_type' };
      }
      if (cl != null && cl < TINY_THRESHOLD) {
        return { image_id: img.image_id, product_id: img.product_id, url: img.image_url, status, content_type: ct, content_length: cl, outcome: 'tiny' };
      }
      return { image_id: img.image_id, product_id: img.product_id, url: img.image_url, status, content_type: ct, content_length: cl, outcome: 'ok' };
    }
    return { image_id: img.image_id, product_id: img.product_id, url: img.image_url, status, content_type: ct, content_length: cl, outcome: 'exception', detail: `unexpected status ${status}` };
  } catch (err: any) {
    const msg = String(err?.message || err);
    if (msg.includes('timeout') || err?.code === 'ECONNABORTED') {
      return { image_id: img.image_id, product_id: img.product_id, url: img.image_url, status: null, content_type: null, content_length: null, outcome: 'timeout' };
    }
    return { image_id: img.image_id, product_id: img.product_id, url: img.image_url, status: null, content_type: null, content_length: null, outcome: 'exception', detail: msg.slice(0, 120) };
  }
}

async function runPool<T, R>(items: T[], concurrency: number, worker: (item: T, idx: number) => Promise<R>, onProgress?: (done: number, total: number) => void): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  let done = 0;
  const workers = Array.from({ length: concurrency }).map(async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) break;
      results[i] = await worker(items[i], i);
      done++;
      if (onProgress && done % 100 === 0) onProgress(done, items.length);
    }
  });
  await Promise.all(workers);
  if (onProgress) onProgress(done, items.length);
  return results;
}

function upgradeUrl(url: string): string | null {
  // Amazon: _SL300_ / _SL500_ -> _SL1500_
  const amazonRe = /\._SL\d+_\.jpg/;
  if (amazonRe.test(url) && !url.includes('_SL1500_')) {
    return url.replace(amazonRe, '._SL1500_.jpg');
  }
  // Amazon: _SX300_ / _SS250_ etc.
  const amazonSize = /\._(SX|SS|SY|UL|UX|UY)\d+_\.jpg/;
  if (amazonSize.test(url)) {
    return url.replace(amazonSize, '._SL1500_.jpg');
  }
  // Trendyol: mnresize/128/192 / mnresize/400/600 -> mnresize/1200/1800
  const trendyolRe = /\/mnresize\/\d+\/\d+\//;
  if (trendyolRe.test(url) && !url.includes('/mnresize/1200/1800/')) {
    return url.replace(trendyolRe, '/mnresize/1200/1800/');
  }
  // Trendyol: fitrotate small paths (e.g. /ty123/_small/) -> base
  if (url.includes('_thumb.') || url.includes('-small.')) {
    return url.replace(/_thumb\.|_small\.|-small\./, '.');
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const reportDirArg = args.find((a) => a.startsWith('--report-dir='));
  const reportDir =
    reportDirArg?.split('=')[1] ||
    path.resolve(process.cwd(), '../../night-shift-reports', new Date().toISOString().slice(0, 10));
  fs.mkdirSync(reportDir, { recursive: true });

  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const ds = app.get(DataSource);

  const startedAt = Date.now();
  console.log(`[phase2] START ${new Date().toISOString()}`);
  console.log(`[phase2] report_dir=${reportDir}`);

  // ============================================================
  // 2a. Pull all active product images (primary only — sort_order=0)
  // ============================================================
  const images: ImageRow[] = await ds.query(`
    SELECT DISTINCT ON (pi.product_id)
      pi.image_id, pi.product_id, pi.image_url
    FROM product_images pi
    JOIN products p ON p.product_id = pi.product_id
    WHERE p.status IN ('published','active')
      AND pi.image_url IS NOT NULL AND pi.image_url != ''
    ORDER BY pi.product_id, pi.sort_order ASC, pi.image_id ASC
  `);

  console.log(`[phase2] cohort size: ${images.length} primary images`);

  const maxCheck = parseInt(process.env.PHASE2_MAX_CHECK || '2500', 10);
  const sample = images.slice(0, maxCheck);

  const headResults = await runPool(sample, CONCURRENCY, headCheck, (d, t) => {
    const elapsed = Math.round((Date.now() - startedAt) / 1000);
    console.log(`[phase2] head-check ${d}/${t} elapsed=${elapsed}s`);
  });

  // ============================================================
  // Classification
  // ============================================================
  const outcomeCounts: Record<string, number> = {};
  const brokenRows: HeadResult[] = [];
  const tinyRows: HeadResult[] = [];
  for (const r of headResults) {
    outcomeCounts[r.outcome] = (outcomeCounts[r.outcome] || 0) + 1;
    if (['broken_404', 'broken_403', 'broken_5xx', 'timeout', 'wrong_type', 'exception'].includes(r.outcome)) {
      brokenRows.push(r);
    }
    if (r.outcome === 'tiny') tinyRows.push(r);
  }

  // ============================================================
  // 2c. URL upgrade for tiny + for qualifying broken ones
  // ============================================================
  interface UpgradeAttempt {
    image_id: number;
    product_id: number;
    old_url: string;
    new_url: string;
    old_outcome: string;
    new_outcome: string;
    new_content_length: number | null;
    applied: boolean;
    reason: string;
  }

  const upgradeCandidates: Array<{ row: HeadResult; new_url: string }> = [];
  for (const r of [...tinyRows, ...brokenRows]) {
    const upgraded = upgradeUrl(r.url);
    if (upgraded && upgraded !== r.url) {
      upgradeCandidates.push({ row: r, new_url: upgraded });
    }
  }
  console.log(`[phase2] url-upgrade candidates: ${upgradeCandidates.length}`);

  const upgrades: UpgradeAttempt[] = [];
  const upgradedIds: Array<{ image_id: number; new_url: string }> = [];
  await runPool(
    upgradeCandidates,
    CONCURRENCY,
    async (c) => {
      try {
        const res = await axios.head(c.new_url, {
          timeout: TIMEOUT_MS,
          maxRedirects: 3,
          validateStatus: () => true,
          headers: { 'User-Agent': 'revela-nightshift/1.0' },
        });
        const ct = String(res.headers['content-type'] || '');
        const cl = res.headers['content-length'] ? parseInt(String(res.headers['content-length']), 10) : null;
        const isImage = ct.startsWith('image/');
        const isBigger = cl != null && c.row.content_length != null && cl > c.row.content_length * 1.3;
        const isRecovery = (c.row.outcome !== 'ok') && res.status >= 200 && res.status < 300 && isImage;
        const applied = (res.status >= 200 && res.status < 300 && isImage) && (isBigger || isRecovery);
        if (applied) {
          upgradedIds.push({ image_id: c.row.image_id, new_url: c.new_url });
        }
        upgrades.push({
          image_id: c.row.image_id,
          product_id: c.row.product_id,
          old_url: c.row.url,
          new_url: c.new_url,
          old_outcome: c.row.outcome,
          new_outcome: applied ? 'upgraded' : `rejected(status=${res.status},ct=${ct},cl=${cl})`,
          new_content_length: cl,
          applied,
          reason: applied ? (isRecovery ? 'recovery' : 'larger') : 'no-improvement',
        });
      } catch (err: any) {
        upgrades.push({
          image_id: c.row.image_id,
          product_id: c.row.product_id,
          old_url: c.row.url,
          new_url: c.new_url,
          old_outcome: c.row.outcome,
          new_outcome: 'exception',
          new_content_length: null,
          applied: false,
          reason: String(err?.message || err).slice(0, 120),
        });
      }
    },
    undefined,
  );

  // Apply upgrades to DB (batched UPDATE per image_id)
  if (upgradedIds.length > 0) {
    const txn = ds;
    for (const u of upgradedIds) {
      await txn.query(`UPDATE product_images SET image_url = $1 WHERE image_id = $2`, [u.new_url, u.image_id]);
    }
    console.log(`[phase2] applied ${upgradedIds.length} image_url upgrades to DB`);
  }

  // ============================================================
  // Write outputs
  // ============================================================
  const dateStr = new Date().toISOString().slice(0, 10);
  const healthPath = path.join(reportDir, 'image_health.json');
  const brokenPath = path.join(reportDir, 'broken_images.jsonl');
  const upgradesPath = path.join(reportDir, 'image_upgrades.jsonl');
  const summaryPath = path.join(reportDir, 'phase2_summary.json');

  fs.writeFileSync(
    healthPath,
    JSON.stringify(
      {
        run_at: new Date().toISOString(),
        cohort_total: images.length,
        checked: sample.length,
        duration_s: Math.round((Date.now() - startedAt) / 1000),
        outcome_counts: outcomeCounts,
      },
      null,
      2,
    ),
  );
  console.log(`[phase2] wrote ${healthPath}`);

  // Write broken + tiny combined so Phase 2b can attempt og:image recovery for both
  const needsRecovery = [...brokenRows, ...tinyRows];
  const brokenLines = needsRecovery.map((r) => JSON.stringify(r)).join('\n');
  fs.writeFileSync(brokenPath, brokenLines);
  console.log(`[phase2] wrote ${brokenPath} (${brokenRows.length} broken + ${tinyRows.length} tiny)`);

  const upgradeLines = upgrades.map((u) => JSON.stringify(u)).join('\n');
  fs.writeFileSync(upgradesPath, upgradeLines);
  console.log(`[phase2] wrote ${upgradesPath} (${upgrades.length} attempts, ${upgradedIds.length} applied)`);

  const summary = {
    phase: 'phase2',
    run_at: new Date().toISOString(),
    duration_s: Math.round((Date.now() - startedAt) / 1000),
    cohort_total: images.length,
    checked: sample.length,
    outcome_counts: outcomeCounts,
    broken_count: brokenRows.length,
    tiny_count: tinyRows.length,
    url_upgrade_candidates: upgradeCandidates.length,
    url_upgrade_attempts: upgrades.length,
    url_upgrade_applied: upgradedIds.length,
  };
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`[phase2] wrote ${summaryPath}`);
  console.log(`[phase2] DONE in ${Math.round((Date.now() - startedAt) / 1000)}s`);

  await app.close();
}

main().catch((err) => {
  console.error('[phase2] FATAL:', err);
  process.exit(1);
});
