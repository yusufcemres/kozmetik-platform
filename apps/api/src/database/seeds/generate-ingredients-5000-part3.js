const { Client } = require('pg');
const DB_URL = 'postgresql://postgres:RRJzwtttqiHAAwjfvNOvNpXXHiXuIxce@tramway.proxy.rlwy.net:23262/railway';

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

const finalBatch = [
  // More Rare Botanicals (~100)
  ...['Uncaria Tomentosa Bark Extract','Urginea Maritima Extract','Usnea Barbata Extract',
    'Uvularia Grandiflora Extract','Vaccaria Segetalis Seed Extract',
    'Valeriana Wallichii Root Extract','Vallaris Solanacea Extract',
    'Vanda Tricolor Extract','Vanilla Fragrans Fruit Extract',
    'Verbascum Densiflorum Extract','Vernonia Cinerea Extract',
    'Vicia Sativa Seed Extract','Vigna Mungo Seed Extract',
    'Vincetoxicum Hirundinaria Extract','Viola Arvensis Extract',
    'Viscum Album Extract','Vitex Trifolia Extract',
    'Voacanga Africana Extract','Withania Coagulans Extract',
    'Woodfordia Fruticosa Extract','Wrightia Tinctoria Extract',
    'Xanthoceras Sorbifolia Extract','Xanthosoma Sagittifolium Extract',
    'Xylocarpus Granatum Extract','Xylopia Aethiopica Extract',
    'Zanthoxylum Armatum Extract','Zanthoxylum Bungeanum Extract',
    'Zanthoxylum Rhetsa Extract','Zanthoxylum Schinifolium Extract',
    'Zelkova Serrata Extract','Zephyranthes Candida Extract',
    'Zigadenus Elegans Extract','Zingiber Mioga Extract',
    'Zinnia Elegans Extract','Zizania Latifolia Extract',
    'Ziziphus Mauritiana Extract','Ziziphus Spina-Christi Extract',
    'Zornia Latifolia Extract','Zostera Noltii Extract',
    'Abelmoschus Esculentus Seed Extract','Acanthus Ilicifolius Extract',
    'Achillea Ptarmica Extract','Aconitum Carmichaelii Root Extract',
    'Actinidia Arguta Fruit Extract','Adenium Obesum Extract',
    'Adiantum Capillus-Veneris Extract','Aesculus Pavia Extract',
    'Agave Sisalana Leaf Extract','Ageratum Houstonianum Extract',
    'Agrimonia Pilosa Extract','Ailanthus Excelsa Extract',
    'Akebia Trifoliata Extract','Alangium Chinense Extract',
    'Alchemilla Alpina Extract','Aldrovanda Vesiculosa Extract',
    'Aletris Farinosa Extract','Allamanda Cathartica Extract',
    'Allium Fistulosum Extract','Allium Schoenoprasum Extract',
    'Alnus Glutinosa Extract','Alpinia Purpurata Extract',
    'Alternanthera Sessilis Extract','Alyssum Montanum Extract',
    'Amaranthus Tricolor Leaf Extract','Ambrosia Trifida Extract',
    'Amelanchier Alnifolia Fruit Extract','Ammobium Alatum Extract',
    'Amorpha Canescens Extract','Ampelopsis Brevipedunculata Extract',
    'Amygdalus Persica Kernel Oil','Anacamptis Pyramidalis Extract',
    'Anacardium Occidentale Shell Extract','Anagallis Arvensis Extract',
    'Anchusa Azurea Extract','Andromeda Polifolia Extract',
    'Anemone Hupehensis Extract','Anemone Nemorosa Extract',
    'Angelica Acutiloba Root Extract','Angelica Polymorpha Extract',
    'Anigozanthos Flavidus Extract','Annona Cherimola Extract',
    'Anthemis Tinctoria Extract','Anthriscus Sylvestris Extract',
    'Aphelandra Squarrosa Extract','Aquilegia Canadensis Extract',
    'Arabis Alpina Extract','Aralia Nudicaulis Extract',
    'Arbutus Menziesii Extract','Arctium Minus Root Extract',
    'Arctotis Stoechadifolia Extract','Ardisia Crenata Extract',
    'Arenaria Serpyllifolia Extract','Argemone Mexicana Extract',
    'Arisaema Triphyllum Extract','Aristea Ecklonii Extract',
    'Armeria Maritima Extract','Arnica Chamissonis Extract',
    'Aronia Melanocarpa Fruit Extract','Artemisia Lactiflora Extract',
    'Artocarpus Altilis Extract','Asarum Canadense Extract',
    'Asclepias Incarnata Extract','Asimina Triloba Extract'
  ].map(n => ({
    inci_name: n, ingredient_group: 'Rare Botanical', origin_type: 'natural',
    function_summary: 'Nadir bitkisel ekstre; özel biyoaktif bileşenler içerir, antioksidan ve koruyucu etki sağlar.',
    allergen_flag: false, fragrance_flag: false, preservative_flag: false
  })),

  // More Emollients (~50)
  ...['Dimethyl Isosorbide','Diisostearyl Fumarate','Trilaurin',
    'Trimethylolpropane Tricaprylate/Tricaprate','Tridecyl Erucate',
    'Tridecyl Cocoate','Stearyl Glycyrrhetinate','Stearyl Ethylhexanoate',
    'PPG-24-Glycereth-24','PPG-20-PEG-20 Hydrogenated Lanolin',
    'PPG-12-PEG-50 Lanolin','PEG-75 Lanolin','PEG-30 Lanolin',
    'Propylene Glycol Dioctanoate','Isopropyl Hydroxystearate',
    'Isopropyl Isodecanoate','Isobutyl Stearate','Hexyl Laurate',
    'Heptyl Undecylenate','Glyceryl Triundecanoate','Glyceryl Trimyristate',
    'Glyceryl Tribehenate','Glyceryl Rosinate','Glyceryl Polymethacrylate',
    'Glyceryl Oleate/Citrate','Glyceryl Monostearate','Glyceryl Distearate',
    'Glyceryl Dilaurate','Glyceryl Arachidonate','Dioctyl Sebacate',
    'Dioctyl Adipate','Dicaprylyl Maleate','Dibutyl Sebacate',
    'Dibutyl Lauroyl Glutamide','Decyl Tetradecanol','Decyl Undecanoate',
    'Cetyl Caprylate','Cetyl Dimethicone Crosspolymer',
    'C30-38 Olefin/Isopropyl Maleate/MA Copolymer','C20-22 Alcohols',
    'C18-22 Hydroxyalkyl Hydroxypalmitamide','C14-18 Alkyl Hydroxystearoyl Stearate',
    'C12-16 Alcohols/C12-16 Alkyl Glucoside','Butyrospermum Parkii Oil',
    'Behenyl Beeswax','Batyl Alcohol','Beeswax Acid',
    'Cetearyl Octanoate','Cetearyl Canola Glycerides','Butylene Glycol Cocoate',
    'Butylene Glycol Behenate','Avocadoyl Glycine'
  ].map(n => ({
    inci_name: n, ingredient_group: 'Emollient', origin_type: 'synthetic',
    function_summary: 'Yumuşatıcı/yağ; cildi yumuşatır, pürüzsüzleştirir ve nem kaybını önler.',
    allergen_flag: false, fragrance_flag: false, preservative_flag: false
  })),

  // More Polymers (~30)
  ...['Polyquaternium-2','Polyquaternium-5','Polyquaternium-15',
    'Polyquaternium-16','Polyquaternium-17','Polyquaternium-18',
    'Polyquaternium-19','Polyquaternium-20','Polyquaternium-24',
    'Polyquaternium-27','Polyquaternium-29','Polyquaternium-30',
    'Polyquaternium-31','Polyquaternium-32','Polyquaternium-33',
    'Polyquaternium-34','Polyquaternium-35','Polyquaternium-36',
    'Polyquaternium-42','Polyquaternium-43','Polyquaternium-45',
    'Polyquaternium-48','Polyquaternium-49','Polyquaternium-50',
    'Polyquaternium-52','Polyquaternium-54','Polyquaternium-56',
    'Polyquaternium-57','Polyquaternium-58','Polyquaternium-59'
  ].map(n => ({
    inci_name: n, ingredient_group: 'Polymer', origin_type: 'synthetic',
    function_summary: 'Polimer; film oluşturma, kıvam artırma veya sabitleyici işlev görür.',
    allergen_flag: false, fragrance_flag: false, preservative_flag: false
  })),

  // More UV Filters (~20)
  ...['Menthyl Anthranilate','Diethanolamine p-Methoxycinnamate',
    'Digalloyl Trioleate','Ethyl PABA','Glyceryl PABA',
    'Lawsone/Dihydroxyacetone','Phenyl Salicylate',
    'Red Veterinary Petrolatum','Aminobenzoic Acid',
    'Pentyl Dimethyl PABA','Dioxybenzone Sulfonate',
    'Isopentyl Trimethoxycinnamate Trisiloxane',
    'Phenylene Bis-Diphenyltriazine','Methoxypropylamino Cyclohexenylidene Ethoxyethylcyanoacetate',
    'Tris(Tetramethylhydroxypiperidinol) Citrate',
    'Ethylhexyl Dimethoxybenzylidene Dioxoimidazolidine Propionate',
    'Dimethicodiethylbenzalmalonate','Polysilicone-15 Crosspolymer',
    'Titanium Dioxide/Zinc Oxide','Micronized Zinc Oxide'
  ].map(n => ({
    inci_name: n, ingredient_group: 'UV Filter', origin_type: 'synthetic',
    function_summary: 'UV filtre; UVA/UVB ışınlarından koruma sağlayarak cilt hasarını önler.',
    allergen_flag: false, fragrance_flag: false, preservative_flag: false
  })),

  // More Preservatives (~30)
  ...['Phenyl Trimethicone Preservative','Thimerosal','Merthiolate',
    'Chlorobutanol','Phenylmercuric Acetate','Phenylmercuric Nitrate',
    'Thiram','Sodium Pyrithione','Copper Pyrithione',
    'Methyldibromo Glutaronitrile','Isothiazolinone Blend',
    'Kathon CG','Euxyl K 400','Euxyl PE 9010',
    'Optiphen','Optiphen Plus','Optiphen BSB-N',
    'Phenonip','Germaben II','Germall Plus',
    'Liquid Germall Plus','Germall 115','Suttocide A',
    'Dowicil 200','Bioban CS-1246','Bioban P-1487',
    'Nipaguard CMF','Rokonsal BSB-N','Sensiva PA 40',
    'Sensiva SC 50'
  ].map(n => ({
    inci_name: n, ingredient_group: 'Preservative', origin_type: 'synthetic',
    function_summary: 'Koruyucu; mikrobiyal büyümeyi engelleyerek ürünün raf ömrünü uzatır.',
    allergen_flag: false, fragrance_flag: false, preservative_flag: true,
    sensitivity_note: 'Koruyucu madde; hassas ciltlerde alerjik reaksiyona yol açabilir.'
  })),

  // More pH Adjusters (~20)
  ...['Ammonium Chloride','Ammonium Sulfate','Barium Hydroxide',
    'Calcium Acetate','Calcium Lactate','Magnesium Acetate',
    'Magnesium Lactate','Potassium Acetate','Potassium Lactate',
    'Sodium Formate','Sodium Glucoheptonate','Sodium Malate',
    'Sodium Propionate','Sodium Tartrate Dihydrate','Potassium Hydroxide Pellets',
    'Calcium Oxide','Magnesium Peroxide','Sodium Peroxide',
    'Potassium Permanganate','Hydrogen Peroxide'
  ].map(n => ({
    inci_name: n, ingredient_group: 'pH Adjuster', origin_type: 'synthetic',
    function_summary: 'pH ayarlayıcı; formülasyonun asitlik/bazlık dengesini optimize eder.',
    allergen_flag: false, fragrance_flag: false, preservative_flag: false
  })),

  // More Proteins (~15)
  ...['Hydrolyzed Fish Collagen','Hydrolyzed Marine Collagen',
    'Hydrolyzed Placental Protein','Hydrolyzed Potato Protein',
    'Hydrolyzed Roe','Hydrolyzed Royal Jelly Protein',
    'Hydrolyzed Sponge','Hydrolyzed Swiftlet Nest Extract',
    'Hydrolyzed Vegetable Keratin','Hydrolyzed Yeast Extract',
    'Marine Collagen','Fish Collagen Peptide','Bovine Collagen',
    'Porcine Collagen','Avian Collagen'
  ].map(n => ({
    inci_name: n, ingredient_group: 'Protein', origin_type: 'biotech',
    function_summary: 'Protein; cildi besler, nem tutar ve yapısal destek sağlar.',
    allergen_flag: n.includes('Fish') || n.includes('Marine'),
    fragrance_flag: false, preservative_flag: false
  })),

  // More Solvents (~15)
  ...['Methyl Soyate','Ethyl Oleate','Propyl Acetate',
    'Butyl Glycol','Hexyl Glycol','2-Methylpentane-2,4-diol',
    'Diethyl Ether','Diisopropyl Ether','Methyl tert-Butyl Ether',
    'Tetrahydrofuran','1,4-Dioxane','Morpholine',
    'N,N-Dimethylformamide','N,N-Dimethylacetamide','Gamma-Butyrolactone'
  ].map(n => ({
    inci_name: n, ingredient_group: 'Solvent', origin_type: 'synthetic',
    function_summary: 'Çözücü; aktif maddeleri çözer ve formülasyonda homojen dağılım sağlar.',
    allergen_flag: false, fragrance_flag: false, preservative_flag: false
  })),

  // More Chelating Agents (~10)
  ...['Calcium EDTA','Copper EDTA','Iron EDTA','Manganese EDTA',
    'Zinc EDTA','Sodium Trimetaphosphate','Sodium Hexametaphosphate',
    'Sodium Tripolyphosphate','Tetrasodium Pyrophosphate','Trisodium Trimetaphosphate'
  ].map(n => ({
    inci_name: n, ingredient_group: 'Chelating Agent', origin_type: 'synthetic',
    function_summary: 'Şelatör; metal iyonlarını bağlayarak ürün stabilitesini artırır.',
    allergen_flag: false, fragrance_flag: false, preservative_flag: false
  }))
];

console.log(`Part 3 total: ${finalBatch.length}`);

async function main() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  const seen = new Set();
  const unique = [];
  for (const ing of finalBatch) {
    const s = slug(ing.inci_name);
    if (!seen.has(s)) {
      seen.add(s);
      unique.push(ing);
    }
  }
  console.log(`After dedup: ${unique.length}`);

  const BATCH = 100;
  let inserted = 0, skipped = 0;

  for (let i = 0; i < unique.length; i += BATCH) {
    const batch = unique.slice(i, i + BATCH);
    const values = [];
    const params = [];
    let paramIdx = 1;
    for (const ing of batch) {
      const s = slug(ing.inci_name);
      values.push(`($${paramIdx},$${paramIdx+1},$${paramIdx+2},$${paramIdx+3},$${paramIdx+4},$${paramIdx+5},$${paramIdx+6},$${paramIdx+7},$${paramIdx+8},$${paramIdx+9})`);
      params.push(ing.inci_name, s, ing.ingredient_group, ing.origin_type||null,
        ing.function_summary||null, ing.sensitivity_note||null,
        ing.allergen_flag||false, ing.fragrance_flag||false,
        ing.preservative_flag||false, 'cosmetic');
      paramIdx += 10;
    }
    const sql = `INSERT INTO ingredients (inci_name, ingredient_slug, ingredient_group, origin_type, function_summary, sensitivity_note, allergen_flag, fragrance_flag, preservative_flag, domain_type) VALUES ${values.join(', ')} ON CONFLICT (ingredient_slug) DO NOTHING`;
    const result = await client.query(sql, params);
    inserted += result.rowCount;
    skipped += batch.length - result.rowCount;
  }

  console.log(`\nInserted: ${inserted}, Skipped: ${skipped}`);
  const countResult = await client.query('SELECT COUNT(*) FROM ingredients');
  console.log(`FINAL TOTAL: ${countResult.rows[0].count}`);

  const groupResult = await client.query('SELECT ingredient_group, COUNT(*) as cnt FROM ingredients GROUP BY ingredient_group ORDER BY cnt DESC');
  console.log('\nFinal category breakdown:');
  for (const row of groupResult.rows) {
    console.log(`  ${row.ingredient_group}: ${row.cnt}`);
  }

  await client.end();
}

main().catch(err => { console.error(err); process.exit(1); });
