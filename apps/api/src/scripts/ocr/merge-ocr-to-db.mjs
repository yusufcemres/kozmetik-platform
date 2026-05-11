/**
 * OCR JSON klasoründeki sonuclari REVELA DB'sine merge eder.
 * - Barkoda gore cluster: ayni urunun farkli paneleri = tek kayit
 * - Brand fuzzy match (yoksa olustur)
 * - INCI fuzzy match (yoksa atla, eski INCI ile birlestir)
 * - Producer info -> brand metadata
 * - Ileride OCR endpoint mobile/web kameradan ayni mantikla calisir
 *
 * Usage:
 *   node src/scripts/ocr/merge-ocr-to-db.mjs --input=./tmp/ocr-results [--dry]
 */
import { readdir, readFile } from 'fs/promises';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { Client } from 'pg';
import { createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../../../.env') });

const args = process.argv.slice(2);
function arg(name, def = null) {
  const a = args.find((x) => x.startsWith(`--${name}=`));
  return a ? a.split('=').slice(1).join('=') : def;
}
const INPUT = arg('input', './tmp/ocr-results');
const DRY = args.includes('--dry');

const client = new Client({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_0KZrPGQxqH5d@ep-solitary-bar-al8ftlrb.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require',
});

// === Helpers ===

function turkishSlug(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

function inciFingerprint(inciList) {
  if (!inciList || inciList.length === 0) return null;
  const normalized = inciList
    .map((s) => s.toLowerCase().trim().replace(/[^a-z0-9]/g, ''))
    .filter((s) => s.length > 1)
    .sort()
    .join('|');
  return createHash('sha256').update(normalized).digest('hex').slice(0, 24);
}

// Cluster: barkoda gore grupla (yoksa brand+product_name)
function clusterByProduct(records) {
  const clusters = new Map();
  for (const rec of records) {
    const key = rec.barcode
      ? `barcode:${rec.barcode}`
      : `bp:${(rec.brand_name || '?').toLowerCase()}|${(rec.product_name || '?').toLowerCase()}`;
    if (!clusters.has(key)) clusters.set(key, []);
    clusters.get(key).push(rec);
  }
  // Her cluster'i tek bir "merged" nesneye birlestir
  const merged = [];
  for (const [key, group] of clusters) {
    const m = {
      key,
      barcode: null,
      brand_name: null,
      product_name: null,
      product_type: null,
      volume: null,
      made_in: null,
      producer: { name: null, address: null, phone: null, website: null },
      dates: { production_date: null, expiry_date: null, pao_months: null, batch_code: null },
      claims: new Set(),
      certifications: new Set(),
      free_of_warnings: new Set(),
      usage_instructions: null,
      warnings: null,
      ingredients_raw: null,
      ingredients_list: [],
      key_actives: new Set(),
      source_files: [],
    };
    for (const rec of group) {
      m.source_files.push(rec.source_file);
      if (!m.barcode && rec.barcode) m.barcode = String(rec.barcode).replace(/\D/g, '');
      if (!m.brand_name && rec.brand_name) m.brand_name = rec.brand_name;
      if (!m.product_name && rec.product_name) m.product_name = rec.product_name;
      if (!m.product_type && rec.product_type) m.product_type = rec.product_type;
      if (!m.volume && rec.volume?.value) m.volume = rec.volume;
      if (!m.made_in && rec.made_in) m.made_in = rec.made_in;
      for (const k of ['name', 'address', 'phone', 'website']) {
        if (!m.producer[k] && rec.producer?.[k]) m.producer[k] = rec.producer[k];
      }
      for (const k of ['production_date', 'expiry_date', 'pao_months', 'batch_code']) {
        if (!m.dates[k] && rec.dates?.[k]) m.dates[k] = rec.dates[k];
      }
      (rec.claims || []).forEach((c) => m.claims.add(c));
      (rec.certifications || []).forEach((c) => m.certifications.add(c));
      (rec.free_of_warnings || []).forEach((c) => m.free_of_warnings.add(c));
      if (!m.usage_instructions && rec.usage_instructions) m.usage_instructions = rec.usage_instructions;
      if (!m.warnings && rec.warnings) m.warnings = rec.warnings;
      if (rec.ingredients_list?.length > m.ingredients_list.length) {
        m.ingredients_list = rec.ingredients_list;
        m.ingredients_raw = rec.ingredients_raw || m.ingredients_raw;
      }
      (rec.key_actives || []).forEach((c) => m.key_actives.add(c));
    }
    m.claims = Array.from(m.claims);
    m.certifications = Array.from(m.certifications);
    m.free_of_warnings = Array.from(m.free_of_warnings);
    m.key_actives = Array.from(m.key_actives);
    m.inci_fingerprint = inciFingerprint(m.ingredients_list);
    merged.push(m);
  }
  return merged;
}

// === Main ===

async function main() {
  await client.connect();
  console.log(`=== OCR -> DB Merge (dry=${DRY}) ===\n`);

  const files = (await readdir(INPUT)).filter((f) => f.endsWith('.json'));
  console.log(`OCR files: ${files.length}`);

  const records = [];
  for (const f of files) {
    try {
      const data = JSON.parse(await readFile(join(INPUT, f), 'utf-8'));
      records.push(data);
    } catch {}
  }
  console.log(`Loaded records: ${records.length}`);

  const merged = clusterByProduct(records);
  console.log(`Unique products after cluster: ${merged.length}\n`);

  let stats = {
    matched_existing: 0,
    new_products: 0,
    new_brands: 0,
    inci_matched: 0,
    inci_unmatched: 0,
    skipped_no_data: 0,
  };

  // INCI cache: name -> ingredient_id
  const inciNameMap = new Map();

  async function findOrCreateBrand(name) {
    if (!name) return null;
    const slug = turkishSlug(name);
    const existing = await client.query(
      `SELECT brand_id, brand_name FROM brands
       WHERE LOWER(brand_name) = LOWER($1) OR brand_slug = $2 LIMIT 1`,
      [name, slug],
    );
    if (existing.rows.length > 0) return existing.rows[0].brand_id;
    // fuzzy match
    const fuzzy = await client.query(
      `SELECT brand_id, similarity(LOWER(brand_name), LOWER($1)) AS score
       FROM brands WHERE LOWER(brand_name) % LOWER($1)
       ORDER BY score DESC LIMIT 1`,
      [name],
    );
    if (fuzzy.rows.length > 0 && Number(fuzzy.rows[0].score) > 0.65) {
      return fuzzy.rows[0].brand_id;
    }
    if (DRY) {
      console.log(`  + NEW BRAND would be created: ${name}`);
      return -1;
    }
    const ins = await client.query(
      `INSERT INTO brands (brand_name, brand_slug, country_of_origin, is_active, created_at, updated_at)
       VALUES ($1, $2, 'TR', true, NOW(), NOW()) RETURNING brand_id`,
      [name, slug],
    );
    stats.new_brands++;
    return ins.rows[0].brand_id;
  }

  async function findInciByName(name) {
    const cached = inciNameMap.get(name.toLowerCase());
    if (cached !== undefined) return cached;
    // exact + fuzzy
    const exact = await client.query(
      `SELECT ingredient_id FROM ingredients
       WHERE LOWER(inci_name) = LOWER($1) OR LOWER(COALESCE(common_name, '')) = LOWER($1)
       LIMIT 1`,
      [name],
    );
    if (exact.rows.length > 0) {
      inciNameMap.set(name.toLowerCase(), exact.rows[0].ingredient_id);
      return exact.rows[0].ingredient_id;
    }
    const fuzzy = await client.query(
      `SELECT ingredient_id, GREATEST(
         similarity(LOWER(inci_name), LOWER($1)),
         similarity(LOWER(COALESCE(common_name, '')), LOWER($1))
       ) AS score
       FROM ingredients WHERE is_active = true
       AND (LOWER(inci_name) % LOWER($1) OR LOWER(COALESCE(common_name, '')) % LOWER($1))
       ORDER BY score DESC LIMIT 1`,
      [name],
    );
    if (fuzzy.rows.length > 0 && Number(fuzzy.rows[0].score) > 0.6) {
      inciNameMap.set(name.toLowerCase(), fuzzy.rows[0].ingredient_id);
      return fuzzy.rows[0].ingredient_id;
    }
    inciNameMap.set(name.toLowerCase(), null);
    return null;
  }

  for (const m of merged) {
    if (!m.brand_name && !m.product_name) {
      stats.skipped_no_data++;
      continue;
    }
    // Mevcut urun arama (barcode > slug)
    let existingId = null;
    if (m.barcode) {
      const r = await client.query(`SELECT product_id FROM products WHERE barcode = $1 LIMIT 1`, [m.barcode]);
      if (r.rows.length > 0) existingId = r.rows[0].product_id;
    }
    if (!existingId && m.brand_name && m.product_name) {
      const slug = turkishSlug(`${m.brand_name} ${m.product_name}`);
      const r = await client.query(
        `SELECT product_id FROM products WHERE product_slug = $1 LIMIT 1`,
        [slug],
      );
      if (r.rows.length > 0) existingId = r.rows[0].product_id;
    }

    const brandId = await findOrCreateBrand(m.brand_name);
    if (existingId) {
      stats.matched_existing++;
      console.log(`  ~ MATCH #${existingId} ${m.brand_name} / ${m.product_name} (barcode=${m.barcode || '-'})`);
      // Sadece eksik alanlari doldur
      if (!DRY) {
        await client.query(
          `UPDATE products SET
             barcode = COALESCE(barcode, $2),
             net_content_value = COALESCE(net_content_value, $3),
             net_content_unit = COALESCE(net_content_unit, $4)
           WHERE product_id = $1`,
          [existingId, m.barcode, m.volume?.value || null, m.volume?.unit || null],
        );
      }
    } else {
      stats.new_products++;
      console.log(`  + NEW: ${m.brand_name} / ${m.product_name} (barcode=${m.barcode || '-'}, inci=${m.ingredients_list.length})`);
      if (!DRY && brandId && brandId !== -1) {
        const slug = turkishSlug(`${m.brand_name} ${m.product_name}`).slice(0, 80) +
          '-' + (m.barcode ? m.barcode.slice(-4) : Date.now().toString().slice(-6));
        const ins = await client.query(
          `INSERT INTO products (
            brand_id, product_name, product_slug, short_description, barcode,
            net_content_value, net_content_unit,
            domain_type, status, target_audience,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'cosmetic', 'draft', 'adult', NOW(), NOW())
          RETURNING product_id`,
          [
            brandId,
            m.product_name || 'Bilinmiyor',
            slug,
            `${m.brand_name || ''} ${m.product_name || ''} — OCR ile eklendi (${m.source_files.length} foto).`,
            m.barcode,
            m.volume?.value || null,
            m.volume?.unit || null,
          ],
        );
        existingId = ins.rows[0].product_id;
      }
    }

    // INCI eslestir
    if (existingId && existingId > 0 && m.ingredients_list.length > 0 && !DRY) {
      for (let i = 0; i < m.ingredients_list.length; i++) {
        const name = m.ingredients_list[i];
        const inciId = await findInciByName(name);
        if (inciId) {
          stats.inci_matched++;
          // Yoksa ekle
          const exists = await client.query(
            `SELECT 1 FROM product_ingredients WHERE product_id = $1 AND ingredient_id = $2 LIMIT 1`,
            [existingId, inciId],
          );
          if (exists.rows.length === 0) {
            await client.query(
              `INSERT INTO product_ingredients (
                product_id, ingredient_id, ingredient_display_name, inci_order_rank,
                concentration_band, is_below_one_percent_estimate, is_highlighted_in_claims,
                match_status, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, 'unknown', false, $5, 'matched', NOW(), NOW())`,
              [existingId, inciId, name, i + 1, i < 5],
            );
          }
        } else {
          stats.inci_unmatched++;
        }
      }
    }
  }

  console.log(`\n=== Stats ===`);
  console.table(stats);
  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
