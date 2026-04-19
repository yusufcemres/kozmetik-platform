/**
 * V2.B.10 — Trendyol auto-discovery (accelerator).
 *
 * Scans Trendyol via Tavily search for new SKUs per brand, dedupes against
 * affiliate_links in DB, and prints a review-ready list. The output is *not*
 * an auto-onboarded product — onboarding still needs the human-curated
 * products-queue JSON (common_name, function_summary, evidence grade, etc).
 * Purpose is to shorten the "what new Nutraxin SKUs should I consider?" step
 * from 20-min manual browsing to a 10-second scan.
 *
 * Flags:
 *   --config <path>    : brand list JSON (default: ./brands.config.json)
 *   --json             : machine-readable output (for future cron integration)
 *   --max-per-brand N  : cap results kept per brand (default: 10)
 *
 * Why dedupe on affiliate_url (not product_name): TY product URLs carry a
 * numeric -p-<id> that's unique per SKU across variants, which is stabler
 * than matching names across "400mg" / "400 mg" / "400 MG" styling.
 */
import * as fs from 'fs';
import * as path from 'path';
import { newClient } from '../onboarding/db';

const TAVILY_KEY = process.env.TAVILY_API_KEY;
// Matches Trendyol product pages: ...trendyol.com/<brand>/<slug>-p-<id>
const TRENDYOL_PRODUCT_RE = /https?:\/\/(?:www\.)?trendyol\.com\/[^\s"'?#]+?-p-\d+/i;

type BrandEntry = { slug: string; query: string };
type TavilySearchResult = { url: string; title?: string; content?: string };
type Discovery = { brand_slug: string; url: string; title: string; status: 'new' | 'known' };

function parseArgs() {
  const argv = process.argv.slice(2);
  const get = (name: string) => {
    const prefix = `--${name}=`;
    const hit = argv.find((a) => a.startsWith(prefix));
    if (hit) return hit.slice(prefix.length);
    const idx = argv.indexOf(`--${name}`);
    return idx >= 0 ? argv[idx + 1] : undefined;
  };
  return {
    configPath: get('config') ?? path.join(__dirname, 'brands.config.json'),
    asJson: argv.includes('--json'),
    maxPerBrand: Number(get('max-per-brand') ?? '10'),
  };
}

async function tavilySearch(query: string): Promise<TavilySearchResult[]> {
  if (!TAVILY_KEY) throw new Error('TAVILY_API_KEY .env içinde yok.');
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TAVILY_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, search_depth: 'basic', max_results: 15, include_answer: false }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tavily ${res.status}: ${text.slice(0, 160)}`);
  }
  const data: any = await res.json();
  return Array.isArray(data?.results) ? data.results : [];
}

function normalizeTrendyolUrl(url: string): string {
  // Strip query strings / fragments so "?boutiqueId=..." variants collapse to
  // the same SKU key. The `-p-<id>` suffix stays intact.
  return url.split(/[?#]/)[0].replace(/\/$/, '').toLowerCase();
}

async function fetchKnownAffiliateUrls(): Promise<Set<string>> {
  const c = newClient();
  try {
    await c.connect();
    const { rows } = await c.query<{ affiliate_url: string }>(
      `SELECT affiliate_url FROM affiliate_links WHERE platform='trendyol'`,
    );
    return new Set(rows.map((r) => normalizeTrendyolUrl(r.affiliate_url)));
  } finally {
    await c.end().catch(() => undefined);
  }
}

function loadConfig(p: string): BrandEntry[] {
  const raw = fs.readFileSync(p, 'utf-8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed?.brands)) throw new Error(`Config geçersiz: ${p} — 'brands' array bekleniyor.`);
  return parsed.brands as BrandEntry[];
}

async function main(): Promise<void> {
  const { configPath, asJson, maxPerBrand } = parseArgs();
  const brands = loadConfig(configPath);
  const known = await fetchKnownAffiliateUrls();

  const discoveries: Discovery[] = [];
  for (const b of brands) {
    if (!asJson) console.error(`🔎 [${b.slug}] ${b.query}`);
    let results: TavilySearchResult[] = [];
    try {
      results = await tavilySearch(b.query);
    } catch (e: any) {
      if (!asJson) console.error(`   ⚠️  Tavily fail: ${e?.message ?? e}`);
      continue;
    }
    const productHits = results
      .filter((r) => TRENDYOL_PRODUCT_RE.test(r.url))
      .slice(0, maxPerBrand);

    for (const r of productHits) {
      const norm = normalizeTrendyolUrl(r.url);
      discoveries.push({
        brand_slug: b.slug,
        url: norm,
        title: (r.title ?? '').slice(0, 120),
        status: known.has(norm) ? 'known' : 'new',
      });
    }
  }

  const newOnes = discoveries.filter((d) => d.status === 'new');
  const dupes = discoveries.filter((d) => d.status === 'known');

  if (asJson) {
    console.log(JSON.stringify({ total: discoveries.length, new: newOnes, known_count: dupes.length }, null, 2));
    return;
  }

  console.log(`\n📦 Trendyol discovery — ${new Date().toISOString().slice(0, 10)}`);
  console.log(`   brands scanned : ${brands.length}`);
  console.log(`   hits total     : ${discoveries.length}`);
  console.log(`   new            : ${newOnes.length}`);
  console.log(`   already in DB  : ${dupes.length}`);

  if (newOnes.length === 0) {
    console.log('\n✅ Yeni SKU yok — katalog bu markalar için güncel.\n');
    return;
  }

  console.log('\nNew candidates (review before queueing):\n');
  for (const d of newOnes) {
    console.log(`  • [${d.brand_slug}] ${d.title}`);
    console.log(`    ${d.url}`);
  }
  console.log('');
}

main().catch((e) => {
  console.error(`❌ ${e?.stack ?? e?.message ?? e}`);
  process.exit(1);
});
