/**
 * Cosmetic ingredient form biyoyararlanım seed
 *
 * ingredient tablosunda var olan "form kayıtları" için:
 *  - bioavailability_score (0-100)
 *  - form_type ('tretinoin', 'l_ascorbic_acid' ...)
 *  - parent_ingredient_id (üst kayıt)
 *  - domain_type = 'cosmetic' (parent kayıtlarda)
 * kolonlarını doldurur.
 *
 * Çalıştır: node seed-cosmetic-forms.js [--dry-run]
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

const FAMILIES = [
  {
    parent: { slug: 'retinoid', inci: 'Retinol', common: 'Retinoid/Retinol' },
    forms: [
      { match: ['tretinoin', 'retinoic acid'],                            form: 'tretinoin',           score: 95 },
      { match: ['retinaldehyde', 'retinal'],                              form: 'retinaldehyde',       score: 85 },
      { match: ['retinol'],                                               form: 'retinol',             score: 70 },
      { match: ['hydroxypinacolone retinoate', 'hpr', 'granactive retinoid'], form: 'granaktif_retinoid', score: 80 },
      { match: ['retinyl palmitate'],                                     form: 'retinyl_palmitate',   score: 40 },
      { match: ['retinyl acetate'],                                       form: 'retinyl_acetate',     score: 35 },
    ],
  },
  {
    parent: { slug: 'vitamin-c', inci: 'Ascorbic Acid', common: 'Vitamin C / Askorbik Asit' },
    forms: [
      { match: ['l-ascorbic acid', 'ascorbic acid'],                      form: 'l_ascorbic_acid',           score: 95 },
      { match: ['ascorbyl tetraisopalmitate', 'thd ascorbate'],           form: 'thd_ascorbate',             score: 85 },
      { match: ['ethylated ascorbic acid', '3-o-ethyl ascorbic acid'],    form: 'ethylated_ascorbic_acid',   score: 80 },
      { match: ['sodium ascorbyl phosphate'],                             form: 'sodium_ascorbyl_phosphate', score: 75 },
      { match: ['magnesium ascorbyl phosphate', 'map'],                   form: 'map',                       score: 60 },
      { match: ['ascorbyl glucoside'],                                    form: 'ascorbyl_glucoside',        score: 50 },
    ],
  },
  {
    parent: { slug: 'aha', inci: 'AHA', common: 'AHA' },
    forms: [
      { match: ['glycolic acid'],                                         form: 'glycolic',  score: 90 },
      { match: ['lactic acid'],                                           form: 'lactic',    score: 85 },
      { match: ['mandelic acid'],                                         form: 'mandelic',  score: 75 },
      { match: ['malic acid'],                                            form: 'malic',     score: 70 },
      { match: ['tartaric acid'],                                         form: 'tartaric',  score: 65 },
    ],
  },
  {
    parent: { slug: 'bha', inci: 'BHA', common: 'BHA' },
    forms: [
      { match: ['salicylic acid'],                                        form: 'salicylic',          score: 95 },
      { match: ['betaine salicylate'],                                    form: 'betaine_salicylate', score: 75 },
      { match: ['willow bark extract', 'salix alba'],                     form: 'willow_bark',        score: 40 },
    ],
  },
  {
    parent: { slug: 'vitamin-b3', inci: 'Vitamin B3', common: 'Vitamin B3' },
    forms: [
      { match: ['niacinamide', 'nicotinamide'],                           form: 'niacinamide',   score: 95 },
      { match: ['nicotinic acid', 'niacin'],                              form: 'nicotinic_acid', score: 70 },
    ],
  },
  {
    parent: { slug: 'hyaluronic-acid', inci: 'Hyaluronic Acid', common: 'Hyaluronik Asit' },
    forms: [
      { match: ['sodium hyaluronate'],                                    form: 'sodium_hyaluronate', score: 90 },
      { match: ['hydrolyzed hyaluronic acid', 'hydrolyzed sodium hyaluronate'], form: 'hydrolyzed_ha', score: 85 },
      { match: ['sodium acetylated hyaluronate', 'acetylated hyaluronate'], form: 'acetylated_ha',   score: 80 },
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
    `INSERT INTO ingredients (ingredient_slug, inci_name, common_name, domain_type, is_active)
     VALUES ($1, $2, $3, 'cosmetic', true)
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
  const client = new Client({ connectionString: DB_URL, ssl: DB_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false });
  await client.connect();

  const stats = { updated: 0, parents_created: 0, missing_form: 0, families: 0 };
  const missingLog = [];

  try {
    for (const fam of FAMILIES) {
      stats.families++;
      const parent = await findOrCreateParent(client, fam.parent, DRY);
      if (parent.created) stats.parents_created++;
      console.log(`\n✓ Family: ${parent.common_name || parent.inci_name} (id=${parent.ingredient_id}${parent.created ? ' NEW' : ''})`);

      // Ensure parent has domain_type='cosmetic'
      if (!DRY && !parent.created) {
        await client.query(
          `UPDATE ingredients SET domain_type = 'cosmetic' WHERE ingredient_id = $1`,
          [parent.ingredient_id]
        );
      }

      for (const f of fam.forms) {
        const form = await findForm(client, f.match);
        if (!form) {
          stats.missing_form++;
          missingLog.push({ family: fam.parent.slug, form: f.match[0] });
          console.log(`    ⚠ form missing: ${f.match[0]}`);
          continue;
        }
        if (form.ingredient_id === parent.ingredient_id) {
          // aynı kayıt, atlayalım
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
