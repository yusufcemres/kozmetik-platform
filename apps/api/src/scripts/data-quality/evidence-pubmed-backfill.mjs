/**
 * Top usage INCI'lar icin PubMed E-Utilities ile gercek bilimsel kaynak ekle.
 * AI degil — PubMed API direkt arama, halusinasyon riski yok.
 *
 * Akış: ingredient_evidence_links boş olan top N usage INCI →
 *   PubMed E-Search → ilk 3 makale → E-Fetch (title, year, PMID) →
 *   ingredient_evidence_links INSERT
 */
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const PUBMED_ESEARCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
const PUBMED_EFETCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';
const LIMIT = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || '300');
const PARALLEL = 2;

const client = new Client({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function pubmedSearch(query) {
  const url = `${PUBMED_ESEARCH}?db=pubmed&term=${encodeURIComponent(query)}&retmax=3&sort=relevance&retmode=json`;
  const res = await fetch(url, { headers: { 'User-Agent': 'REVELA-evidence-backfill/1.0' } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.esearchresult?.idlist || [];
}

async function pubmedFetch(pmids) {
  if (!pmids.length) return [];
  const url = `${PUBMED_EFETCH}?db=pubmed&id=${pmids.join(',')}&retmode=json`;
  const res = await fetch(url, { headers: { 'User-Agent': 'REVELA-evidence-backfill/1.0' } });
  if (!res.ok) return [];
  const data = await res.json();
  const result = data.result || {};
  return pmids.map(id => {
    const item = result[id];
    if (!item) return null;
    const year = (item.pubdate || '').match(/(\d{4})/)?.[1];
    return {
      pmid: id,
      title: item.title || `PubMed ${id}`,
      year: year ? parseInt(year) : null,
      url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
    };
  }).filter(Boolean);
}

async function processInci(inci) {
  // Query: "{INCI name} skin OR cosmetic"
  const query = `${inci.inci_name} (skin OR cosmetic OR topical OR dermatology)`;
  const pmids = await pubmedSearch(query);
  if (pmids.length === 0) return { id: inci.ingredient_id, name: inci.inci_name, added: 0 };

  await sleep(400); // PubMed rate limit
  const papers = await pubmedFetch(pmids);

  let added = 0;
  for (const p of papers) {
    try {
      await client.query(
        `INSERT INTO ingredient_evidence_links
          (ingredient_id, source_url, source_title, source_type, publication_year, summary_note, created_at)
         VALUES ($1, $2, $3, 'pubmed', $4, $5, NOW())`,
        [inci.ingredient_id, p.url, p.title.slice(0, 250), p.year, `PMID ${p.pmid} — REVELA PubMed auto-backfill 2026-05-12`],
      );
      added++;
    } catch (_) { /* duplicate / constraint — skip */ }
  }
  return { id: inci.ingredient_id, name: inci.inci_name, added };
}

await client.connect();

const { rows: targets } = await client.query(`
  WITH top_inci AS (
    SELECT i.ingredient_id, i.inci_name,
      (SELECT COUNT(*) FROM product_ingredients pi WHERE pi.ingredient_id=i.ingredient_id) AS usage
    FROM ingredients i WHERE i.is_active=true
    ORDER BY usage DESC LIMIT $1
  )
  SELECT * FROM top_inci ti
  WHERE NOT EXISTS (SELECT 1 FROM ingredient_evidence_links iel WHERE iel.ingredient_id=ti.ingredient_id)
  ORDER BY usage DESC
`, [LIMIT]);
console.log(`Evidence backfill targets: ${targets.length}\n`);

let success = 0, total_added = 0, empty = 0;
for (let i = 0; i < targets.length; i += PARALLEL) {
  const chunk = targets.slice(i, i + PARALLEL);
  const results = await Promise.allSettled(chunk.map(processInci));
  for (const r of results) {
    if (r.status === 'fulfilled') {
      success++; total_added += r.value.added;
      if (r.value.added === 0) empty++;
      if (success % 25 === 0) {
        console.log(`  [+${i}] ${success} INCI processed, ${total_added} evidence links added, ${empty} no-results`);
      }
    }
  }
  await sleep(200);
}

console.log(`\n=== Done: ${success} INCI, ${total_added} evidence links, ${empty} had no PubMed results ===`);
await client.end();
