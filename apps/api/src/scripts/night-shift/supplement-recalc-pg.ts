/**
 * Standalone pg-based supplement scorer — bypasses Nest/Redis.
 * Port of SupplementScoringService.calculateScore logic.
 *
 * Usage: ./run-prod.sh src/scripts/night-shift/supplement-recalc-pg.ts
 */
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const ALGO_VERSION = 'supplement-v2';
const WEIGHTS = {
  form_quality: 0.25, dose_efficacy: 0.25, evidence_grade: 0.15,
  third_party_testing: 0.15, interaction_safety: 0.10, transparency_and_tier: 0.10,
};
const EVIDENCE_SCORE: Record<string, number> = { A: 100, B: 80, C: 60, D: 40, E: 20 };
const INTERACTION_DELTA: Record<string, number> = {
  synergistic: 8, none: 0, mild: -5, moderate: -12, severe: -20, contraindicated: -30,
};
const CERT_BONUS: Record<string, number> = {
  USP_VERIFIED: 25, NSF_CERTIFIED: 20, NSF_SPORT: 20,
  CONSUMERLAB_PASS: 15, LABDOOR_A: 15, INFORMED_SPORT: 10,
  IFOS: 10, IFOS_5_STAR: 15,
  ISO_22000: 5, ISO_9001: 3, TURKAK: 3,
  HALAL: 3, HELAL: 3, KOSHER: 3,
  NON_GMO: 3, GLUTEN_FREE: 2, GLUTENSIZ: 2, GACP: 5,
  GMP: 5, CGMP: 5, PHARMA_GRADE: 5,
};

const clamp = (v: number) => Math.max(0, Math.min(100, v));
const gradeFromScore = (s: number) => (s >= 85 ? 'A' : s >= 70 ? 'B' : s >= 55 ? 'C' : s >= 40 ? 'D' : 'F');

interface Fact {
  product_id: number;
  ingredient_id: number;
  amount_per_serving: number | null;
  daily_value_percentage: number | null;
  is_proprietary_blend: boolean;
  // ingredient joined fields:
  inci_name: string | null;
  common_name: string | null;
  bioavailability_score: number | null;
  effective_dose_min: number | null;
  effective_dose_max: number | null;
  ul_dose: number | null;
  ul_by_audience: Record<string, number> | null;
  elemental_ratio: number | null;
  evidence_grade: string | null;
}

function calcFormQuality(facts: Fact[]): number {
  if (!facts.length) return 50;
  const scored = facts.map((f) => f.bioavailability_score).filter((s): s is number => s != null).map(Number);
  if (!scored.length) return 50;
  return scored.reduce((a, b) => a + b, 0) / scored.length;
}

function calcDoseEfficacy(
  facts: Fact[],
  audience: string,
  flags: { ul_exceeded: string[] },
): number {
  const resolveUl = (f: Fact): number | null => {
    if (f.ul_by_audience && f.ul_by_audience[audience] != null) return Number(f.ul_by_audience[audience]);
    return f.ul_dose != null ? Number(f.ul_dose) : null;
  };

  const withEvidence = facts.filter((f) => f.effective_dose_min != null && f.effective_dose_max != null);
  if (withEvidence.length > 0) {
    let total = 0;
    for (const f of withEvidence) {
      const ratio = f.elemental_ratio != null ? Number(f.elemental_ratio) : 1;
      const servingDose = Number(f.amount_per_serving ?? 0) * ratio;
      const dMin = Number(f.effective_dose_min!);
      const dMax = Number(f.effective_dose_max!);
      const ul = resolveUl(f);
      let s: number;
      if (servingDose >= dMin && servingDose <= dMax) s = 100;
      else if (servingDose < dMin) s = Math.max(20, (servingDose / dMin) * 80);
      else if (servingDose > dMax && (!ul || servingDose <= ul)) s = Math.max(60, 100 - ((servingDose - dMax) / dMax) * 40);
      else s = 30;
      if (ul && servingDose > ul) flags.ul_exceeded.push(f.common_name || f.inci_name || `ing#${f.ingredient_id}`);
      total += s;
    }
    return total / withEvidence.length;
  }

  const withDv = facts.filter((f) => f.daily_value_percentage != null);
  if (!withDv.length) return 50;
  let total = 0;
  for (const f of withDv) {
    const dv = Number(f.daily_value_percentage);
    let s: number;
    if (dv >= 80 && dv <= 150) s = 100;
    else if (dv >= 50 && dv < 80) s = 70 + ((dv - 50) * 30) / 30;
    else if (dv > 150 && dv <= 250) s = 100 - ((dv - 150) * 30) / 100;
    else if (dv < 50) s = (dv / 50) * 60;
    else s = Math.max(0, 70 - (dv - 250) / 10);
    total += s;
  }
  return total / withDv.length;
}

function calcEvidenceGrade(facts: Fact[]): number {
  const grades = facts.map((f) => f.evidence_grade).filter((g): g is string => g != null && EVIDENCE_SCORE[g] != null);
  if (!grades.length) return 50;
  return grades.reduce((s, g) => s + EVIDENCE_SCORE[g], 0) / grades.length;
}

function calcThirdParty(cert: string | null): number {
  if (!cert) return 40;
  const upper = cert.toUpperCase();
  let bonus = 40;
  for (const [key, val] of Object.entries(CERT_BONUS)) {
    if (upper.includes(key.replace(/_/g, ' ')) || upper.includes(key)) bonus += val;
  }
  return clamp(bonus);
}

async function calcInteractionSafety(
  c: Client,
  facts: Fact[],
  flags: { harmful_interactions: string[] },
): Promise<number> {
  const ids = facts.map((f) => f.ingredient_id).filter(Boolean);
  if (ids.length < 2) return 80;
  const r = await c.query(
    `SELECT ingredient_a_id, ingredient_b_id, severity
     FROM ingredient_interactions
     WHERE is_active=true AND (domain_type='supplement' OR domain_type='both')
       AND ingredient_a_id = ANY($1::int[]) AND ingredient_b_id = ANY($1::int[])`,
    [ids],
  );
  let score = 80;
  for (const row of r.rows) {
    const delta = INTERACTION_DELTA[row.severity] ?? 0;
    score += delta;
    if (delta <= -20) flags.harmful_interactions.push(`${row.ingredient_a_id}↔${row.ingredient_b_id}:${row.severity}`);
  }
  return clamp(score);
}

function calcTransparencyTier(facts: Fact[], cert: string | null): number {
  let score = 80;
  const props = facts.filter((f) => f.is_proprietary_blend);
  if (props.length) score -= Math.min(props.length * 20, 60);
  const hasTiO2 = facts.some((f) => {
    const n = (f.inci_name || '').toLowerCase();
    return n.includes('titanium dioxide') || n.includes('e171');
  });
  if (hasTiO2) score -= 10;
  const hasArt = facts.some((f) => {
    const n = (f.inci_name || '').toLowerCase();
    return /fd&c|red \d|yellow \d|blue \d|e1\d{2}/.test(n);
  });
  if (hasArt) score -= 5;
  const cu = (cert || '').toUpperCase();
  if (cu.includes('PHARMA') || cu.includes('PHARMACEUTICAL')) score += 5;
  else if (cu.includes('CGMP') || cu.includes('GMP')) score += 3;
  return clamp(score);
}

async function main() {
  const c = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();

  const prods = await c.query(
    `SELECT product_id, target_audience FROM products
     WHERE domain_type='supplement' ORDER BY product_id`,
  );
  console.log(`Recalculating ${prods.rowCount} supplement products`);

  const priorMap: Record<number, number> = {};
  const priors = await c.query(
    `SELECT product_id, overall_score FROM product_scores WHERE product_id = ANY($1::int[])`,
    [prods.rows.map((r) => r.product_id)],
  );
  for (const p of priors.rows) priorMap[p.product_id] = Number(p.overall_score);

  let ok = 0; let fail = 0;
  const deltas: Array<{ id: number; old: number; neu: number }> = [];
  const errors: any[] = [];

  for (let i = 0; i < prods.rowCount!; i++) {
    const pid: number = prods.rows[i].product_id;
    const audience: string = prods.rows[i].target_audience || 'adult';
    try {
      const dr = await c.query(`SELECT certification FROM supplement_details WHERE product_id=$1`, [pid]);
      const cert: string | null = dr.rows[0]?.certification ?? null;

      const fr = await c.query(
        `SELECT pi.product_id, pi.ingredient_id, pi.amount_per_serving, pi.daily_value_percentage,
                pi.is_proprietary_blend,
                i.inci_name, i.common_name, i.bioavailability_score,
                i.effective_dose_min, i.effective_dose_max, i.ul_dose, i.ul_by_audience,
                i.elemental_ratio, i.evidence_grade
         FROM supplement_ingredients pi JOIN ingredients i USING(ingredient_id)
         WHERE pi.product_id=$1`,
        [pid],
      );
      const facts = fr.rows as Fact[];
      const flags = { proprietary_blends: [] as string[], ul_exceeded: [] as string[], harmful_interactions: [] as string[] };

      const fq = calcFormQuality(facts);
      const de = calcDoseEfficacy(facts, audience, flags);
      const eg = calcEvidenceGrade(facts);
      const tp = calcThirdParty(cert);
      const is_ = await calcInteractionSafety(c, facts, flags);
      const tt = calcTransparencyTier(facts, cert);

      let overall = Math.round(
        fq * WEIGHTS.form_quality +
        de * WEIGHTS.dose_efficacy +
        eg * WEIGHTS.evidence_grade +
        tp * WEIGHTS.third_party_testing +
        is_ * WEIGHTS.interaction_safety +
        tt * WEIGHTS.transparency_and_tier,
      );
      let floorCap: string | null = null;
      if (flags.ul_exceeded.length > 0) { overall = Math.min(overall, 50); floorCap = 'ul_exceeded'; }
      if (flags.harmful_interactions.length >= 2 && !floorCap) { overall = Math.min(overall, 45); floorCap = 'harmful_interactions'; }
      if (eg <= 20 && !floorCap) { overall = Math.min(overall, 55); floorCap = 'evidence_only_e'; }
      overall = clamp(overall);
      const grade = gradeFromScore(overall);

      const breakdown = {
        form_quality: Math.round(fq),
        dose_efficacy: Math.round(de),
        evidence_grade: Math.round(eg),
        third_party_testing: Math.round(tp),
        interaction_safety: Math.round(is_),
        transparency_and_tier: Math.round(tt),
      };

      await c.query(
        `INSERT INTO product_scores (product_id, algorithm_version, overall_score, grade, breakdown, explanation, flags, floor_cap_applied, computed_at)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8, NOW())
         ON CONFLICT (product_id, algorithm_version)
         DO UPDATE SET overall_score=EXCLUDED.overall_score, grade=EXCLUDED.grade,
           breakdown=EXCLUDED.breakdown, flags=EXCLUDED.flags,
           floor_cap_applied=EXCLUDED.floor_cap_applied, computed_at=NOW()`,
        [pid, ALGO_VERSION, overall, grade, JSON.stringify(breakdown), JSON.stringify([]), JSON.stringify(flags), floorCap],
      );

      const old = priorMap[pid];
      if (old != null && old !== overall) deltas.push({ id: pid, old, neu: overall });
      ok++;
    } catch (e: any) {
      fail++;
      errors.push({ pid, err: e?.message?.slice(0, 200) });
    }
    if ((i + 1) % 20 === 0 || i === prods.rowCount! - 1) {
      console.log(`  ${i + 1}/${prods.rowCount}  ok=${ok} fail=${fail}`);
    }
  }

  const outPath = path.resolve(__dirname, '../../../../..', 'night-shift/logs/supplement-sprint/recalc-summary.json');
  fs.writeFileSync(outPath, JSON.stringify({ total: prods.rowCount, ok, fail, deltas, errors }, null, 2));
  console.log(`\nDone ok=${ok} fail=${fail} changed=${deltas.length}`);
  console.log(`Summary: ${outPath}`);
  if (deltas.length > 0) {
    const up = deltas.filter((d) => d.neu > d.old).length;
    const down = deltas.filter((d) => d.neu < d.old).length;
    console.log(`Delta: ${up} up, ${down} down`);
    console.log(`Top gainers:`);
    for (const d of [...deltas].sort((a, b) => b.neu - b.old - (a.neu - a.old)).slice(0, 10)) {
      console.log(`  #${d.id}: ${d.old} → ${d.neu} (+${d.neu - d.old})`);
    }
  }
  await c.end();
}
main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
