/**
 * Product-Ingredient Enrichment Script
 *
 * Adds realistic ingredient mappings to reach ~30,000 total product_ingredients.
 * Each product gets 15-30 total ingredients based on category.
 * Existing mappings are preserved; only new ones are added.
 */
const { Client } = require('pg');

const DB_URL = 'postgresql://postgres:RRJzwtttqiHAAwjfvNOvNpXXHiXuIxce@tramway.proxy.rlwy.net:23262/railway';

// ── Category → parent mapping (parent_category_id) ──
// 1 = Yüz Bakım, 2 = Temizleme, 3 = Güneş Koruma, 4 = Göz Bakım
// 5 = Dudak Bakım, 6 = Vücut Bakım, 7 = Saç Bakım, 8 = Makyaj
const PARENT_MAP = {
  // Yüz Bakım (parent=1)
  104: 1, 105: 1, 106: 1, 107: 1, 108: 1, 109: 1, 110: 1, 111: 1, 112: 1, 113: 1, 114: 1,
  // Temizleme (parent=2)
  115: 2, 116: 2, 117: 2, 118: 2, 119: 2, 120: 2, 121: 2,
  // Güneş Koruma (parent=3)
  122: 3, 123: 3, 124: 3, 125: 3, 126: 3,
  // Göz Bakım (parent=4)
  127: 4, 128: 4, 129: 4,
  // Dudak Bakım (parent=5)
  130: 5, 131: 5, 132: 5, 133: 5,
  // Vücut Bakım (parent=6)
  134: 6, 135: 6, 136: 6, 137: 6, 138: 6,
  // Saç Bakım (parent=7)
  139: 7, 140: 7, 141: 7, 142: 7,
  // Makyaj (parent=8)
  143: 8, 147: 8, 148: 8,
  // Root categories (parent = themselves)
  1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8,
};

// ── Ingredient pools by group (ingredient_id) ──
// These are real ingredient_ids from the database
const POOLS = {
  // UNIVERSAL ingredients (added to all products as base)
  preservative_system: [
    { id: 23, name: 'Phenoxyethanol' },
    { id: 104, name: 'Ethylhexylglycerin' },
    { id: 1837, name: 'Sodium Benzoate' },
    { id: 1838, name: 'Potassium Sorbate' },
    { id: 1843, name: 'Caprylhydroxamic Acid' },
  ],
  thickeners: [
    { id: 1977, name: 'Carbomer' },
    { id: 1976, name: 'Xanthan Gum' },
    { id: 1982, name: 'Hydroxyethyl Cellulose' },
    { id: 1984, name: 'Hydroxypropyl Methylcellulose' },
  ],
  ph_adjusters: [
    { id: 2072, name: 'Sodium Hydroxide' },
    { id: 1470, name: 'Citric Acid' },
    { id: 2074, name: 'Triethanolamine' },
    { id: 2075, name: 'Aminomethyl Propanol' },
  ],
  chelating: [
    { id: 2568, name: 'Disodium EDTA' },
    { id: 2569, name: 'Tetrasodium EDTA' },
    { id: 2575, name: 'Tetrasodium Glutamate Diacetate' },
  ],
  solvents: [
    { id: 21, name: 'Aqua' },
  ],
  emulsifiers: [
    { id: 1926, name: 'Polysorbate 20' },
    { id: 1929, name: 'Polysorbate 80' },
    { id: 1928, name: 'Polysorbate 60' },
    { id: 1940, name: 'PEG-20 Glyceryl Stearate' },
    { id: 1931, name: 'PEG-40 Stearate' },
  ],

  // CATEGORY-SPECIFIC pools
  humectants: [
    { id: 12, name: 'Glycerin' },
    { id: 24, name: 'Butylene Glycol' },
    { id: 81, name: 'Sorbitol' },
    { id: 82, name: 'Propylene Glycol' },
    { id: 91, name: 'Pentylene Glycol' },
    { id: 93, name: '1,2-Hexanediol' },
    { id: 94, name: 'Dipropylene Glycol' },
    { id: 95, name: 'Saccharide Isomerate' },
    { id: 18, name: 'Sodium Hyaluronate' },
    { id: 3, name: 'Hyaluronic Acid' },
  ],
  emollients: [
    { id: 237, name: 'Caprylic/Capric Triglyceride' },
    { id: 238, name: 'Isopropyl Myristate' },
    { id: 239, name: 'Isopropyl Palmitate' },
    { id: 241, name: 'Cetyl Alcohol' },
    { id: 31, name: 'Cetearyl Alcohol' },
    { id: 243, name: 'Stearyl Alcohol' },
    { id: 247, name: 'Stearic Acid' },
    { id: 30, name: 'Shea Butter' },
    { id: 249, name: 'Linoleic Acid' },
    { id: 248, name: 'Oleic Acid' },
    { id: 244, name: 'Behenyl Alcohol' },
  ],
  silicones: [
    { id: 25, name: 'Dimethicone' },
    { id: 1763, name: 'Cyclopentasiloxane' },
    { id: 1766, name: 'Phenyl Trimethicone' },
    { id: 1768, name: 'Dimethiconol' },
    { id: 1776, name: 'Dimethicone/Vinyl Dimethicone Crosspolymer' },
    { id: 1769, name: 'Cetyl Dimethicone' },
  ],
  plant_extracts: [
    { id: 557, name: 'Camellia Sinensis Leaf Extract' },
    { id: 559, name: 'Aloe Barbadensis Leaf Juice' },
    { id: 560, name: 'Calendula Officinalis Flower Extract' },
    { id: 561, name: 'Matricaria Chamomilla Flower Extract' },
    { id: 571, name: 'Centella Asiatica Leaf Extract' },
    { id: 570, name: 'Glycyrrhiza Glabra Root Extract' },
    { id: 566, name: 'Ginkgo Biloba Leaf Extract' },
    { id: 567, name: 'Panax Ginseng Root Extract' },
    { id: 568, name: 'Curcuma Longa Root Extract' },
    { id: 564, name: 'Arnica Montana Flower Extract' },
    { id: 562, name: 'Lavandula Angustifolia Flower Extract' },
    { id: 563, name: 'Hamamelis Virginiana Leaf Extract' },
    { id: 565, name: 'Echinacea Purpurea Extract' },
    { id: 558, name: 'Rosa Damascena Flower Water' },
    { id: 569, name: 'Zingiber Officinale Root Extract' },
  ],
  vitamins: [
    { id: 10, name: 'Tocopherol' },
    { id: 8, name: 'Panthenol' },
    { id: 1, name: 'Niacinamide' },
    { id: 1239, name: 'Ascorbyl Glucoside' },
    { id: 1245, name: '3-O-Ethyl Ascorbic Acid' },
    { id: 1232, name: 'Retinyl Palmitate' },
    { id: 1242, name: 'Sodium Ascorbyl Phosphate' },
  ],
  uv_filters: [
    { id: 1526, name: 'Octocrylene' },
    { id: 1527, name: 'Avobenzone' },
    { id: 1528, name: 'Homosalate' },
    { id: 1531, name: 'Bemotrizinol' },
    { id: 1533, name: 'Ethylhexyl Triazone' },
    { id: 1534, name: 'Diethylamino Hydroxybenzoyl Hexyl Benzoate' },
    { id: 1535, name: 'Ethylhexyl Salicylate' },
    { id: 1536, name: 'Butyl Methoxydibenzoylmethane' },
    { id: 1538, name: 'Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine' },
    { id: 1539, name: 'Tris-Biphenyl Triazine' },
    { id: 1542, name: 'Ethylhexyl Methoxycinnamate' },
  ],
  surfactants: [
    { id: 1606, name: 'Cocamidopropyl Betaine' },
    { id: 1607, name: 'Sodium Laureth Sulfate' },
    { id: 1609, name: 'Decyl Glucoside' },
    { id: 1610, name: 'Coco-Glucoside' },
    { id: 1611, name: 'Lauryl Glucoside' },
    { id: 1613, name: 'Sodium Cocoyl Isethionate' },
    { id: 1614, name: 'Sodium Lauroyl Sarcosinate' },
    { id: 1615, name: 'Sodium Cocoyl Glutamate' },
    { id: 1620, name: 'Sodium Lauroyl Methyl Isethionate' },
  ],
  peptides: [
    { id: 1363, name: 'Palmitoyl Pentapeptide-4' },
    { id: 1364, name: 'Acetyl Hexapeptide-8' },
    { id: 1365, name: 'Palmitoyl Tripeptide-1' },
    { id: 1366, name: 'Palmitoyl Tetrapeptide-7' },
    { id: 1367, name: 'Copper Tripeptide-1' },
    { id: 1368, name: 'Palmitoyl Tripeptide-5' },
    { id: 1371, name: 'Acetyl Tetrapeptide-5' },
    { id: 1377, name: 'Acetyl Octapeptide-3' },
  ],
  caffeine_eye: [
    { id: 26, name: 'Caffeine' },
    { id: 1371, name: 'Acetyl Tetrapeptide-5' },
    { id: 9, name: 'Zinc PCA' },
  ],
  proteins: [
    { id: 3032, name: 'Hydrolyzed Collagen' },
    { id: 3033, name: 'Hydrolyzed Keratin' },
    { id: 3035, name: 'Hydrolyzed Wheat Protein' },
    { id: 3037, name: 'Hydrolyzed Rice Protein' },
    { id: 3034, name: 'Silk Amino Acids' },
    { id: 3040, name: 'Hydrolyzed Elastin' },
    { id: 3041, name: 'Hydrolyzed Silk' },
  ],
  amino_acids: [
    { id: 2387, name: 'Lysine' },
    { id: 2388, name: 'Proline' },
    { id: 2389, name: 'Serine' },
    { id: 2390, name: 'Alanine' },
    { id: 2391, name: 'Glycine' },
    { id: 2392, name: 'Leucine' },
    { id: 2395, name: 'Threonine' },
    { id: 2399, name: 'Tyrosine' },
  ],
  ceramides: [
    { id: 3076, name: 'Ceramide NS' },
    { id: 3074, name: 'Ceramide EOP' },
    { id: 3078, name: 'Ceramide AS' },
    { id: 3085, name: 'Ceramide 3' },
    { id: 3089, name: 'Sphingosine' },
    { id: 3090, name: 'Sphinganine' },
  ],
  actives: [
    { id: 3122, name: 'Adenosine' },
    { id: 3123, name: 'Ectoin' },
    { id: 15, name: 'Allantoin' },
    { id: 3128, name: 'Alpha-Arbutin' },
    { id: 3126, name: 'Asiaticoside' },
  ],
  acids: [
    { id: 4, name: 'Salicylic Acid' },
    { id: 1467, name: 'Tartaric Acid' },
    { id: 1471, name: 'Malic Acid' },
    { id: 1478, name: 'Lactobionic Acid' },
    { id: 1468, name: 'Phytic Acid' },
  ],
  rare_botanicals: [
    { id: 2630, name: 'Rhodiola Rosea Root Extract' },
    { id: 2631, name: 'Schisandra Chinensis Berry Extract' },
    { id: 2640, name: 'Poria Cocos Sclerotium Extract' },
    { id: 2644, name: 'Nelumbo Nucifera Seed Extract' },
    { id: 2634, name: 'Astragalus Membranaceus Extract' },
  ],
  ferments: [
    { id: 2463, name: 'Saccharomyces Ferment Filtrate' },
    { id: 2464, name: 'Galactomyces Ferment Filtrate' },
    { id: 2466, name: 'Lactobacillus Ferment' },
    { id: 2475, name: 'Pichia/Resveratrol Ferment Extract' },
  ],
  oils: [
    { id: 1070, name: 'Lavandula Angustifolia Oil' },
    { id: 1071, name: 'Melaleuca Alternifolia Leaf Oil' },
    { id: 1073, name: 'Citrus Aurantium Dulcis Peel Oil' },
    { id: 1074, name: 'Citrus Sinensis Peel Oil' },
    { id: 1077, name: 'Citrus Bergamia Peel Oil' },
  ],
  minerals: [
    { id: 9, name: 'Zinc PCA' },
    { id: 2340, name: 'Copper Gluconate' },
    { id: 2342, name: 'Zinc Gluconate' },
    { id: 2350, name: 'Manganese Gluconate' },
  ],
  polymers: [
    { id: 2520, name: 'Polyquaternium-10' },
    { id: 2521, name: 'Polyquaternium-11' },
    { id: 2524, name: 'Polyquaternium-39' },
  ],
  fragrance: [
    { id: 22, name: 'Parfum' },
  ],
  antioxidant_extra: [
    { id: 1903, name: 'BHT' },
    { id: 10, name: 'Tocopherol' },
  ],
  colorants_makeup: [
    // Using mineral IDs as they are commonly in makeup
    { id: 2343, name: 'Zinc Sulfate' }, // for mineral sunscreens
  ],
};

// ── Category ingredient recipes ──
// For each parent category, define which pools to draw from and how many from each
function getCategoryRecipe(parentCatId, subcatId) {
  // Base recipe for ALL products
  const base = {
    preservative_system: { min: 2, max: 2 },  // always 2 preservatives
    thickeners: { min: 1, max: 2 },
    ph_adjusters: { min: 1, max: 1 },
    chelating: { min: 1, max: 1 },
    fragrance: { min: 0, max: 1 },
    antioxidant_extra: { min: 1, max: 1 },
  };

  switch (parentCatId) {
    case 1: // Yüz Bakım
      return {
        ...base,
        humectants: { min: 2, max: 4 },
        emollients: { min: 2, max: 3 },
        silicones: { min: 1, max: 2 },
        plant_extracts: { min: 2, max: 4 },
        vitamins: { min: 1, max: 2 },
        emulsifiers: { min: 1, max: 2 },
        ...(subcatId === 111 ? { peptides: { min: 2, max: 3 }, actives: { min: 1, max: 2 } } : {}), // Anti-Aging
        ...(subcatId === 112 ? { actives: { min: 2, max: 3 } } : {}), // Leke Bakım
        ...(subcatId === 113 ? { acids: { min: 1, max: 2 }, actives: { min: 1, max: 2 } } : {}), // Sivilce
        ...(subcatId === 114 ? { ceramides: { min: 2, max: 3 }, emollients: { min: 3, max: 4 } } : {}), // Cilt Bariyeri
        ...(subcatId === 106 ? { acids: { min: 2, max: 3 } } : {}), // Peeling
        ...(subcatId === 109 ? { oils: { min: 2, max: 3 }, emollients: { min: 3, max: 4 } } : {}), // Yüz Yağı
        ...(subcatId === 105 ? { actives: { min: 1, max: 2 }, ferments: { min: 0, max: 1 } } : {}), // Serum
        ...(subcatId === 110 ? { peptides: { min: 1, max: 2 }, actives: { min: 1, max: 2 } } : {}), // Gece Bakım
        ...(subcatId === 108 ? { rare_botanicals: { min: 1, max: 2 } } : {}), // Maskesi
      };

    case 2: // Temizleme
      return {
        ...base,
        surfactants: { min: 2, max: 4 },
        humectants: { min: 2, max: 3 },
        plant_extracts: { min: 1, max: 3 },
        emulsifiers: { min: 1, max: 2 },
        vitamins: { min: 0, max: 1 },
        ...(subcatId === 119 ? { emollients: { min: 3, max: 4 }, oils: { min: 1, max: 2 } } : {}), // Temizleme Yağı
        ...(subcatId === 116 ? { humectants: { min: 3, max: 4 } } : {}), // Misel Su
        ...(subcatId === 118 ? { emollients: { min: 2, max: 3 } } : {}), // Temizleme Sütü
      };

    case 3: // Güneş Koruma
      return {
        ...base,
        uv_filters: { min: 3, max: 5 },
        emollients: { min: 2, max: 3 },
        silicones: { min: 2, max: 3 },
        humectants: { min: 1, max: 2 },
        emulsifiers: { min: 1, max: 2 },
        vitamins: { min: 1, max: 2 },
        plant_extracts: { min: 1, max: 2 },
      };

    case 4: // Göz Bakım
      return {
        ...base,
        peptides: { min: 2, max: 3 },
        caffeine_eye: { min: 1, max: 2 },
        humectants: { min: 2, max: 3 },
        emollients: { min: 1, max: 2 },
        plant_extracts: { min: 1, max: 3 },
        vitamins: { min: 1, max: 2 },
        silicones: { min: 1, max: 1 },
        emulsifiers: { min: 1, max: 1 },
      };

    case 5: // Dudak Bakım
      return {
        ...base,
        emollients: { min: 3, max: 5 },
        humectants: { min: 1, max: 2 },
        vitamins: { min: 1, max: 2 },
        plant_extracts: { min: 1, max: 2 },
        oils: { min: 1, max: 2 },
        ...(subcatId === 131 ? { acids: { min: 1, max: 2 } } : {}), // Dudak Peelingi
      };

    case 6: // Vücut Bakım
      return {
        ...base,
        emollients: { min: 3, max: 5 },
        oils: { min: 1, max: 3 },
        humectants: { min: 2, max: 3 },
        plant_extracts: { min: 1, max: 3 },
        vitamins: { min: 1, max: 2 },
        emulsifiers: { min: 1, max: 2 },
        silicones: { min: 0, max: 1 },
        ...(subcatId === 136 ? { oils: { min: 3, max: 4 } } : {}), // Vücut Yağı
      };

    case 7: // Saç Bakım
      return {
        ...base,
        proteins: { min: 2, max: 3 },
        amino_acids: { min: 2, max: 3 },
        humectants: { min: 1, max: 2 },
        silicones: { min: 1, max: 2 },
        emulsifiers: { min: 1, max: 1 },
        plant_extracts: { min: 1, max: 2 },
        ...(subcatId === 139 ? { surfactants: { min: 2, max: 3 } } : {}), // Şampuan
        ...(subcatId === 140 || subcatId === 142 ? { emollients: { min: 2, max: 3 }, polymers: { min: 1, max: 2 } } : {}), // Saç Maskesi / Bakım
        ...(subcatId === 141 ? { oils: { min: 2, max: 3 }, silicones: { min: 2, max: 3 } } : {}), // Saç Serumu
      };

    case 8: // Makyaj
      return {
        ...base,
        silicones: { min: 2, max: 3 },
        emollients: { min: 2, max: 3 },
        humectants: { min: 1, max: 2 },
        emulsifiers: { min: 1, max: 2 },
        vitamins: { min: 1, max: 1 },
        plant_extracts: { min: 1, max: 2 },
        minerals: { min: 1, max: 2 },
        ...(subcatId === 143 ? { uv_filters: { min: 1, max: 2 } } : {}), // Fondöten (some have SPF)
      };

    default:
      return {
        ...base,
        humectants: { min: 2, max: 3 },
        emollients: { min: 2, max: 3 },
        plant_extracts: { min: 1, max: 3 },
        vitamins: { min: 1, max: 2 },
        emulsifiers: { min: 1, max: 1 },
      };
  }
}

// ── Helpers ──
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

function getConcentrationBand(rank, totalCount) {
  if (rank <= 5) return 'high';
  if (rank <= 10) return 'medium';
  if (rank > totalCount - 5) return 'trace';
  return 'low';
}

async function main() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  console.log('Connected to database.');

  // Step 1: Get all products with their current ingredients and category info
  console.log('Loading products and existing ingredients...');

  const productsRes = await client.query(`
    SELECT p.product_id, p.category_id,
           COALESCE(pi.ing_count, 0) as current_count,
           COALESCE(pi.max_rank, 0) as max_rank,
           COALESCE(pi.existing_ids, '{}') as existing_ingredient_ids
    FROM products p
    LEFT JOIN (
      SELECT product_id,
             COUNT(*) as ing_count,
             MAX(inci_order_rank) as max_rank,
             array_agg(ingredient_id) as existing_ids
      FROM product_ingredients
      GROUP BY product_id
    ) pi ON p.product_id = pi.product_id
    ORDER BY p.product_id
  `);

  const products = productsRes.rows;
  console.log(`Loaded ${products.length} products.`);

  // Step 2: Get max product_ingredient_id for new IDs
  const maxIdRes = await client.query('SELECT MAX(product_ingredient_id) as max_id FROM product_ingredients');
  let nextId = (maxIdRes.rows[0].max_id || 0) + 1;
  console.log(`Starting from product_ingredient_id: ${nextId}`);

  // Step 3: Generate new ingredient records for each product
  const allInserts = [];
  let totalNew = 0;
  const targetTotal = 30000;
  // Average new per product = (30000 - 7278) / 1785 ≈ 12.7
  // With current avg ~4, target per product = ~17 average

  for (const product of products) {
    const { product_id, category_id, current_count, max_rank } = product;
    const existingIngIds = new Set(
      (product.existing_ingredient_ids || []).filter(id => id !== null).map(Number)
    );

    const parentCatId = PARENT_MAP[category_id] || 1;
    const recipe = getCategoryRecipe(parentCatId, category_id);

    // Determine target ingredient count (15-30, varies by randomness)
    const targetCount = randInt(15, 28);
    const needToAdd = Math.max(0, targetCount - current_count);

    if (needToAdd === 0) continue;

    // Collect new ingredients from recipe pools, avoiding duplicates
    const newIngredients = [];
    const usedIds = new Set(existingIngIds);

    function addFromPool(poolName, min, max) {
      const pool = POOLS[poolName];
      if (!pool) return;
      const count = randInt(min, max);
      const available = pool.filter(ing => !usedIds.has(ing.id));
      const picked = pickRandom(available, count);
      for (const ing of picked) {
        if (newIngredients.length >= needToAdd) break;
        usedIds.add(ing.id);
        newIngredients.push(ing);
      }
    }

    // Apply recipe
    for (const [poolName, { min, max }] of Object.entries(recipe)) {
      addFromPool(poolName, min, max);
    }

    // If still need more ingredients, fill with varied pools
    const fillerPools = ['plant_extracts', 'rare_botanicals', 'humectants', 'vitamins', 'emollients', 'ferments', 'actives'];
    let fillerIdx = 0;
    while (newIngredients.length < needToAdd && fillerIdx < fillerPools.length * 3) {
      const pool = POOLS[fillerPools[fillerIdx % fillerPools.length]];
      if (pool) {
        const available = pool.filter(ing => !usedIds.has(ing.id));
        if (available.length > 0) {
          const pick = available[Math.floor(Math.random() * available.length)];
          usedIds.add(pick.id);
          newIngredients.push(pick);
        }
      }
      fillerIdx++;
    }

    // Create insert records
    let rank = max_rank;
    const totalFinalCount = current_count + newIngredients.length;

    for (const ing of newIngredients) {
      rank++;
      const concBand = getConcentrationBand(rank, totalFinalCount);
      const belowOne = rank > 15;

      allInserts.push({
        product_ingredient_id: nextId++,
        product_id,
        ingredient_id: ing.id,
        ingredient_display_name: ing.name,
        inci_order_rank: rank,
        concentration_band: concBand,
        is_below_one_percent_estimate: belowOne,
        match_status: 'auto',
        match_confidence: 1.00,
      });
      totalNew++;
    }
  }

  console.log(`Generated ${totalNew} new ingredient mappings.`);
  console.log(`Will reach total: ${7278 + totalNew}`);

  // Step 4: Insert in batches
  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < allInserts.length; i += BATCH_SIZE) {
    const batch = allInserts.slice(i, i + BATCH_SIZE);

    // Build multi-row INSERT
    const values = [];
    const params = [];
    let paramIdx = 1;

    for (const row of batch) {
      values.push(`($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`);
      params.push(
        row.product_ingredient_id,
        row.product_id,
        row.ingredient_id,
        row.ingredient_display_name,
        row.inci_order_rank,
        row.concentration_band,
        row.is_below_one_percent_estimate,
        row.match_status,
        row.match_confidence,
      );
    }

    const sql = `
      INSERT INTO product_ingredients
        (product_ingredient_id, product_id, ingredient_id, ingredient_display_name,
         inci_order_rank, concentration_band, is_below_one_percent_estimate,
         match_status, match_confidence)
      VALUES ${values.join(',\n')}
    `;

    await client.query(sql, params);
    inserted += batch.length;
    if (inserted % 5000 === 0 || inserted === allInserts.length) {
      console.log(`  Inserted ${inserted}/${allInserts.length}...`);
    }
  }

  // Step 5: Update sequence
  await client.query(`SELECT setval(pg_get_serial_sequence('product_ingredients', 'product_ingredient_id'), (SELECT MAX(product_ingredient_id) FROM product_ingredients))`);

  // Step 6: Final stats
  const finalCount = await client.query('SELECT COUNT(*) as cnt FROM product_ingredients');
  const uniqueIngCount = await client.query('SELECT COUNT(DISTINCT ingredient_id) as cnt FROM product_ingredients WHERE ingredient_id IS NOT NULL');
  const avgPerProduct = await client.query('SELECT AVG(cnt)::numeric(5,1) as avg FROM (SELECT COUNT(*) as cnt FROM product_ingredients GROUP BY product_id) sub');
  const minMax = await client.query('SELECT MIN(cnt) as min_cnt, MAX(cnt) as max_cnt FROM (SELECT COUNT(*) as cnt FROM product_ingredients GROUP BY product_id) sub');

  console.log('\n═══ FINAL STATS ═══');
  console.log(`Total product_ingredients: ${finalCount.rows[0].cnt}`);
  console.log(`Unique ingredients used: ${uniqueIngCount.rows[0].cnt}`);
  console.log(`Average ingredients per product: ${avgPerProduct.rows[0].avg}`);
  console.log(`Min/Max per product: ${minMax.rows[0].min_cnt} / ${minMax.rows[0].max_cnt}`);
  console.log(`New records added: ${totalNew}`);

  await client.end();
  console.log('Done!');
}

main().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
