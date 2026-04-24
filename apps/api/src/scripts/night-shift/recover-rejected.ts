/**
 * Post-process _rejected/*.json, normalize Claude field-name drift,
 * re-run quality gate, and promote passing ones to _ready/.
 *
 * Why: the in-batch normalizeDoc didn't apply to some rejected docs
 * (reason unclear — possibly ts-node compile cache / reload). This script
 * runs the SAME normalize logic against the persisted rejected docs and
 * recovers any that now pass.
 *
 * Usage: ./run-prod.sh src/scripts/night-shift/recover-rejected.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';

const ROOT = path.resolve(__dirname, '../../../../..');
const REJECTED_DIR = path.join(ROOT, 'apps/api/src/database/seeds/products-queue/_rejected');
const READY_DIR = path.join(ROOT, 'apps/api/src/database/seeds/products-queue/_ready');

function normalizeDoc(doc: any): void {
  if (!doc?.ingredients_to_create) return;
  for (const it of doc.ingredients_to_create) {
    if (!it.inci_name && it.ingredient_name) {
      it.inci_name = it.ingredient_name;
      delete it.ingredient_name;
    }
    if (!it.inci_name && it.ingredient_name_en) {
      it.inci_name = it.ingredient_name_en;
    }
    if (!it.common_name && it.inci_name) it.common_name = it.inci_name;
    if (!it.common_name && it.ingredient_name_tr) it.common_name = it.ingredient_name_tr;
    if (!it.evidence_citations && it.citations) {
      it.evidence_citations = it.citations;
      delete it.citations;
    }
    if (!it.effective_dose_unit && it.dose_unit) {
      it.effective_dose_unit = it.dose_unit;
      delete it.dose_unit;
    }
    if (!it.ingredient_group && it.ingredient_type) {
      it.ingredient_group = it.ingredient_type;
      delete it.ingredient_type;
    }
    if (!it.ingredient_group && it.category) {
      const cat = String(it.category).toLowerCase();
      if (/vitamin/.test(cat)) it.ingredient_group = 'vitamin';
      else if (/mineral/.test(cat)) it.ingredient_group = 'mineral';
      else if (/amino/.test(cat)) it.ingredient_group = 'amino-acid';
      else if (/fatty|omega/.test(cat)) it.ingredient_group = 'fatty-acid';
      else if (/probiotic|probiyotik/.test(cat)) it.ingredient_group = 'probiotic';
      else if (/herb|botanical|bitki/.test(cat)) it.ingredient_group = 'botanical';
      else if (/antioxidant|carotenoid/.test(cat)) it.ingredient_group = 'antioxidant';
      else if (/enzyme/.test(cat)) it.ingredient_group = 'enzyme';
      else it.ingredient_group = 'other';
    }
    if (!it.domain_type) it.domain_type = 'supplement';
  }
}

type ReadyCache = { ready_slugs: string[] };

function qualityGate(doc: any, ready: ReadyCache): { ok: boolean; reason: string | null } {
  if (doc.skip) return { ok: false, reason: `claude-skip: ${doc.reason}` };
  const p = doc.product;
  if (!p) return { ok: false, reason: 'missing product' };
  if (!p.product_name) return { ok: false, reason: 'missing product_name' };
  if (!p.brand_slug) return { ok: false, reason: 'missing brand_slug' };
  if (!p.category_slug) return { ok: false, reason: 'missing category_slug' };
  if (!p.supplement_detail?.form) return { ok: false, reason: 'missing supplement_detail.form' };
  if (!p.image_url) return { ok: false, reason: 'missing image_url' };
  if (!p.affiliate_url) return { ok: false, reason: 'missing affiliate_url' };
  if (!Array.isArray(p.ingredients) || p.ingredients.length === 0)
    return { ok: false, reason: 'no ingredients' };
  const readySlugs = new Set(ready.ready_slugs);
  const toCreate = new Set((doc.ingredients_to_create || []).map((x: any) => x.ingredient_slug));
  for (const ing of p.ingredients) {
    if (!ing.ingredient_slug) return { ok: false, reason: 'ingredient without slug' };
    if (ing.amount_per_serving == null)
      return { ok: false, reason: `${ing.ingredient_slug}: no amount` };
    if (!ing.unit) return { ok: false, reason: `${ing.ingredient_slug}: no unit` };
    if (ing.daily_value_percentage == null) {
      const noRdaPatterns =
        /collagen|protein|whey|fish-oil|omega|epa|dha|flaxseed|probiotic|lactobacillus|bifidobacterium|melatonin|ashwagandha|curcumin|curcuma|ginkgo|maca|coenzyme|creatine|hyaluron|glucosamine|chondroitin|quercetin|resveratrol|berberine|spirulina|chlorella|ginseng|rhodiola|echinacea|theanine|astaxanthin|bromelain|lutein|zeaxanthin|taurine|carnitine|alpha-lipoic/i;
      if (noRdaPatterns.test(ing.ingredient_slug)) ing.daily_value_percentage = 0;
      else return { ok: false, reason: `${ing.ingredient_slug}: no DV%` };
    }
    if (!readySlugs.has(ing.ingredient_slug) && !toCreate.has(ing.ingredient_slug))
      return {
        ok: false,
        reason: `${ing.ingredient_slug}: not in ready list and not in ingredients_to_create`,
      };
  }
  for (const it of doc.ingredients_to_create || []) {
    if (!it.ingredient_slug || !it.inci_name)
      return { ok: false, reason: `ingredients_to_create: missing slug/inci` };
    if (!it.evidence_grade || !['A', 'B', 'C'].includes(it.evidence_grade))
      return { ok: false, reason: `${it.ingredient_slug}: evidence_grade must be A/B/C` };
    if (
      !Array.isArray(it.evidence_citations) ||
      it.evidence_citations.length === 0 ||
      !it.evidence_citations[0]?.url
    )
      return { ok: false, reason: `${it.ingredient_slug}: missing evidence_citations with URL` };
    if (!it.function_summary || it.function_summary.length < 80)
      return { ok: false, reason: `${it.ingredient_slug}: function_summary <80 chars` };
  }
  return { ok: true, reason: null };
}

async function loadReady(): Promise<ReadyCache> {
  const p = path.join(ROOT, 'night-shift/logs/supplement-sprint/ready-ingredients.json');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

async function main() {
  const ready = await loadReady();
  const files = fs.readdirSync(REJECTED_DIR).filter((f) => f.endsWith('.json'));
  let recovered = 0;
  let stillFailing = 0;
  const stillFailingReasons: Record<string, number> = {};

  for (const f of files) {
    const fp = path.join(REJECTED_DIR, f);
    const raw = JSON.parse(fs.readFileSync(fp, 'utf8'));
    if (!raw.doc) continue;
    const doc = raw.doc;
    normalizeDoc(doc);
    const gate = qualityGate(doc, ready);
    if (gate.ok) {
      const slug = f.replace(/\.json$/, '');
      const readyName = slug.startsWith('orzax-') ? slug : `orzax-${slug}`;
      fs.writeFileSync(path.join(READY_DIR, `${readyName}.json`), JSON.stringify(doc, null, 2));
      fs.unlinkSync(fp);
      console.log(`  RECOVER ${slug} → _ready/`);
      recovered++;
    } else {
      stillFailing++;
      stillFailingReasons[gate.reason || 'unknown'] =
        (stillFailingReasons[gate.reason || 'unknown'] || 0) + 1;
    }
  }

  console.log(`\n--- Recovery summary ---`);
  console.log(`  Recovered: ${recovered}`);
  console.log(`  Still failing: ${stillFailing}`);
  console.log(`  Top reasons:`);
  for (const [r, c] of Object.entries(stillFailingReasons).sort((a, b) => b[1] - a[1]).slice(0, 15)) {
    console.log(`    [${c}] ${r}`);
  }
}

main().catch((e) => {
  console.error('[recover] FATAL', e);
  process.exit(1);
});
