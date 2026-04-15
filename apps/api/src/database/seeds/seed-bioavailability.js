/**
 * BLOK B3 — Supplement form biyoyararlanım seed (MVP tur 1, 20 kritik form)
 *
 * ingredient tablosunda var olan "form kayıtları" için:
 *  - bioavailability_score (0-100)
 *  - form_type ('bisglisinat', 'sitrat' ...)
 *  - parent_ingredient_id (Magnezyum üst kayıt)
 *  - absorption_rate (0-100, çoğunlukla = bioavailability_score)
 * kolonlarını doldurur.
 *
 * Kaynak: Memory `project_supplement_scoring.md` tablosu.
 *
 * Çalıştır: node seed-bioavailability.js [--dry-run]
 *
 * Strateji:
 *  1. Her ailede parent kaydı bul (common_name veya inci_name LIKE ile).
 *  2. Her form için matching ingredient satırı bul.
 *  3. Bulamazsan logla, eksikler sonraki seed turunda manuel eklenecek.
 *
 * Yeniden çalıştırılabilir (idempotent): UPDATE WHERE bioavailability_score
 * değişirse tekrar set eder, yoksa no-op.
 */
const { Client } = require('pg');

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../../../.env') });
const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error('DATABASE_URL yok'); process.exit(1); }
const DRY = process.argv.includes('--dry-run');

// --- Seed data ----------------------------------------------------------

// Parent ingredients are auto-created if missing (common_name = Turkish,
// inci_name = English, slug used to find/create).
const FAMILIES = [
  {
    parent: { slug: 'magnesium', inci: 'Magnesium', common: 'Magnezyum' },
    forms: [
      { match: ['magnesium bisglycinate'],                 form: 'bisglisinat', score: 80 },
      { match: ['magnesium glycinate'],                    form: 'glisinat',    score: 78 },
      { match: ['magnesium citrate'],                      form: 'sitrat',      score: 30 },
      { match: ['magnesium malate'],                       form: 'malat',       score: 50 },
      { match: ['magnesium l-threonate', 'magnesium threonate'], form: 'treonat', score: 75 },
      { match: ['magnesium oxide'],                        form: 'oksit',       score: 4  },
      { match: ['magnesium sulfate'],                      form: 'sulfat',      score: 15 },
    ],
  },
  {
    parent: { slug: 'zinc', inci: 'Zinc', common: 'Çinko' },
    forms: [
      { match: ['zinc bisglycinate'],            form: 'bisglisinat', score: 75 },
      { match: ['zinc picolinate'],              form: 'pikolinat',   score: 70 },
      { match: ['zinc citrate'],                 form: 'sitrat',      score: 60 },
      { match: ['zinc gluconate'],               form: 'glukonat',    score: 50 },
      { match: ['zinc oxide', 'çinko oksit'],    form: 'oksit',       score: 20 },
    ],
  },
  {
    parent: { slug: 'iron', inci: 'Iron', common: 'Demir' },
    forms: [
      { match: ['iron bisglycinate', 'ferrous bisglycinate'], form: 'bisglisinat', score: 75 },
      { match: ['ferrous fumarate'],                          form: 'fumarat',     score: 40 },
      { match: ['ferrous sulfate', 'iron sulfate'],           form: 'sulfat',      score: 25 },
    ],
  },
  {
    parent: { slug: 'collagen', inci: 'Collagen', common: 'Kolajen' },
    forms: [
      { match: ['hydrolyzed collagen', 'collagen hydrolysate'], form: 'hidrolize_tip_I_III', score: 85 },
      { match: ['collagen type ii', 'type ii collagen'],        form: 'tip_II',              score: 70 },
    ],
  },
  {
    parent: { slug: 'vitamin-b12', inci: 'Vitamin B12', common: 'B12 Vitamini' },
    forms: [
      { match: ['methylcobalamin'],  form: 'metilkobalamin',  score: 80 },
      { match: ['cyanocobalamin'],   form: 'siyanokobalamin', score: 50 },
      { match: ['hydroxocobalamin'], form: 'hidroksokobalamin', score: 70 },
      { match: ['adenosylcobalamin'], form: 'adenozilkobalamin', score: 75 },
    ],
  },
  {
    parent: { slug: 'vitamin-d3', inci: 'Vitamin D3', common: 'D3 Vitamini' },
    forms: [
      { match: ['cholecalciferol', 'vitamin d3'], form: 'kolekalsiferol', score: 85 },
    ],
  },
];

// --- Helpers ------------------------------------------------------------

async function findOrCreateParent(client, parent, dry) {
  // exact slug match first
  let { rows } = await client.query(
    `SELECT ingredient_id, common_name, inci_name FROM ingredients
     WHERE ingredient_slug = $1 LIMIT 1`,
    [parent.slug]
  );
  if (rows.length) return { ...rows[0], created: false };

  // loose match on name
  ({ rows } = await client.query(
    `SELECT ingredient_id, common_name, inci_name FROM ingredients
     WHERE (common_name ILIKE $1 OR inci_name ILIKE $2)
       AND parent_ingredient_id IS NULL
     ORDER BY LENGTH(COALESCE(common_name, inci_name)) ASC
     LIMIT 1`,
    [parent.common, parent.inci]
  ));
  if (rows.length) return { ...rows[0], created: false };

  if (dry) {
    console.log(`    [DRY] would create parent "${parent.common}" (${parent.slug})`);
    return { ingredient_id: -1, common_name: parent.common, inci_name: parent.inci, created: true };
  }
  const ins = await client.query(
    `INSERT INTO ingredients (ingredient_slug, inci_name, common_name, is_active)
     VALUES ($1, $2, $3, true)
     RETURNING ingredient_id, common_name, inci_name`,
    [parent.slug, parent.inci, parent.common]
  );
  return { ...ins.rows[0], created: true };
}

async function findForm(client, matchList) {
  for (const m of matchList) {
    const { rows } = await client.query(
      `SELECT ingredient_id, common_name, inci_name FROM ingredients
       WHERE common_name ILIKE $1 OR inci_name ILIKE $1
       ORDER BY LENGTH(COALESCE(common_name, inci_name)) ASC
       LIMIT 1`,
      [`%${m}%`]
    );
    if (rows.length) return rows[0];
  }
  return null;
}

async function applyUpdate(client, id, patch) {
  await client.query(
    `UPDATE ingredients
       SET bioavailability_score = $1,
           parent_ingredient_id  = $2,
           form_type             = $3,
           absorption_rate       = $4
     WHERE ingredient_id = $5`,
    [patch.score, patch.parent_id, patch.form, patch.score, id]
  );
}

// --- Main ---------------------------------------------------------------

(async () => {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const stats = { updated: 0, parents_created: 0, missing_form: 0, families: 0 };
  const missingLog = [];

  try {
    for (const fam of FAMILIES) {
      stats.families++;
      const parent = await findOrCreateParent(client, fam.parent, DRY);
      if (parent.created) stats.parents_created++;
      console.log(`\n✓ Family: ${parent.common_name || parent.inci_name} (id=${parent.ingredient_id}${parent.created ? ' NEW' : ''})`);

      for (const f of fam.forms) {
        const form = await findForm(client, f.match);
        if (!form) {
          stats.missing_form++;
          missingLog.push({ family: fam.parent.slug, form: f.match[0] });
          console.log(`    ⚠ form missing: ${f.match[0]}`);
          continue;
        }
        if (form.ingredient_id === parent.ingredient_id) {
          // aynı kayıt, atlayalım (örn. b12 parent = cyanocobalamin aynı satır olabilir)
          continue;
        }
        if (!DRY) {
          await applyUpdate(client, form.ingredient_id, {
            score: f.score,
            parent_id: parent.ingredient_id,
            form: f.form,
          });
        }
        stats.updated++;
        console.log(`    ✓ ${form.common_name || form.inci_name} → form=${f.form} score=${f.score}`);
      }
    }

    console.log('\n=== Summary ===');
    console.log(stats);
    if (missingLog.length) {
      console.log('\nMissing entries (manuel ekleme gerekebilir):');
      missingLog.forEach(m => console.log('  -', JSON.stringify(m)));
    }
    if (DRY) console.log('\n[DRY RUN] No changes persisted.');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
