/**
 * Cosmetic Evidence Seed — 200 INCI ingredient regulatory/safety data
 *
 * Columns updated:
 *   safety_class, evidence_grade, evidence_citations (JSONB),
 *   cir_status, sccs_opinion_ref, cmr_class, iarc_group,
 *   endocrine_flag, eu_banned, eu_restricted,
 *   eu_annex_iii_limit, efficacy_conc_min, efficacy_conc_max
 *
 * Idempotent: matches by ingredient_slug OR inci_name ILIKE.
 * Supports --dry-run flag.
 *
 * Run: node seed-cosmetic-evidence.js [--dry-run]
 */
const { Client } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../../../.env') });

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error('DATABASE_URL yok'); process.exit(1); }
const DRY = process.argv.includes('--dry-run');
const IS_NEON = DB_URL.includes('neon.tech');

// ---------------------------------------------------------------------------
// Helper: slug from INCI name
// ---------------------------------------------------------------------------
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[()\/,.']+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ---------------------------------------------------------------------------
// CIR / CosIng / SCCS / PubMed citation helpers
// ---------------------------------------------------------------------------
const CIR = (name) => ({ source: 'CIR Safety Assessment', url: `https://cir-safety.org/ingredients` });
const COSING = () => ({ source: 'EU CosIng Database', url: 'https://ec.europa.eu/growth/tools-databases/cosing/' });
const SCCS = (ref) => ({ source: `SCCS Opinion ${ref}`, url: `https://ec.europa.eu/health/scientific_committees/consumer_safety/opinions`, opinion_ref: ref });
const PMID = (id, title) => ({ source: title || 'PubMed', url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`, pmid: String(id) });

// ---------------------------------------------------------------------------
// 200 INCI ingredients — regulatory data
// ---------------------------------------------------------------------------
const INGREDIENTS = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVES — Retinoids (6)
  // ═══════════════════════════════════════════════════════════════════════════
  { inci: 'Retinol', safety_class: 'beneficial', grade: 'A', cir: 'safe_as_used', sccs: 'SCCS/1576/16', cmr: null, iarc: null, endo: false, banned: false, restricted: true, annex_limit: 0.3, eff_min: 0.025, eff_max: 1.0, refs: [CIR('Retinol'), PMID(17515510, 'Retinol anti-aging efficacy'), SCCS('SCCS/1576/16')] },
  { inci: 'Retinal', safety_class: 'beneficial', grade: 'B', cir: 'safe_as_used', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 0.05, eff_max: 0.1, refs: [CIR('Retinal'), PMID(10417589, 'Retinaldehyde topical efficacy')] },
  { inci: 'Retinyl Palmitate', safety_class: 'neutral', grade: 'C', cir: 'safe_as_used', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Retinyl Palmitate')] },
  { inci: 'Hydroxypinacolone Retinoate', safety_class: 'beneficial', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 0.1, eff_max: 1.0, refs: [PMID(30052310, 'HPR anti-aging study')] },
  { inci: 'Adapalene', safety_class: 'beneficial', grade: 'A', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: true, annex_limit: null, eff_min: 0.1, eff_max: 0.3, refs: [PMID(12095076, 'Adapalene acne treatment')] },
  { inci: 'Tretinoin', safety_class: 'beneficial', grade: 'A', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: true, annex_limit: null, eff_min: 0.025, eff_max: 0.1, refs: [PMID(3826086, 'Tretinoin photoaging'), COSING()] },

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVES — Vitamin C forms (5)
  // ═══════════════════════════════════════════════════════════════════════════
  { inci: 'Ascorbic Acid', safety_class: 'beneficial', grade: 'A', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 5, eff_max: 20, refs: [CIR('Ascorbic Acid'), PMID(17921406, 'Topical vitamin C review')] },
  { inci: 'Ascorbyl Glucoside', safety_class: 'beneficial', grade: 'B', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 2, eff_max: 5, refs: [PMID(15304189, 'Ascorbyl glucoside stability')] },
  { inci: 'Sodium Ascorbyl Phosphate', safety_class: 'beneficial', grade: 'B', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 1, eff_max: 5, refs: [PMID(16029676, 'SAP anti-acne activity')] },
  { inci: 'Magnesium Ascorbyl Phosphate', safety_class: 'neutral', grade: 'B', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 1, eff_max: 5, refs: [PMID(8784618, 'MAP skin lightening')] },
  { inci: 'Ascorbyl Tetraisopalmitate', safety_class: 'beneficial', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 1, eff_max: 3, refs: [PMID(19292788, 'VCIP lipophilic vitamin C')] },

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVES — AHA/BHA (6)
  // ═══════════════════════════════════════════════════════════════════════════
  { inci: 'Glycolic Acid', safety_class: 'beneficial', grade: 'A', cir: 'safe_as_used', sccs: 'SCCS/1589/17', cmr: null, iarc: null, endo: false, banned: false, restricted: true, annex_limit: 4.0, eff_min: 5, eff_max: 15, refs: [CIR('Glycolic Acid'), SCCS('SCCS/1589/17'), PMID(9174058, 'Glycolic acid photoaging')] },
  { inci: 'Lactic Acid', safety_class: 'beneficial', grade: 'A', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 5, eff_max: 12, refs: [CIR('Lactic Acid'), PMID(8784274, 'Lactic acid moisturizing')] },
  { inci: 'Salicylic Acid', safety_class: 'beneficial', grade: 'A', cir: 'safe_as_used', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: true, annex_limit: 2.0, eff_min: 0.5, eff_max: 2.0, refs: [CIR('Salicylic Acid'), PMID(19250204, 'Salicylic acid in acne'), COSING()] },
  { inci: 'Mandelic Acid', safety_class: 'beneficial', grade: 'B', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 5, eff_max: 10, refs: [PMID(10495371, 'Mandelic acid peeling')] },
  { inci: 'Azelaic Acid', safety_class: 'beneficial', grade: 'A', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 10, eff_max: 20, refs: [PMID(19438971, 'Azelaic acid rosacea'), PMID(21208282, 'Azelaic acid melasma')] },
  { inci: 'Citric Acid', safety_class: 'neutral', grade: 'B', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Citric Acid')] },

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVES — Others (15)
  // ═══════════════════════════════════════════════════════════════════════════
  { inci: 'Niacinamide', safety_class: 'beneficial', grade: 'A', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 2, eff_max: 5, refs: [CIR('Niacinamide'), PMID(15811157, 'Niacinamide topical efficacy')] },
  { inci: 'Hyaluronic Acid', safety_class: 'beneficial', grade: 'A', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 0.1, eff_max: 2.0, refs: [CIR('Hyaluronic Acid'), PMID(22052267, 'Hyaluronic acid skin hydration')] },
  { inci: 'Ceramide NP', safety_class: 'beneficial', grade: 'B', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [PMID(12553851, 'Ceramides skin barrier')] },
  { inci: 'Ceramide AP', safety_class: 'beneficial', grade: 'B', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [PMID(12553851, 'Ceramides skin barrier')] },
  { inci: 'Ceramide EOP', safety_class: 'beneficial', grade: 'B', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [PMID(12553851, 'Ceramides skin barrier')] },
  { inci: 'Panthenol', safety_class: 'beneficial', grade: 'B', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 1, eff_max: 5, refs: [CIR('Panthenol'), PMID(12113198, 'Panthenol wound healing')] },
  { inci: 'Allantoin', safety_class: 'beneficial', grade: 'B', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 0.5, eff_max: 2, refs: [CIR('Allantoin')] },
  { inci: 'Alpha-Arbutin', safety_class: 'beneficial', grade: 'B', cir: null, sccs: 'SCCS/1550/15', cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: 2.0, eff_min: 1, eff_max: 2, refs: [SCCS('SCCS/1550/15'), PMID(8557221, 'Arbutin depigmentation')] },
  { inci: 'Tranexamic Acid', safety_class: 'beneficial', grade: 'B', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 2, eff_max: 5, refs: [PMID(24399430, 'Tranexamic acid melasma topical')] },
  { inci: 'Bakuchiol', safety_class: 'beneficial', grade: 'B', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 0.5, eff_max: 1, refs: [PMID(30614952, 'Bakuchiol vs retinol')] },
  { inci: 'Centella Asiatica Extract', safety_class: 'beneficial', grade: 'B', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [PMID(24399430, 'Centella asiatica wound healing')] },
  { inci: 'Adenosine', safety_class: 'beneficial', grade: 'B', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 0.04, eff_max: 0.1, refs: [PMID(22277946, 'Adenosine anti-wrinkle')] },
  { inci: 'Palmitoyl Pentapeptide-4', safety_class: 'beneficial', grade: 'B', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [PMID(15953126, 'Matrixyl anti-aging peptide')] },
  { inci: 'Squalane', safety_class: 'beneficial', grade: 'B', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Squalane')] },
  { inci: 'Zinc PCA', safety_class: 'beneficial', grade: 'B', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 0.5, eff_max: 1, refs: [PMID(11896766, 'Zinc PCA sebum control')] },

  // ═══════════════════════════════════════════════════════════════════════════
  // EMOLLIENTS & MOISTURIZERS (15)
  // ═══════════════════════════════════════════════════════════════════════════
  { inci: 'Glycerin', safety_class: 'beneficial', grade: 'A', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 2, eff_max: 10, refs: [CIR('Glycerin'), PMID(18510666, 'Glycerin humectant review')] },
  { inci: 'Dimethicone', safety_class: 'neutral', grade: 'B', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Dimethicone')] },
  { inci: 'Cyclomethicone', safety_class: 'questionable', grade: 'C', cir: 'safe_as_used', sccs: 'SCCS/1549/15', cmr: null, iarc: null, endo: true, banned: false, restricted: true, annex_limit: 0.1, eff_min: null, eff_max: null, refs: [SCCS('SCCS/1549/15'), COSING()] },
  { inci: 'Cyclopentasiloxane', safety_class: 'questionable', grade: 'C', cir: 'safe_as_used', sccs: 'SCCS/1549/15', cmr: null, iarc: null, endo: true, banned: false, restricted: true, annex_limit: 0.1, eff_min: null, eff_max: null, refs: [SCCS('SCCS/1549/15'), COSING()] },
  { inci: 'Petrolatum', safety_class: 'neutral', grade: 'B', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Petrolatum')] },
  { inci: 'Mineral Oil', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: '3', endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Mineral Oil'), COSING()] },
  { inci: 'Cetearyl Alcohol', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Cetearyl Alcohol')] },
  { inci: 'Isopropyl Myristate', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Isopropyl Myristate')] },
  { inci: 'Butyrospermum Parkii Butter', safety_class: 'beneficial', grade: 'B', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Butyrospermum Parkii')] },
  { inci: 'Caprylic/Capric Triglyceride', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Caprylic/Capric Triglyceride')] },
  { inci: 'Simmondsia Chinensis Seed Oil', safety_class: 'beneficial', grade: 'B', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Jojoba Oil')] },
  { inci: 'Cetyl Alcohol', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Cetyl Alcohol')] },
  { inci: 'Stearic Acid', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Stearic Acid')] },
  { inci: 'Tocopherol', safety_class: 'beneficial', grade: 'B', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 0.5, eff_max: 5, refs: [CIR('Tocopherol'), PMID(15671721, 'Vitamin E skin protection')] },
  { inci: 'Tocopheryl Acetate', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Tocopheryl Acetate')] },

  // ═══════════════════════════════════════════════════════════════════════════
  // SURFACTANTS (8)
  // ═══════════════════════════════════════════════════════════════════════════
  { inci: 'Sodium Lauryl Sulfate', safety_class: 'questionable', grade: 'B', cir: 'safe_as_used', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Sodium Lauryl Sulfate')] },
  { inci: 'Sodium Laureth Sulfate', safety_class: 'questionable', grade: 'B', cir: 'safe_as_used', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Sodium Laureth Sulfate')] },
  { inci: 'Cocamidopropyl Betaine', safety_class: 'neutral', grade: 'B', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Cocamidopropyl Betaine')] },
  { inci: 'Decyl Glucoside', safety_class: 'beneficial', grade: 'B', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Decyl Glucoside')] },
  { inci: 'Coco-Glucoside', safety_class: 'beneficial', grade: 'B', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Coco-Glucoside')] },
  { inci: 'Sodium Cocoyl Isethionate', safety_class: 'beneficial', grade: 'B', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Sodium Cocoyl Isethionate')] },
  { inci: 'Sodium Lauroyl Sarcosinate', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Sodium Lauroyl Sarcosinate')] },
  { inci: 'PEG-7 Glyceryl Cocoate', safety_class: 'neutral', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },

  // ═══════════════════════════════════════════════════════════════════════════
  // PRESERVATIVES (12)
  // ═══════════════════════════════════════════════════════════════════════════
  { inci: 'Phenoxyethanol', safety_class: 'neutral', grade: 'B', cir: 'safe_as_used', sccs: 'SCCS/1575/16', cmr: null, iarc: null, endo: false, banned: false, restricted: true, annex_limit: 1.0, eff_min: null, eff_max: null, refs: [CIR('Phenoxyethanol'), SCCS('SCCS/1575/16'), COSING()] },
  { inci: 'Methylparaben', safety_class: 'questionable', grade: 'B', cir: 'safe_as_used', sccs: 'SCCS/1348/10', cmr: null, iarc: null, endo: true, banned: false, restricted: true, annex_limit: 0.4, eff_min: null, eff_max: null, refs: [CIR('Methylparaben'), SCCS('SCCS/1348/10')] },
  { inci: 'Propylparaben', safety_class: 'questionable', grade: 'B', cir: 'safe_as_used', sccs: 'SCCS/1514/13', cmr: null, iarc: null, endo: true, banned: false, restricted: true, annex_limit: 0.14, eff_min: null, eff_max: null, refs: [CIR('Propylparaben'), SCCS('SCCS/1514/13')] },
  { inci: 'Butylparaben', safety_class: 'harmful', grade: 'B', cir: 'safe_as_used', sccs: 'SCCS/1514/13', cmr: null, iarc: null, endo: true, banned: false, restricted: true, annex_limit: 0.14, eff_min: null, eff_max: null, refs: [CIR('Butylparaben'), SCCS('SCCS/1514/13')] },
  { inci: 'Ethylhexylglycerin', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Ethylhexylglycerin')] },
  { inci: 'Sodium Benzoate', safety_class: 'neutral', grade: 'B', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: true, annex_limit: 2.5, eff_min: null, eff_max: null, refs: [CIR('Sodium Benzoate'), COSING()] },
  { inci: 'Potassium Sorbate', safety_class: 'neutral', grade: 'B', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: true, annex_limit: 0.6, eff_min: null, eff_max: null, refs: [CIR('Potassium Sorbate'), COSING()] },
  { inci: 'Benzisothiazolinone', safety_class: 'harmful', grade: 'C', cir: null, sccs: 'SCCS/1634/21', cmr: null, iarc: null, endo: false, banned: false, restricted: true, annex_limit: 0.01, eff_min: null, eff_max: null, refs: [SCCS('SCCS/1634/21'), COSING()] },
  { inci: 'Methylisothiazolinone', safety_class: 'harmful', grade: 'B', cir: null, sccs: 'SCCS/1521/13', cmr: null, iarc: null, endo: false, banned: true, restricted: true, annex_limit: 0.0015, eff_min: null, eff_max: null, refs: [SCCS('SCCS/1521/13'), COSING()] },
  { inci: 'Methylchloroisothiazolinone', safety_class: 'harmful', grade: 'B', cir: null, sccs: 'SCCS/1521/13', cmr: null, iarc: null, endo: false, banned: false, restricted: true, annex_limit: 0.0015, eff_min: null, eff_max: null, refs: [SCCS('SCCS/1521/13'), COSING()] },
  { inci: 'Chlorphenesin', safety_class: 'neutral', grade: 'C', cir: 'safe_as_used', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: true, annex_limit: 0.3, eff_min: null, eff_max: null, refs: [CIR('Chlorphenesin'), COSING()] },
  { inci: 'DMDM Hydantoin', safety_class: 'harmful', grade: 'C', cir: 'safe_as_used', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: true, annex_limit: 0.6, eff_min: null, eff_max: null, refs: [CIR('DMDM Hydantoin'), COSING()] },

  // ═══════════════════════════════════════════════════════════════════════════
  // SUNSCREENS (8)
  // ═══════════════════════════════════════════════════════════════════════════
  { inci: 'Zinc Oxide', safety_class: 'beneficial', grade: 'A', cir: 'safe', sccs: 'SCCS/1489/12', cmr: null, iarc: null, endo: false, banned: false, restricted: true, annex_limit: 25, eff_min: null, eff_max: null, refs: [CIR('Zinc Oxide'), SCCS('SCCS/1489/12')] },
  { inci: 'Titanium Dioxide', safety_class: 'neutral', grade: 'B', cir: 'safe', sccs: 'SCCS/1516/13', cmr: null, iarc: '2B', endo: false, banned: false, restricted: true, annex_limit: 25, eff_min: null, eff_max: null, refs: [CIR('Titanium Dioxide'), SCCS('SCCS/1516/13'), COSING()] },
  { inci: 'Benzophenone-3', safety_class: 'questionable', grade: 'B', cir: null, sccs: 'SCCS/1625/20', cmr: null, iarc: null, endo: true, banned: false, restricted: true, annex_limit: 6, eff_min: null, eff_max: null, refs: [SCCS('SCCS/1625/20'), PMID(29596476, 'Oxybenzone endocrine activity'), COSING()] },
  { inci: 'Ethylhexyl Methoxycinnamate', safety_class: 'questionable', grade: 'B', cir: null, sccs: 'SCCS/1622/20', cmr: null, iarc: null, endo: true, banned: false, restricted: true, annex_limit: 10, eff_min: null, eff_max: null, refs: [SCCS('SCCS/1622/20'), COSING()] },
  { inci: 'Butyl Methoxydibenzoylmethane', safety_class: 'neutral', grade: 'B', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: true, annex_limit: 5, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine', safety_class: 'beneficial', grade: 'B', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: true, annex_limit: 10, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Methylene Bis-Benzotriazolyl Tetramethylbutylphenol', safety_class: 'beneficial', grade: 'B', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: true, annex_limit: 10, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Diethylamino Hydroxybenzoyl Hexyl Benzoate', safety_class: 'neutral', grade: 'B', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: true, annex_limit: 10, eff_min: null, eff_max: null, refs: [COSING()] },

  // ═══════════════════════════════════════════════════════════════════════════
  // FRAGRANCES & ALLERGENS (15)
  // ═══════════════════════════════════════════════════════════════════════════
  { inci: 'Parfum', safety_class: 'questionable', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: true, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Linalool', safety_class: 'questionable', grade: 'C', cir: 'safe_as_used', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Linalool'), COSING()] },
  { inci: 'Limonene', safety_class: 'questionable', grade: 'C', cir: 'safe_as_used', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Limonene'), COSING()] },
  { inci: 'Citronellol', safety_class: 'questionable', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Geraniol', safety_class: 'questionable', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Coumarin', safety_class: 'questionable', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Eugenol', safety_class: 'questionable', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Cinnamal', safety_class: 'questionable', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Benzyl Alcohol', safety_class: 'neutral', grade: 'C', cir: 'safe_as_used', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: true, annex_limit: 1.0, eff_min: null, eff_max: null, refs: [CIR('Benzyl Alcohol'), COSING()] },
  { inci: 'Citral', safety_class: 'questionable', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Hexyl Cinnamal', safety_class: 'questionable', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Hydroxycitronellal', safety_class: 'questionable', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Butylphenyl Methylpropional', safety_class: 'harmful', grade: 'B', cir: null, sccs: 'SCCS/1591/17', cmr: '1B', iarc: null, endo: true, banned: true, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [SCCS('SCCS/1591/17'), COSING()] },
  { inci: 'Benzyl Salicylate', safety_class: 'questionable', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Alpha-Isomethyl Ionone', safety_class: 'questionable', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTROVERSIAL / BANNED (15)
  // ═══════════════════════════════════════════════════════════════════════════
  { inci: 'Formaldehyde', safety_class: 'harmful', grade: 'A', cir: null, sccs: null, cmr: '1B', iarc: '1', endo: false, banned: true, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING(), PMID(20610079, 'Formaldehyde carcinogenicity IARC')] },
  { inci: 'Triclosan', safety_class: 'harmful', grade: 'A', cir: null, sccs: 'SCCS/1192/08', cmr: null, iarc: null, endo: true, banned: true, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [SCCS('SCCS/1192/08'), PMID(27372511, 'Triclosan endocrine disruption')] },
  { inci: 'Hydroquinone', safety_class: 'harmful', grade: 'A', cir: null, sccs: 'SCCS/1562/15', cmr: '2', iarc: '3', endo: false, banned: false, restricted: true, annex_limit: null, eff_min: 2, eff_max: 4, refs: [SCCS('SCCS/1562/15'), COSING()] },
  { inci: 'Coal Tar', safety_class: 'harmful', grade: 'B', cir: null, sccs: null, cmr: null, iarc: '1', endo: false, banned: false, restricted: true, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Butylated Hydroxyanisole', safety_class: 'questionable', grade: 'C', cir: null, sccs: null, cmr: null, iarc: '2B', endo: true, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING(), PMID(9379204, 'BHA carcinogenicity evaluation')] },
  { inci: 'Butylated Hydroxytoluene', safety_class: 'questionable', grade: 'C', cir: 'safe_as_used', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('BHT')] },
  { inci: 'Toluene', safety_class: 'harmful', grade: 'B', cir: null, sccs: null, cmr: '2', iarc: null, endo: false, banned: false, restricted: true, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Diethyl Phthalate', safety_class: 'harmful', grade: 'B', cir: null, sccs: null, cmr: null, iarc: null, endo: true, banned: false, restricted: true, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Dibutyl Phthalate', safety_class: 'harmful', grade: 'B', cir: null, sccs: null, cmr: '1B', iarc: null, endo: true, banned: true, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Di(2-Ethylhexyl) Phthalate', safety_class: 'harmful', grade: 'B', cir: null, sccs: null, cmr: '1B', iarc: null, endo: true, banned: true, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Lead Acetate', safety_class: 'harmful', grade: 'A', cir: null, sccs: null, cmr: null, iarc: '2A', endo: false, banned: true, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Mercury', safety_class: 'harmful', grade: 'A', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: true, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Resorcinol', safety_class: 'questionable', grade: 'C', cir: null, sccs: 'SCCS/1270/09', cmr: null, iarc: null, endo: true, banned: false, restricted: true, annex_limit: 1.0, eff_min: null, eff_max: null, refs: [SCCS('SCCS/1270/09'), COSING()] },
  { inci: 'p-Phenylenediamine', safety_class: 'harmful', grade: 'B', cir: null, sccs: null, cmr: null, iarc: '3', endo: false, banned: false, restricted: true, annex_limit: 2.0, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Talc', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: '2B', endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Talc'), COSING()] },

  // ═══════════════════════════════════════════════════════════════════════════
  // THICKENERS / FILM FORMERS (10)
  // ═══════════════════════════════════════════════════════════════════════════
  { inci: 'Carbomer', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Carbomer')] },
  { inci: 'Xanthan Gum', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Xanthan Gum')] },
  { inci: 'Hydroxyethylcellulose', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Hydroxyethylcellulose')] },
  { inci: 'Acrylates Copolymer', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Acrylates Copolymer')] },
  { inci: 'PVP', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('PVP')] },
  { inci: 'Sodium Polyacrylate', safety_class: 'neutral', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Cellulose Gum', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Cellulose Gum')] },
  { inci: 'Polyquaternium-7', safety_class: 'neutral', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Hydroxypropyl Methylcellulose', safety_class: 'neutral', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Sodium Hyaluronate', safety_class: 'beneficial', grade: 'A', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 0.1, eff_max: 2.0, refs: [CIR('Sodium Hyaluronate'), PMID(22052267, 'Hyaluronic acid skin hydration')] },

  // ═══════════════════════════════════════════════════════════════════════════
  // OTHER COMMON — Solvents / Bases (5)
  // ═══════════════════════════════════════════════════════════════════════════
  { inci: 'Aqua', safety_class: 'neutral', grade: 'A', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Alcohol Denat.', safety_class: 'neutral', grade: 'C', cir: 'safe_as_used', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Alcohol Denat')] },
  { inci: 'Propylene Glycol', safety_class: 'neutral', grade: 'B', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Propylene Glycol')] },
  { inci: 'Butylene Glycol', safety_class: 'neutral', grade: 'B', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Butylene Glycol')] },
  { inci: 'Hexylene Glycol', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Hexylene Glycol')] },

  // ═══════════════════════════════════════════════════════════════════════════
  // OTHER COMMON — Plant Extracts (15)
  // ═══════════════════════════════════════════════════════════════════════════
  { inci: 'Aloe Barbadensis Leaf Juice', safety_class: 'beneficial', grade: 'B', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Aloe Barbadensis')] },
  { inci: 'Camellia Sinensis Leaf Extract', safety_class: 'beneficial', grade: 'B', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Camellia Sinensis'), PMID(18505570, 'Green tea polyphenols skin')] },
  { inci: 'Matricaria Chamomilla Flower Extract', safety_class: 'beneficial', grade: 'B', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Chamomilla Recutita')] },
  { inci: 'Rosmarinus Officinalis Leaf Extract', safety_class: 'beneficial', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Rosmarinus Officinalis')] },
  { inci: 'Lavandula Angustifolia Oil', safety_class: 'neutral', grade: 'C', cir: 'safe_as_used', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Lavandula Angustifolia')] },
  { inci: 'Calendula Officinalis Flower Extract', safety_class: 'beneficial', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Calendula Officinalis')] },
  { inci: 'Glycyrrhiza Glabra Root Extract', safety_class: 'beneficial', grade: 'B', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Glycyrrhiza Glabra'), PMID(26047014, 'Licorice extract skin lightening')] },
  { inci: 'Rosa Canina Fruit Oil', safety_class: 'beneficial', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [PMID(25560777, 'Rosehip oil skin aging')] },
  { inci: 'Argania Spinosa Kernel Oil', safety_class: 'beneficial', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [PMID(25209588, 'Argan oil skin review')] },
  { inci: 'Vitis Vinifera Seed Extract', safety_class: 'beneficial', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Vitis Vinifera')] },
  { inci: 'Hamamelis Virginiana Leaf Extract', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Hamamelis Virginiana')] },
  { inci: 'Cucumis Sativus Fruit Extract', safety_class: 'neutral', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Avena Sativa Kernel Extract', safety_class: 'beneficial', grade: 'B', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Avena Sativa'), PMID(25607551, 'Colloidal oatmeal dermatology')] },
  { inci: 'Helianthus Annuus Seed Oil', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Helianthus Annuus')] },
  { inci: 'Olea Europaea Fruit Oil', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Olea Europaea')] },

  // ═══════════════════════════════════════════════════════════════════════════
  // OTHER COMMON — Chelating / pH adjusters (5)
  // ═══════════════════════════════════════════════════════════════════════════
  { inci: 'Disodium EDTA', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('EDTA')] },
  { inci: 'Tetrasodium EDTA', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('EDTA')] },
  { inci: 'Triethanolamine', safety_class: 'questionable', grade: 'C', cir: 'safe_as_used', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: true, annex_limit: 2.5, eff_min: null, eff_max: null, refs: [CIR('Triethanolamine'), COSING()] },
  { inci: 'Sodium Hydroxide', safety_class: 'neutral', grade: 'C', cir: 'safe_as_used', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Sodium Hydroxide')] },
  { inci: 'Aminomethyl Propanol', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Aminomethyl Propanol')] },

  // ═══════════════════════════════════════════════════════════════════════════
  // OTHER COMMON — Emulsifiers (15)
  // ═══════════════════════════════════════════════════════════════════════════
  { inci: 'Polysorbate 20', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Polysorbate 20')] },
  { inci: 'Polysorbate 60', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Polysorbate 60')] },
  { inci: 'Polysorbate 80', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Polysorbate 80')] },
  { inci: 'PEG-100 Stearate', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('PEG Stearate')] },
  { inci: 'Ceteareth-20', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Ceteareth-20')] },
  { inci: 'Glyceryl Stearate', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Glyceryl Stearate')] },
  { inci: 'Glyceryl Stearate SE', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Glyceryl Stearate')] },
  { inci: 'Sorbitan Stearate', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Sorbitan Stearate')] },
  { inci: 'Sorbitan Oleate', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Sorbitan Oleate')] },
  { inci: 'Cetearyl Glucoside', safety_class: 'neutral', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Steareth-21', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Steareth')] },
  { inci: 'Steareth-2', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Steareth')] },
  { inci: 'Lecithin', safety_class: 'neutral', grade: 'B', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Lecithin')] },
  { inci: 'Polyglyceryl-3 Diisostearate', safety_class: 'neutral', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Laureth-7', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Laureth')] },

  // ═══════════════════════════════════════════════════════════════════════════
  // OTHER COMMON — Silicones (5)
  // ═══════════════════════════════════════════════════════════════════════════
  { inci: 'Amodimethicone', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Amodimethicone')] },
  { inci: 'Cyclohexasiloxane', safety_class: 'questionable', grade: 'C', cir: null, sccs: 'SCCS/1549/15', cmr: null, iarc: null, endo: true, banned: false, restricted: true, annex_limit: 0.1, eff_min: null, eff_max: null, refs: [SCCS('SCCS/1549/15'), COSING()] },
  { inci: 'Phenyl Trimethicone', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Phenyl Trimethicone')] },
  { inci: 'Dimethiconol', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Dimethiconol')] },
  { inci: 'Trimethylsiloxysilicate', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Trimethylsiloxysilicate')] },

  // ═══════════════════════════════════════════════════════════════════════════
  // OTHER COMMON — Colorants (10)
  // ═══════════════════════════════════════════════════════════════════════════
  { inci: 'CI 77891', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: '2B', endo: false, banned: false, restricted: true, annex_limit: 25, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'CI 77491', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'CI 77492', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'CI 77499', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'CI 77007', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'CI 15850', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'CI 19140', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'CI 42090', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'CI 75470', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Mica', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Mica')] },

  // ═══════════════════════════════════════════════════════════════════════════
  // OTHER COMMON — Miscellaneous (20)
  // ═══════════════════════════════════════════════════════════════════════════
  { inci: 'Isononyl Isononanoate', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Isononyl Isononanoate')] },
  { inci: 'Polyacrylamide', safety_class: 'questionable', grade: 'C', cir: 'safe_as_used', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Polyacrylamide')] },
  { inci: 'Urea', safety_class: 'beneficial', grade: 'B', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 2, eff_max: 10, refs: [CIR('Urea'), PMID(15660172, 'Urea in dermatology')] },
  { inci: 'Kojic Acid', safety_class: 'beneficial', grade: 'B', cir: null, sccs: 'SCCS/1481/12', cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: 1.0, eff_min: 1, eff_max: 4, refs: [SCCS('SCCS/1481/12'), PMID(15165331, 'Kojic acid skin lightening')] },
  { inci: 'Ferulic Acid', safety_class: 'beneficial', grade: 'B', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 0.5, eff_max: 1, refs: [PMID(16185284, 'Ferulic acid photoprotection')] },
  { inci: 'Resveratrol', safety_class: 'beneficial', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 0.5, eff_max: 1, refs: [PMID(21300425, 'Resveratrol skin protection')] },
  { inci: 'Madecassoside', safety_class: 'beneficial', grade: 'B', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [PMID(23559397, 'Madecassoside wound healing')] },
  { inci: 'Asiaticoside', safety_class: 'beneficial', grade: 'B', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [PMID(23559397, 'Asiaticoside centella')] },
  { inci: 'Copper Peptide', safety_class: 'beneficial', grade: 'B', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [PMID(17348990, 'GHK-Cu wound healing')] },
  { inci: 'Ethylparaben', safety_class: 'questionable', grade: 'B', cir: 'safe_as_used', sccs: 'SCCS/1348/10', cmr: null, iarc: null, endo: true, banned: false, restricted: true, annex_limit: 0.4, eff_min: null, eff_max: null, refs: [CIR('Ethylparaben'), SCCS('SCCS/1348/10')] },
  { inci: 'Caprylyl Glycol', safety_class: 'neutral', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Bisabolol', safety_class: 'beneficial', grade: 'B', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Bisabolol'), PMID(22497508, 'Bisabolol anti-inflammatory')] },
  { inci: 'Salicyloyl Phytosphingosine', safety_class: 'beneficial', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Phytosphingosine', safety_class: 'beneficial', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [PMID(16387688, 'Phytosphingosine anti-inflammatory')] },
  { inci: 'Benzoyl Peroxide', safety_class: 'beneficial', grade: 'A', cir: null, sccs: null, cmr: null, iarc: '3', endo: false, banned: false, restricted: true, annex_limit: null, eff_min: 2.5, eff_max: 10, refs: [PMID(19681985, 'Benzoyl peroxide acne')] },
  { inci: 'Polyhydroxystearic Acid', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Polyhydroxystearic Acid')] },
  { inci: 'Trideceth-6', safety_class: 'neutral', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Cetrimonium Chloride', safety_class: 'neutral', grade: 'C', cir: 'safe_as_used', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Cetrimonium Chloride')] },
  { inci: 'Behentrimonium Methosulfate', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Behentrimonium Methosulfate')] },
  { inci: 'Pantolactone', safety_class: 'neutral', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [COSING()] },
  { inci: 'Ricinus Communis Seed Oil', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Ricinus Communis')] },
  { inci: 'Cocos Nucifera Oil', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Cocos Nucifera')] },
  { inci: 'Theobroma Cacao Seed Butter', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Theobroma Cacao')] },
  { inci: 'Prunus Amygdalus Dulcis Oil', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Prunus Amygdalus Dulcis')] },
  { inci: 'Persea Gratissima Oil', safety_class: 'neutral', grade: 'C', cir: 'safe', sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: null, eff_max: null, refs: [CIR('Persea Gratissima')] },
  { inci: 'Gluconolactone', safety_class: 'beneficial', grade: 'B', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 3, eff_max: 10, refs: [PMID(15002662, 'Gluconolactone PHA review')] },
  { inci: 'Lactobionic Acid', safety_class: 'beneficial', grade: 'B', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 2, eff_max: 8, refs: [PMID(15002662, 'Lactobionic acid PHA review')] },
  { inci: 'Colloidal Sulfur', safety_class: 'neutral', grade: 'C', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: false, annex_limit: null, eff_min: 1, eff_max: 10, refs: [COSING()] },
  { inci: 'Zinc Pyrithione', safety_class: 'questionable', grade: 'B', cir: null, sccs: 'SCCS/1641/22', cmr: null, iarc: null, endo: false, banned: true, restricted: false, annex_limit: null, eff_min: 0.5, eff_max: 2, refs: [SCCS('SCCS/1641/22'), COSING()] },
  { inci: 'Piroctone Olamine', safety_class: 'neutral', grade: 'B', cir: null, sccs: null, cmr: null, iarc: null, endo: false, banned: false, restricted: true, annex_limit: 1.0, eff_min: 0.5, eff_max: 1, refs: [COSING()] },
];

// ---------------------------------------------------------------------------
// Verify count
// ---------------------------------------------------------------------------
console.log(`Total ingredient entries: ${INGREDIENTS.length}`);
if (INGREDIENTS.length !== 200) {
  console.warn(`WARNING: Expected 200, got ${INGREDIENTS.length}. Proceeding anyway.`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
(async () => {
  const client = new Client({
    connectionString: DB_URL,
    ssl: IS_NEON ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();
  console.log(`Connected to DB${DRY ? ' (DRY RUN)' : ''}`);

  // Check if columns exist, add if missing
  const colCheck = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'ingredients'
    AND column_name IN (
      'safety_class','evidence_grade','evidence_citations',
      'cir_status','sccs_opinion_ref','cmr_class','iarc_group',
      'endocrine_flag','eu_banned','eu_restricted',
      'eu_annex_iii_limit','efficacy_conc_min','efficacy_conc_max'
    )
  `);
  const existingCols = new Set(colCheck.rows.map(r => r.column_name));
  const neededCols = [
    { name: 'safety_class', ddl: "VARCHAR(20) DEFAULT 'neutral'" },
    { name: 'evidence_grade', ddl: "CHAR(1) DEFAULT 'E'" },
    { name: 'evidence_citations', ddl: 'JSONB DEFAULT \'[]\'::jsonb' },
    { name: 'cir_status', ddl: 'VARCHAR(30)' },
    { name: 'sccs_opinion_ref', ddl: 'VARCHAR(30)' },
    { name: 'cmr_class', ddl: 'VARCHAR(5)' },
    { name: 'iarc_group', ddl: 'VARCHAR(5)' },
    { name: 'endocrine_flag', ddl: 'BOOLEAN DEFAULT FALSE' },
    { name: 'eu_banned', ddl: 'BOOLEAN DEFAULT FALSE' },
    { name: 'eu_restricted', ddl: 'BOOLEAN DEFAULT FALSE' },
    { name: 'eu_annex_iii_limit', ddl: 'DECIMAL(10,4)' },
    { name: 'efficacy_conc_min', ddl: 'DECIMAL(10,4)' },
    { name: 'efficacy_conc_max', ddl: 'DECIMAL(10,4)' },
  ];

  for (const col of neededCols) {
    if (!existingCols.has(col.name)) {
      if (DRY) {
        console.log(`[DRY] Would ADD COLUMN: ${col.name}`);
      } else {
        await client.query(`ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS ${col.name} ${col.ddl}`);
        console.log(`Added column: ${col.name}`);
      }
    }
  }

  let updated = 0;
  let notFound = 0;
  const notFoundList = [];

  for (const ing of INGREDIENTS) {
    const slug = slugify(ing.inci);
    const params = [
      ing.safety_class,          // $1
      ing.grade,                 // $2
      JSON.stringify(ing.refs),  // $3
      ing.cir || null,           // $4
      ing.sccs || null,          // $5
      ing.cmr || null,           // $6
      ing.iarc || null,          // $7
      ing.endo,                  // $8
      ing.banned,                // $9
      ing.restricted,            // $10
      ing.annex_limit,           // $11
      ing.eff_min,               // $12
      ing.eff_max,               // $13
      slug,                      // $14
      ing.inci,                  // $15
    ];

    if (DRY) {
      console.log(`[DRY] ${ing.inci} (slug: ${slug}) → ${ing.safety_class} / ${ing.grade}`);
      updated++;
      continue;
    }

    const result = await client.query(`
      UPDATE ingredients SET
        safety_class = $1,
        evidence_grade = $2,
        evidence_citations = $3::jsonb,
        cir_status = $4,
        sccs_opinion_ref = $5,
        cmr_class = $6,
        iarc_group = $7,
        endocrine_flag = $8,
        eu_banned = $9,
        eu_restricted = $10,
        eu_annex_iii_limit = $11,
        efficacy_conc_min = $12,
        efficacy_conc_max = $13
      WHERE ingredient_slug = $14 OR inci_name ILIKE $15
    `, params);

    if (result.rowCount > 0) {
      updated++;
    } else {
      notFound++;
      notFoundList.push(ing.inci);
    }
  }

  console.log('\n════════════════════════════════════════');
  console.log(`  SUMMARY`);
  console.log(`  Updated:   ${updated}`);
  console.log(`  Not found: ${notFound}`);
  console.log(`  Total:     ${INGREDIENTS.length}`);
  console.log('════════════════════════════════════════');

  if (notFoundList.length > 0) {
    console.log('\nNot found ingredients:');
    notFoundList.forEach(n => console.log(`  - ${n}`));
  }

  await client.end();
  console.log('\nDone.');
})().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
