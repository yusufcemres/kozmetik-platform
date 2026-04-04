/**
 * Generate comprehensive ingredient-need mappings for 5000 ingredients.
 * Preserves existing 136 mappings, adds new ones based on ingredient_group logic.
 * Target: ~5000-8000 total mappings.
 */
const { Client } = require('pg');

const DB_URL = 'postgresql://postgres:RRJzwtttqiHAAwjfvNOvNpXXHiXuIxce@tramway.proxy.rlwy.net:23262/railway';

// Need IDs
const NEED = {
  SIVILCE: 1,
  LEKE: 2,
  YASLANMA: 3,
  KURULUK: 4,
  BARIYER: 5,
  GOZENEK: 6,
  TON: 7,
  GUNES: 8,
  YAG_KONTROL: 9,
  NEMLENDIRME: 10,
  HASSASIYET: 11,
  ANTIOKSIDAN: 12,
};

// Helper: random int in range [min, max]
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: pick evidence level based on group
function evidenceForGroup(group) {
  const strong = ['Vitamin/Antioxidant', 'Vitamin', 'Antioksidan', 'Acid', 'AHA', 'BHA', 'UV Filter', 'UV Filtre', 'Ceramide/Lipid', 'Lipid', 'Peptide'];
  const moderate = ['Humectant', 'Humektan', 'Nemlendirici', 'Emollient', 'Emoliyan', 'Active', 'Aktif', 'Amino Acid', 'Enzyme', 'Protein'];
  const limited = ['Plant Extract', 'Bitki Özütü', 'Fermentation', 'Mineral', 'Essential Oil'];
  const traditional = ['Rare Botanical'];
  if (strong.includes(group)) return 'strong';
  if (moderate.includes(group)) return 'moderate';
  if (limited.includes(group)) return 'limited';
  if (traditional.includes(group)) return 'traditional';
  return 'limited';
}

// =====================================================
// GROUP-BASED MAPPING RULES
// Returns array of { need_id, effect_type, relevance_min, relevance_max, evidence_level?, note? }
// =====================================================
function getGroupMappings(group) {
  switch (group) {
    case 'Humectant':
    case 'Humektan':
    case 'Nemlendirici':
      return [
        { need_id: NEED.KURULUK, effect_type: 'positive', rmin: 65, rmax: 90, note: 'Nem çekici özelliğiyle kuruluğu azaltır' },
        { need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 70, rmax: 90, note: 'Cildin nem seviyesini artırır' },
        { need_id: NEED.BARIYER, effect_type: 'positive', rmin: 40, rmax: 65, note: 'Nem dengesini destekleyerek bariyere katkı sağlar' },
      ];

    case 'Emollient':
    case 'Emoliyan':
      return [
        { need_id: NEED.KURULUK, effect_type: 'positive', rmin: 55, rmax: 80, note: 'Cildi yumuşatır ve kuruluğu önler' },
        { need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 50, rmax: 75, note: 'Nemin kaybını engelleyerek cildi nemli tutar' },
        { need_id: NEED.BARIYER, effect_type: 'positive', rmin: 45, rmax: 70, note: 'Bariyer fonksiyonunu destekler' },
        { need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 35, rmax: 55, note: 'Yumuşatıcı etkisiyle hassas cildi rahatlatır' },
      ];

    case 'Vitamin/Antioxidant':
    case 'Vitamin':
    case 'Antioksidan':
      return [
        { need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 70, rmax: 95, note: 'Yaşlanma belirtilerini azaltır' },
        { need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 75, rmax: 95, note: 'Serbest radikallere karşı güçlü koruma sağlar' },
        { need_id: NEED.TON, effect_type: 'positive', rmin: 55, rmax: 80, note: 'Cilt tonunu aydınlatır ve eşitler' },
      ];

    case 'Peptide':
      return [
        { need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 65, rmax: 85, note: 'Kolajen sentezini destekleyerek kırışıklıkları azaltır' },
        { need_id: NEED.BARIYER, effect_type: 'positive', rmin: 55, rmax: 75, note: 'Cilt bariyerini güçlendirir' },
      ];

    case 'Acid':
    case 'AHA':
    case 'BHA':
      return [
        { need_id: NEED.SIVILCE, effect_type: 'positive', rmin: 65, rmax: 90, note: 'Gözenekleri temizleyerek sivilce oluşumunu azaltır' },
        { need_id: NEED.LEKE, effect_type: 'positive', rmin: 60, rmax: 85, note: 'Hücre yenilenmesini hızlandırarak lekeleri açar' },
        { need_id: NEED.GOZENEK, effect_type: 'positive', rmin: 65, rmax: 85, note: 'Gözenekleri sıkılaştırır ve temizler' },
        { need_id: NEED.TON, effect_type: 'positive', rmin: 55, rmax: 80, note: 'Eksfoliasyon ile cilt tonunu eşitler' },
      ];

    case 'UV Filter':
    case 'UV Filtre':
      return [
        { need_id: NEED.GUNES, effect_type: 'positive', rmin: 85, rmax: 100, note: 'UV ışınlarından koruma sağlar' },
        { need_id: NEED.LEKE, effect_type: 'positive', rmin: 60, rmax: 80, note: 'Güneş kaynaklı hiperpigmentasyonu önler' },
        { need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 55, rmax: 75, note: 'Foto-yaşlanmayı önler' },
      ];

    case 'Surfactant':
      return [
        { need_id: NEED.YAG_KONTROL, effect_type: 'positive', rmin: 30, rmax: 50, note: 'Yağ ve kiri temizler' },
      ];

    case 'Silicone':
    case 'Silikon':
      return [
        { need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 20, rmax: 40, note: 'Koruyucu film oluşturarak nem kaybını azaltır' },
      ];

    case 'Preservative':
    case 'Koruyucu':
      return [
        { need_id: NEED.HASSASIYET, effect_type: 'caution_related', rmin: 20, rmax: 40, note: 'Hassas ciltlerde tahriş riski taşıyabilir' },
      ];

    case 'Ceramide/Lipid':
    case 'Lipid':
      return [
        { need_id: NEED.BARIYER, effect_type: 'positive', rmin: 80, rmax: 95, note: 'Cilt bariyerinin temel yapı taşıdır' },
        { need_id: NEED.KURULUK, effect_type: 'positive', rmin: 75, rmax: 90, note: 'Derin nemlendirme ve kuruluk giderme' },
        { need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 60, rmax: 80, note: 'Bariyer onarımı ile hassasiyeti azaltır' },
      ];

    case 'Amino Acid':
      return [
        { need_id: NEED.BARIYER, effect_type: 'positive', rmin: 40, rmax: 60, note: 'NMF (doğal nemlendirme faktörü) bileşeni olarak bariyeri destekler' },
        { need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 40, rmax: 60, note: 'Cildin doğal nem faktörünü takviye eder' },
      ];

    case 'Fermentation':
      return [
        { need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 50, rmax: 75, note: 'Fermente aktifler hücre yenilenmesini destekler' },
        { need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 50, rmax: 70, note: 'Fermentasyon sürecinde oluşan antioksidanlar içerir' },
        { need_id: NEED.TON, effect_type: 'positive', rmin: 45, rmax: 65, note: 'Cilt parlaklığını ve tonunu iyileştirir' },
      ];

    case 'Protein':
      return [
        { need_id: NEED.BARIYER, effect_type: 'positive', rmin: 40, rmax: 60, note: 'Protein yapı taşları ile bariyeri destekler' },
      ];

    case 'Enzyme':
      return [
        { need_id: NEED.GOZENEK, effect_type: 'positive', rmin: 50, rmax: 70, note: 'Enzimatik eksfoliasyon ile gözenekleri temizler' },
        { need_id: NEED.TON, effect_type: 'positive', rmin: 50, rmax: 70, note: 'Ölü hücreleri nazikçe temizleyerek tonu eşitler' },
      ];

    case 'Mineral':
      return [
        { need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 40, rmax: 65, note: 'Mineral antioksidan desteği sağlar' },
        { need_id: NEED.BARIYER, effect_type: 'positive', rmin: 35, rmax: 55, note: 'Cilt sağlığı için gerekli mineral desteği' },
      ];

    case 'Fragrance':
    case 'Koku':
      return [
        { need_id: NEED.HASSASIYET, effect_type: 'negative', rmin: 60, rmax: 80, note: 'Hassas ciltlerde alerji ve tahriş riski yüksektir' },
      ];

    case 'Essential Oil':
      return [
        { need_id: NEED.HASSASIYET, effect_type: 'caution_related', rmin: 40, rmax: 60, note: 'Hassas ciltlerde dikkatli kullanılmalıdır' },
      ];

    case 'Colorant':
      return [
        { need_id: NEED.HASSASIYET, effect_type: 'neutral', rmin: 10, rmax: 20, note: 'Genelde nötr etkilidir, nadir hassasiyet yapabilir' },
      ];

    case 'Rare Botanical':
      return [
        // Will be handled specially below
      ];

    case 'Active':
    case 'Aktif':
      return [
        // Will be handled per-ingredient below
      ];

    // Functional groups with minimal cosmetic benefit
    case 'Emulsifier':
    case 'Thickener':
    case 'pH Adjuster':
    case 'Polymer':
    case 'Chelating Agent':
    case 'Solvent':
    case 'Çözücü':
      return []; // No cosmetic need mapping — these are formulation aids

    case 'Yatıştırıcı':
      return [
        { need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 65, rmax: 85, note: 'Cildi yatıştırır ve sakinleştirir' },
        { need_id: NEED.BARIYER, effect_type: 'positive', rmin: 40, rmax: 60, note: 'Tahriş sonrası bariyer onarımını destekler' },
      ];

    default:
      return [];
  }
}

// =====================================================
// PLANT EXTRACT KEYWORD-BASED MAPPING
// =====================================================
function getPlantExtractMappings(inciName) {
  const name = (inciName || '').toLowerCase();
  const mappings = [];

  // Anti-acne plants
  if (name.includes('melaleuca') || name.includes('tea tree')) {
    mappings.push({ need_id: NEED.SIVILCE, effect_type: 'positive', rmin: 60, rmax: 75, note: 'Doğal antiseptik etkisiyle sivilceyi azaltır' });
    mappings.push({ need_id: NEED.YAG_KONTROL, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Yağ dengesini düzenlemeye yardımcı olur' });
  }

  // Centella / CICA family
  if (name.includes('centella') || name.includes('madecass') || name.includes('asiatic')) {
    mappings.push({ need_id: NEED.BARIYER, effect_type: 'positive', rmin: 70, rmax: 85, note: 'Bariyer onarımı ve güçlendirme' });
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 60, rmax: 80, note: 'Cildi yatıştırarak hassasiyeti azaltır' });
    mappings.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 45, rmax: 65, note: 'Kolajen sentezini destekler' });
  }

  // Chamomile / calming
  if (name.includes('chamomil') || name.includes('matricaria') || name.includes('bisabolol')) {
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 60, rmax: 80, note: 'Yatıştırıcı etkisiyle hassas cildi rahatlatır' });
    mappings.push({ need_id: NEED.BARIYER, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Anti-inflamatuar etkisiyle bariyeri destekler' });
  }

  // Green tea / Camellia sinensis
  if (name.includes('camellia sinensis') || name.includes('green tea')) {
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 65, rmax: 80, note: 'Polifenol ve kateşin ile güçlü antioksidan' });
    mappings.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 50, rmax: 70, note: 'Antioksidanlarla yaşlanma belirtilerini geciktirir' });
    mappings.push({ need_id: NEED.YAG_KONTROL, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Sebum üretimini dengelemeye yardımcı olur' });
  }

  // Rose
  if (name.includes('rosa ') || name.includes('rose ') || name.includes('rosehip')) {
    mappings.push({ need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 45, rmax: 65, note: 'Cildi nemlendirir ve yumuşatır' });
    mappings.push({ need_id: NEED.TON, effect_type: 'positive', rmin: 40, rmax: 60, note: 'Cilt tonunu eşitler ve aydınlatır' });
  }

  // Aloe
  if (name.includes('aloe')) {
    mappings.push({ need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 55, rmax: 75, note: 'Yoğun nemlendirme ve ferahlatma' });
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 50, rmax: 70, note: 'Cildi yatıştırır ve sakinleştirir' });
    mappings.push({ need_id: NEED.KURULUK, effect_type: 'positive', rmin: 50, rmax: 70, note: 'Kuruluğu giderir ve cildi nemli tutar' });
  }

  // Turmeric / Curcuma
  if (name.includes('curcuma') || name.includes('turmeric')) {
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Güçlü antioksidan ve anti-inflamatuar' });
    mappings.push({ need_id: NEED.TON, effect_type: 'positive', rmin: 50, rmax: 65, note: 'Cilt tonunu aydınlatır' });
    mappings.push({ need_id: NEED.LEKE, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Hiperpigmentasyonu azaltmaya yardımcı olur' });
  }

  // Licorice / Glycyrrhiza
  if (name.includes('glycyrrhiza') || name.includes('licorice') || name.includes('glabridin')) {
    mappings.push({ need_id: NEED.LEKE, effect_type: 'positive', rmin: 60, rmax: 80, note: 'Tirozinaz inhibitörü olarak lekeleri açar' });
    mappings.push({ need_id: NEED.TON, effect_type: 'positive', rmin: 55, rmax: 75, note: 'Cilt tonunu eşitler' });
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Anti-inflamatuar etkisiyle cildi yatıştırır' });
  }

  // Witch Hazel / Hamamelis
  if (name.includes('hamamelis') || name.includes('witch hazel')) {
    mappings.push({ need_id: NEED.GOZENEK, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Gözenekleri sıkılaştırır' });
    mappings.push({ need_id: NEED.YAG_KONTROL, effect_type: 'positive', rmin: 50, rmax: 65, note: 'Yağlanmayı kontrol eder' });
  }

  // Arnica
  if (name.includes('arnica')) {
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 50, rmax: 65, note: 'Anti-inflamatuar etkisi vardır' });
  }

  // Calendula
  if (name.includes('calendula')) {
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Yatıştırıcı ve onarıcı etkisi vardır' });
    mappings.push({ need_id: NEED.BARIYER, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Cilt onarımını destekler' });
  }

  // Rosemary / Rosmarinus
  if (name.includes('rosmarinus') || name.includes('rosemary')) {
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 50, rmax: 65, note: 'Güçlü antioksidan bitkidir' });
  }

  // Ginseng / Panax
  if (name.includes('panax') || name.includes('ginseng')) {
    mappings.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 50, rmax: 70, note: 'Anti-aging ve canlandırıcı etki' });
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 45, rmax: 65, note: 'Antioksidan koruma sağlar' });
  }

  // Pomegranate / Punica
  if (name.includes('punica') || name.includes('pomegranate')) {
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Güçlü antioksidan meyvedir' });
    mappings.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 45, rmax: 65, note: 'Yaşlanma karşıtı etki gösterir' });
  }

  // Grape / Vitis
  if (name.includes('vitis') || name.includes('grape')) {
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Resveratrol ve polifenol ile antioksidan' });
    mappings.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Serbest radikal hasarını azaltır' });
  }

  // Willow bark (natural BHA)
  if (name.includes('salix') || name.includes('willow')) {
    mappings.push({ need_id: NEED.SIVILCE, effect_type: 'positive', rmin: 50, rmax: 65, note: 'Doğal salisilat kaynağı, gözenekleri açar' });
    mappings.push({ need_id: NEED.GOZENEK, effect_type: 'positive', rmin: 50, rmax: 65, note: 'Nazik eksfoliasyon ile gözenekleri sıkılaştırır' });
  }

  // Neem / Azadirachta
  if (name.includes('azadirachta') || name.includes('neem')) {
    mappings.push({ need_id: NEED.SIVILCE, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Antibakteriyel etkisiyle sivilceyi azaltır' });
  }

  // Lavender (as plant extract, not essential oil)
  if (name.includes('lavandula') || name.includes('lavender')) {
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 40, rmax: 60, note: 'Yatıştırıcı etkisi vardır' });
  }

  // Hibiscus
  if (name.includes('hibiscus')) {
    mappings.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 40, rmax: 60, note: 'Doğal AHA içeriğiyle hücre yenilenmesini destekler' });
    mappings.push({ need_id: NEED.TON, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Cilt tonunu eşitlmeye yardımcı olur' });
  }

  // Sea Buckthorn / Hippophae
  if (name.includes('hippophae') || name.includes('sea buckthorn')) {
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 55, rmax: 70, note: 'C vitamini ve karotenoidler ile zengin antioksidan' });
    mappings.push({ need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Yağ asitleri ile nemlendirme' });
  }

  // Cucumber / Cucumis
  if (name.includes('cucumis') || name.includes('cucumber')) {
    mappings.push({ need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Ferahlatıcı ve nemlendirici' });
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 35, rmax: 50, note: 'Cildi yatıştırır' });
  }

  // Oat / Avena
  if (name.includes('avena') || name.includes('oat')) {
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 60, rmax: 75, note: 'Yulaf özü cildi yatıştırır ve korur' });
    mappings.push({ need_id: NEED.BARIYER, effect_type: 'positive', rmin: 50, rmax: 65, note: 'Bariyer güçlendirme ve onarım' });
  }

  // Mulberry / Morus
  if (name.includes('morus')) {
    mappings.push({ need_id: NEED.LEKE, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Tirozinaz inhibitörü olarak lekeleri açar' });
    mappings.push({ need_id: NEED.TON, effect_type: 'positive', rmin: 50, rmax: 65, note: 'Cilt tonunu aydınlatır' });
  }

  // Soy / Glycine max
  if (name.includes('glycine max') || name.includes('soy') || name.includes('soja')) {
    mappings.push({ need_id: NEED.TON, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Cilt tonunu eşitlemeye yardımcı olur' });
    mappings.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 40, rmax: 55, note: 'İzoflavonlar ile anti-aging etki' });
  }

  // Gotu Kola (another name for centella already covered above)

  // Echinacea
  if (name.includes('echinacea')) {
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Bağışıklık destekleyici ve yatıştırıcı' });
  }

  // Comfrey / Symphytum
  if (name.includes('symphytum') || name.includes('comfrey')) {
    mappings.push({ need_id: NEED.BARIYER, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Cilt onarımını hızlandırır' });
  }

  // Bakuchiol
  if (name.includes('bakuchiol') || name.includes('psoralea')) {
    mappings.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 65, rmax: 80, note: 'Retinol alternatifi olarak kırışıklıkları azaltır' });
    mappings.push({ need_id: NEED.TON, effect_type: 'positive', rmin: 50, rmax: 65, note: 'Cilt tonunu eşitler' });
  }

  // Berberis / Barberry
  if (name.includes('berberis') || name.includes('barberry')) {
    mappings.push({ need_id: NEED.SIVILCE, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Berberin bileşeni ile antibakteriyel etki' });
  }

  // Jojoba
  if (name.includes('jojoba') || name.includes('simmondsia')) {
    mappings.push({ need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 50, rmax: 65, note: 'Sebuma benzer yapısıyla nemlendirir' });
    mappings.push({ need_id: NEED.YAG_KONTROL, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Sebum dengesini sağlar' });
  }

  // Shea / Karité / Butyrospermum
  if (name.includes('butyrospermum') || name.includes('shea') || name.includes('karite')) {
    mappings.push({ need_id: NEED.KURULUK, effect_type: 'positive', rmin: 60, rmax: 75, note: 'Yoğun besleyici ve nemlendirici' });
    mappings.push({ need_id: NEED.BARIYER, effect_type: 'positive', rmin: 50, rmax: 65, note: 'Koruyucu tabaka ile bariyeri destekler' });
  }

  // Coconut / Cocos
  if (name.includes('cocos') || name.includes('coconut')) {
    mappings.push({ need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Nemlendirici ve besleyici' });
  }

  // Sunflower / Helianthus
  if (name.includes('helianthus') || name.includes('sunflower')) {
    mappings.push({ need_id: NEED.BARIYER, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Linoleik asit ile bariyer desteği' });
    mappings.push({ need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Besleyici yağ asitleri ile nemlendirme' });
  }

  // Olive / Olea
  if (name.includes('olea ') || name.includes('olive')) {
    mappings.push({ need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Oleik asit ile nemlendirme' });
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Polifenol içerir' });
  }

  // Argan / Argania
  if (name.includes('argania') || name.includes('argan')) {
    mappings.push({ need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 50, rmax: 65, note: 'E vitamini ve yağ asitleri ile nemlendirme' });
    mappings.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Antioksidan etki ile yaşlanma karşıtı' });
  }

  // Birch / Betula
  if (name.includes('betula') || name.includes('birch')) {
    mappings.push({ need_id: NEED.GOZENEK, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Sıkılaştırıcı ve tonik etki' });
  }

  // Cinnamon / Cinnamomum
  if (name.includes('cinnamomum') || name.includes('cinnamon')) {
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Antioksidan etki' });
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'caution_related', rmin: 35, rmax: 50, note: 'Hassas ciltlerde tahriş yapabilir' });
  }

  // Papaya / Carica
  if (name.includes('carica') || name.includes('papaya')) {
    mappings.push({ need_id: NEED.TON, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Enzim içeriğiyle eksfoliasyon ve aydınlatma' });
    mappings.push({ need_id: NEED.GOZENEK, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Papain enzimi ile gözenek temizliği' });
  }

  // Pineapple / Ananas
  if (name.includes('ananas') || name.includes('pineapple')) {
    mappings.push({ need_id: NEED.TON, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Bromelain enzimi ile aydınlatma' });
  }

  // Berry extracts (blueberry, raspberry, strawberry, acai)
  if (name.includes('vaccinium') || name.includes('rubus') || name.includes('fragaria') || name.includes('euterpe') || name.includes('berry') || name.includes('blueberry') || name.includes('raspberry') || name.includes('cranberry') || name.includes('acai')) {
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 50, rmax: 65, note: 'Antioksidan açısından zengin meyve özü' });
  }

  // Seaweed / Algae / Fucus / Laminaria
  if (name.includes('fucus') || name.includes('laminaria') || name.includes('algae') || name.includes('seaweed') || name.includes('kelp') || name.includes('spirulina') || name.includes('chlorella')) {
    mappings.push({ need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Deniz mineralleri ile nemlendirme' });
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Deniz kaynaklı antioksidanlar' });
  }

  // Propolis
  if (name.includes('propolis')) {
    mappings.push({ need_id: NEED.SIVILCE, effect_type: 'positive', rmin: 50, rmax: 65, note: 'Doğal antibakteriyel etkisiyle sivilceyi önler' });
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Anti-inflamatuar etki' });
  }

  // Honey / Mel
  if (name.includes(' mel ') || name.includes(' honey') || name.includes('manuka')) {
    mappings.push({ need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 50, rmax: 65, note: 'Doğal nem çekici' });
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Yatıştırıcı ve onarıcı' });
  }

  // Mugwort / Artemisia
  if (name.includes('artemisia') || name.includes('mugwort')) {
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 55, rmax: 70, note: 'K-beauty favori yatıştırıcı bitki' });
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Antioksidan flavonoidler içerir' });
  }

  // Bamboo
  if (name.includes('bambusa') || name.includes('bamboo')) {
    mappings.push({ need_id: NEED.YAG_KONTROL, effect_type: 'positive', rmin: 35, rmax: 50, note: 'Yağ emici ve matlaştırıcı' });
  }

  // Lotus
  if (name.includes('nelumbo') || name.includes('lotus')) {
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Antioksidan etki' });
    mappings.push({ need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 35, rmax: 50, note: 'Hafif nemlendirici' });
  }

  // Peony / Paeonia
  if (name.includes('paeonia') || name.includes('peony')) {
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Anti-inflamatuar ve yatıştırıcı' });
    mappings.push({ need_id: NEED.TON, effect_type: 'positive', rmin: 35, rmax: 50, note: 'Aydınlatıcı etki' });
  }

  // Chamaemelum (Roman chamomile)
  if (name.includes('chamaemelum') || name.includes('anthemis')) {
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Yatıştırıcı papatya özü' });
  }

  // Sage / Salvia
  if (name.includes('salvia') || name.includes('sage')) {
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Antioksidan flavonoidler içerir' });
    mappings.push({ need_id: NEED.YAG_KONTROL, effect_type: 'positive', rmin: 35, rmax: 50, note: 'Yağ dengesini destekler' });
  }

  // Magnolia
  if (name.includes('magnolia')) {
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Anti-inflamatuar magnolol içerir' });
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Güçlü antioksidan' });
  }

  // Lemon / Citrus (as extract, not essential oil)
  if (name.includes('citrus') && !name.includes(' oil')) {
    mappings.push({ need_id: NEED.TON, effect_type: 'positive', rmin: 35, rmax: 50, note: 'Aydınlatıcı etki' });
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 35, rmax: 50, note: 'C vitamini ile antioksidan' });
  }

  // Ginger / Zingiber
  if (name.includes('zingiber') || name.includes('ginger')) {
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Gingerol ile antioksidan etki' });
  }

  // Moringa
  if (name.includes('moringa')) {
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Süper besin antioksidanı' });
    mappings.push({ need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Oleik asit ile nemlendirme' });
  }

  // Rice / Oryza
  if (name.includes('oryza') || name.includes('rice')) {
    mappings.push({ need_id: NEED.TON, effect_type: 'positive', rmin: 40, rmax: 60, note: 'Pirinç özü ile cilt aydınlatma' });
    mappings.push({ need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 35, rmax: 50, note: 'Amino asitler ile nemlendirme' });
  }

  // Default for plant extracts with no specific match — mild antioxidant
  if (mappings.length === 0) {
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 30, rmax: 50, note: 'Bitkisel antioksidan içerir' });
  }

  return mappings;
}

// =====================================================
// ESSENTIAL OIL SPECIFIC MAPPINGS (on top of group caution)
// =====================================================
function getEssentialOilExtraMappings(inciName) {
  const name = (inciName || '').toLowerCase();
  const mappings = [];

  if (name.includes('melaleuca') || name.includes('tea tree')) {
    mappings.push({ need_id: NEED.SIVILCE, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Doğal antiseptik, sivilce karşıtı' });
  }
  if (name.includes('lavandula') || name.includes('lavender')) {
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 35, rmax: 50, note: 'Yatıştırıcı aromatik etki' });
  }
  if (name.includes('rosmarinus') || name.includes('rosemary')) {
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Antioksidan bileşenler içerir' });
  }

  return mappings;
}

// =====================================================
// ACTIVE INGREDIENT SPECIFIC MAPPINGS
// =====================================================
function getActiveMappings(inciName) {
  const name = (inciName || '').toLowerCase();
  const mappings = [];

  // Arbutin variants
  if (name.includes('arbutin') || name.includes('hydroquinone') || name.includes('resorcinol') || name.includes('thiamidol') || name.includes('glabridin') || name.includes('liquiritin') || name.includes('undecylenoyl phenylalanine')) {
    mappings.push({ need_id: NEED.LEKE, effect_type: 'positive', rmin: 70, rmax: 90, note: 'Melanin sentezini inhibe ederek lekeleri açar' });
    mappings.push({ need_id: NEED.TON, effect_type: 'positive', rmin: 65, rmax: 85, note: 'Cilt tonunu eşitler ve aydınlatır' });
  }
  // Caffeine
  if (name.includes('caffeine')) {
    mappings.push({ need_id: NEED.GOZENEK, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Vazokonstriktör etkiyle gözenekleri sıkılaştırır' });
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Serbest radikal temizleyici' });
  }
  // Adenosine
  if (name.includes('adenosine')) {
    mappings.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 60, rmax: 80, note: 'Hücre enerjisi ve kırışıklık azaltma' });
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Anti-inflamatuar etki' });
  }
  // Ectoin
  if (name.includes('ectoin')) {
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 65, rmax: 80, note: 'Ekstremolit — cildi dış etkenlere karşı korur' });
    mappings.push({ need_id: NEED.BARIYER, effect_type: 'positive', rmin: 60, rmax: 75, note: 'Bariyer koruyucu etki' });
  }
  // CICA / Centella derivatives
  if (name.includes('cica') || name.includes('asiaticoside') || name.includes('centella') || name.includes('triterpene')) {
    mappings.push({ need_id: NEED.BARIYER, effect_type: 'positive', rmin: 70, rmax: 90, note: 'Bariyer onarımı ve güçlendirme' });
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 60, rmax: 80, note: 'Cildi yatıştırır' });
  }
  // Azelaic Acid
  if (name.includes('azelaic') || name.includes('azeloyl')) {
    mappings.push({ need_id: NEED.SIVILCE, effect_type: 'positive', rmin: 70, rmax: 85, note: 'Anti-bakteriyel ve anti-inflamatuar' });
    mappings.push({ need_id: NEED.LEKE, effect_type: 'positive', rmin: 65, rmax: 80, note: 'Melanin üretimini düzenler' });
    mappings.push({ need_id: NEED.TON, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Cilt tonunu eşitler' });
  }
  // Tranexamic Acid
  if (name.includes('tranexamic')) {
    mappings.push({ need_id: NEED.LEKE, effect_type: 'positive', rmin: 75, rmax: 90, note: 'Melanin transferini bloke eder' });
    mappings.push({ need_id: NEED.TON, effect_type: 'positive', rmin: 65, rmax: 80, note: 'Cilt tonunu belirgin şekilde eşitler' });
  }
  // Snail secretion
  if (name.includes('snail')) {
    mappings.push({ need_id: NEED.BARIYER, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Cilt onarımını destekler' });
    mappings.push({ need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 50, rmax: 65, note: 'Doğal nemlendirici bileşenler içerir' });
    mappings.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Glikoproteinler ile yaşlanma karşıtı' });
  }
  // Mandelic Acid
  if (name.includes('mandelic')) {
    mappings.push({ need_id: NEED.LEKE, effect_type: 'positive', rmin: 60, rmax: 75, note: 'Büyük moleküllü AHA, nazik aydınlatma' });
    mappings.push({ need_id: NEED.GOZENEK, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Gözenek temizleme ve sıkılaştırma' });
    mappings.push({ need_id: NEED.TON, effect_type: 'positive', rmin: 50, rmax: 65, note: 'Cilt tonunu eşitler' });
  }
  // CBD / Cannabis
  if (name.includes('cannabidiol') || name.includes('cbd') || name.includes('cannabigerol') || name.includes('cbg') || name.includes('cannabinol') || name.includes('cbn') || name.includes('hemp') || name.includes('cannabis')) {
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 50, rmax: 70, note: 'Anti-inflamatuar ve yatıştırıcı' });
    mappings.push({ need_id: NEED.YAG_KONTROL, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Sebum düzenleme potansiyeli' });
  }
  // Growth Factors (FGF, IGF, KGF, VEGF, PDGF, TGF, EGF)
  if (name.includes('growth factor') || name.match(/^(fgf|igf|kgf|vegf|pdgf|tgf|egf)$/i) || name.includes('epidermal growth')) {
    mappings.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 60, rmax: 80, note: 'Hücre yenilenmesini destekler' });
    mappings.push({ need_id: NEED.BARIYER, effect_type: 'positive', rmin: 45, rmax: 65, note: 'Cilt onarım sürecini hızlandırır' });
  }
  // Licorice extract / glabridin / liquiritin
  if (name.includes('licorice')) {
    mappings.push({ need_id: NEED.LEKE, effect_type: 'positive', rmin: 60, rmax: 75, note: 'Tirozinaz inhibitörü' });
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Anti-inflamatuar etki' });
  }
  // Acetyl Glucosamine
  if (name.includes('acetyl glucosamine') || name.includes('glucosamine')) {
    mappings.push({ need_id: NEED.LEKE, effect_type: 'positive', rmin: 50, rmax: 65, note: 'Melanin transferini azaltır' });
    mappings.push({ need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Hyaluronik asit sentezini destekler' });
  }
  // Nicotinic Acid / Nicotinamide
  if (name.includes('nicotinic') || name.includes('nicotinamide')) {
    mappings.push({ need_id: NEED.SIVILCE, effect_type: 'positive', rmin: 65, rmax: 80, note: 'Sebum düzenleme ve anti-inflamatuar' });
    mappings.push({ need_id: NEED.LEKE, effect_type: 'positive', rmin: 60, rmax: 75, note: 'Melanin transferini azaltır' });
    mappings.push({ need_id: NEED.GOZENEK, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Gözenekleri sıkılaştırır' });
  }
  // Sytenol A (bakuchiol derivative)
  if (name.includes('sytenol')) {
    mappings.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 65, rmax: 80, note: 'Retinol alternatifi anti-aging' });
  }
  // Aminocaproic
  if (name.includes('aminocaproic')) {
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Anti-inflamatuar destek' });
  }
  // Copper Peptide
  if (name.includes('copper peptide')) {
    mappings.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 70, rmax: 85, note: 'Kolajen sentezini uyarır' });
    mappings.push({ need_id: NEED.BARIYER, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Cilt onarımını destekler' });
  }
  // Aloe (in active group)
  if (name.includes('aloe')) {
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Yatıştırıcı ve nemlendirici' });
    mappings.push({ need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Doğal nemlendirici' });
  }

  // If no specific match found for Active group, generic
  if (mappings.length === 0) {
    mappings.push({ need_id: NEED.BARIYER, effect_type: 'positive', rmin: 40, rmax: 60, note: 'Aktif bileşen, cilt sağlığını destekler' });
  }

  return mappings;
}

// =====================================================
// RARE BOTANICAL MAPPINGS
// =====================================================
function getRareBotanicalMappings(inciName) {
  const name = (inciName || '').toLowerCase();
  const mappings = [];

  // Rhodiola
  if (name.includes('rhodiola')) {
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 35, rmax: 50, note: 'Adaptojenik antioksidan' });
    mappings.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 30, rmax: 45, note: 'Stres kaynaklı yaşlanmayı azaltır' });
  }
  // Ashwagandha
  else if (name.includes('ashwagandha') || name.includes('withania')) {
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 35, rmax: 50, note: 'Adaptojenik antioksidan bitki' });
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 30, rmax: 45, note: 'Stres kaynaklı cilt sorunlarını yatıştırır' });
  }
  // Schisandra
  else if (name.includes('schisandra')) {
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 35, rmax: 50, note: 'Lignan bazlı antioksidan' });
  }
  // Astragalus
  else if (name.includes('astragalus')) {
    mappings.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 30, rmax: 45, note: 'Telomeraz aktivasyonu araştırmaları mevcut' });
  }
  // Bakuchiol / Psoralea
  else if (name.includes('bakuchiol') || name.includes('psoralea')) {
    mappings.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Retinol benzeri anti-aging etki' });
  }
  // Turmeric / Curcuma
  else if (name.includes('curcuma') || name.includes('turmeric')) {
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Kurkumin ile güçlü antioksidan' });
    mappings.push({ need_id: NEED.TON, effect_type: 'positive', rmin: 35, rmax: 50, note: 'Aydınlatıcı etki' });
  }
  // Ginseng
  else if (name.includes('panax') || name.includes('ginseng')) {
    mappings.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Anti-aging ginsenosidler içerir' });
  }
  // Generic rare botanical
  else {
    // Assign based on partial name patterns
    if (name.includes('root') || name.includes('bark')) {
      mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 30, rmax: 45, note: 'Geleneksel kullanımda antioksidan bitki' });
    } else if (name.includes('flower') || name.includes('blossom') || name.includes('petal')) {
      mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 30, rmax: 45, note: 'Geleneksel kullanımda yatıştırıcı çiçek özü' });
    } else if (name.includes('seed') || name.includes('oil') || name.includes('kernel')) {
      mappings.push({ need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 30, rmax: 45, note: 'Geleneksel kullanımda besleyici tohum/yağ' });
    } else if (name.includes('leaf') || name.includes('herb')) {
      mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 30, rmax: 45, note: 'Geleneksel kullanımda antioksidan bitki' });
    } else if (name.includes('berry') || name.includes('fruit')) {
      mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 30, rmax: 45, note: 'Geleneksel kullanımda antioksidan meyve özü' });
    } else {
      // Truly generic fallback
      mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 25, rmax: 40, note: 'Nadir botanik — geleneksel kullanımda faydalı' });
    }
  }

  return mappings;
}

// =====================================================
// VITAMIN-SPECIFIC MAPPINGS
// =====================================================
function getVitaminSpecificMappings(inciName) {
  const name = (inciName || '').toLowerCase();
  const extra = [];

  // Retinol / Retinoid family
  if (name.includes('retinol') || name.includes('retinyl') || name.includes('retinal') || name.includes('retinoate') || name.includes('retinoid')) {
    extra.push({ need_id: NEED.SIVILCE, effect_type: 'positive', rmin: 60, rmax: 80, note: 'Hücre yenilenmesini hızlandırarak sivilceyi azaltır' });
    extra.push({ need_id: NEED.LEKE, effect_type: 'positive', rmin: 55, rmax: 75, note: 'Hiperpigmentasyonu azaltır' });
    extra.push({ need_id: NEED.GOZENEK, effect_type: 'positive', rmin: 50, rmax: 70, note: 'Gözenekleri sıkılaştırır' });
  }

  // Vitamin C family
  if (name.includes('ascorb') || name.includes('ascorbyl') || name.includes('sodium ascorbate') || name.includes('magnesium ascorbyl')) {
    extra.push({ need_id: NEED.LEKE, effect_type: 'positive', rmin: 65, rmax: 85, note: 'Melanin sentezini inhibe eder' });
    extra.push({ need_id: NEED.GUNES, effect_type: 'positive', rmin: 40, rmax: 55, note: 'UV hasarına karşı ek koruma' });
  }

  // Niacinamide (B3)
  if (name.includes('niacinamide') || name.includes('nicotinamide')) {
    extra.push({ need_id: NEED.SIVILCE, effect_type: 'positive', rmin: 70, rmax: 85, note: 'Sebum düzenleme ve anti-inflamatuar' });
    extra.push({ need_id: NEED.LEKE, effect_type: 'positive', rmin: 60, rmax: 80, note: 'Melanin transferini azaltır' });
    extra.push({ need_id: NEED.GOZENEK, effect_type: 'positive', rmin: 60, rmax: 75, note: 'Gözenek sıkılaştırıcı' });
    extra.push({ need_id: NEED.BARIYER, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Seramid sentezini artırır' });
  }

  // Panthenol (B5)
  if (name.includes('panthenol') || name.includes('pantothenic') || name.includes('dexpanthenol')) {
    extra.push({ need_id: NEED.BARIYER, effect_type: 'positive', rmin: 60, rmax: 80, note: 'Bariyer onarımını hızlandırır' });
    extra.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Cildi yatıştırır ve nemlendirir' });
    extra.push({ need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Nem çekici ve tutucu' });
  }

  // Vitamin E / Tocopherol
  if (name.includes('tocopherol') || name.includes('tocotrienol') || name.includes('vitamin e')) {
    extra.push({ need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Koruyucu ve nemlendirici' });
    extra.push({ need_id: NEED.BARIYER, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Lipid bariyerini destekler' });
  }

  // Vitamin K
  if (name.includes('phytonadione') || name.includes('vitamin k') || name.includes('menaquinone') || name.includes('phylloquinone')) {
    extra.push({ need_id: NEED.TON, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Koyu halkaları ve kızarıklığı azaltır' });
  }

  // Coenzyme Q10 / Ubiquinone
  if (name.includes('ubiquinone') || name.includes('coenzyme q') || name.includes('idebenone')) {
    extra.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 60, rmax: 80, note: 'Hücresel enerji ve anti-aging' });
  }

  // Astaxanthin
  if (name.includes('astaxanthin')) {
    extra.push({ need_id: NEED.GUNES, effect_type: 'positive', rmin: 35, rmax: 50, note: 'UV hasarına karşı ek koruma' });
  }

  // Ferulic Acid
  if (name.includes('ferulic')) {
    extra.push({ need_id: NEED.GUNES, effect_type: 'positive', rmin: 45, rmax: 60, note: 'C ve E vitaminlerinin etkinliğini artırır' });
  }

  // Resveratrol
  if (name.includes('resveratrol')) {
    extra.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Sirtuin aktivasyonu ile anti-aging' });
  }

  return extra;
}

// =====================================================
// MINERAL SPECIFIC
// =====================================================
function getMineralSpecificMappings(inciName) {
  const name = (inciName || '').toLowerCase();
  const extra = [];

  if (name.includes('zinc')) {
    extra.push({ need_id: NEED.SIVILCE, effect_type: 'positive', rmin: 50, rmax: 65, note: 'Çinko anti-bakteriyel ve sebum düzenleyici' });
    extra.push({ need_id: NEED.YAG_KONTROL, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Yağlanmayı kontrol eder' });
  }
  if (name.includes('copper') || name.includes('cuprum')) {
    extra.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Bakır kolajen sentezini destekler' });
  }
  if (name.includes('selenium')) {
    extra.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 50, rmax: 65, note: 'Selenyum güçlü antioksidan mineral' });
  }
  if (name.includes('magnesium')) {
    extra.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 35, rmax: 50, note: 'Cildi rahatlatır' });
  }
  if (name.includes('sulfur') || name.includes('sulphur')) {
    extra.push({ need_id: NEED.SIVILCE, effect_type: 'positive', rmin: 50, rmax: 65, note: 'Kükürt antibakteriyel ve keratolik etki' });
  }
  if (name.includes('manganese')) {
    extra.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 40, rmax: 55, note: 'SOD enzimi için gerekli antioksidan mineral' });
  }

  return extra;
}

// =====================================================
// NULL GROUP HANDLING (ingredients 41-55 and similar)
// =====================================================
function getNullGroupMappings(inciName) {
  const name = (inciName || '').toLowerCase();
  const mappings = [];

  if (name.includes('ferulic')) {
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 70, rmax: 90, note: 'Güçlü antioksidan, C+E vitamini ile sinerjik' });
    mappings.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Foto-yaşlanmayı önler' });
  }
  if (name.includes('propolis')) {
    mappings.push({ need_id: NEED.SIVILCE, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Doğal antibakteriyel' });
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Anti-inflamatuar' });
  }
  if (name.includes('beta-glucan') || name.includes('glucan')) {
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 60, rmax: 80, note: 'Cildi yatıştırır ve bariyeri güçlendirir' });
    mappings.push({ need_id: NEED.BARIYER, effect_type: 'positive', rmin: 55, rmax: 75, note: 'Bariyer onarımını destekler' });
    mappings.push({ need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 50, rmax: 65, note: 'Nemlendirici ve koruyucu' });
  }
  if (name.includes('betaine salicylate')) {
    mappings.push({ need_id: NEED.SIVILCE, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Nazik BHA türevi' });
    mappings.push({ need_id: NEED.GOZENEK, effect_type: 'positive', rmin: 50, rmax: 65, note: 'Gözenek temizleme' });
  }
  if (name.includes('coenzyme q10') || name.includes('ubiquinone')) {
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 65, rmax: 80, note: 'Hücresel antioksidan' });
    mappings.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 60, rmax: 75, note: 'Hücre enerjisi ve anti-aging' });
  }
  if (name.includes('retinaldehyde')) {
    mappings.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 75, rmax: 90, note: 'Güçlü retinoid formu' });
    mappings.push({ need_id: NEED.SIVILCE, effect_type: 'positive', rmin: 60, rmax: 75, note: 'Hücre yenilenmesi ile sivilce kontrolü' });
    mappings.push({ need_id: NEED.LEKE, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Hiperpigmentasyon azaltma' });
  }
  if (name.includes('bifida ferment')) {
    mappings.push({ need_id: NEED.BARIYER, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Fermente probiyotik bariyer desteği' });
    mappings.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Hücre yenilenmesini destekler' });
  }
  if (name.includes('peptide complex')) {
    mappings.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 60, rmax: 80, note: 'Peptid kompleksi, anti-aging' });
    mappings.push({ need_id: NEED.BARIYER, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Bariyer desteği' });
  }
  if (name.includes('rice extract')) {
    mappings.push({ need_id: NEED.TON, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Aydınlatıcı pirinç özü' });
    mappings.push({ need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Amino asitlerle nemlendirme' });
  }
  if (name.includes('jojoba')) {
    mappings.push({ need_id: NEED.NEMLENDIRME, effect_type: 'positive', rmin: 50, rmax: 65, note: 'Sebuma benzer yapıda nemlendirici' });
    mappings.push({ need_id: NEED.YAG_KONTROL, effect_type: 'positive', rmin: 40, rmax: 55, note: 'Sebum dengesini sağlar' });
  }
  if (name.includes('guaiazulene')) {
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Anti-inflamatuar mavi pigment' });
  }
  if (name.includes('polyhydroxy acid') || name.includes('gluconolactone')) {
    mappings.push({ need_id: NEED.GOZENEK, effect_type: 'positive', rmin: 50, rmax: 65, note: 'Nazik PHA eksfoliasyonu' });
    mappings.push({ need_id: NEED.TON, effect_type: 'positive', rmin: 45, rmax: 60, note: 'Cilt tonunu eşitler' });
    mappings.push({ need_id: NEED.HASSASIYET, effect_type: 'positive', rmin: 40, rmax: 55, note: 'AHA\'ya göre daha nazik' });
  }
  if (name.includes('astaxanthin')) {
    mappings.push({ need_id: NEED.ANTIOKSIDAN, effect_type: 'positive', rmin: 75, rmax: 90, note: 'En güçlü karotenoid antioksidan' });
    mappings.push({ need_id: NEED.YASLANMA, effect_type: 'positive', rmin: 55, rmax: 70, note: 'Foto-yaşlanmayı önler' });
  }

  // Generic fallback for null group
  if (mappings.length === 0) {
    mappings.push({ need_id: NEED.BARIYER, effect_type: 'positive', rmin: 25, rmax: 40, note: 'Cilt bakımına katkı sağlayan bileşen' });
  }

  return mappings;
}

// =====================================================
// MAIN
// =====================================================
async function main() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  console.log('Connected to database.');

  // 1. Load existing mappings to avoid duplicates
  const existingRes = await client.query('SELECT ingredient_id, need_id FROM ingredient_need_mappings');
  const existingPairs = new Set(existingRes.rows.map(r => `${r.ingredient_id}_${r.need_id}`));
  console.log(`Existing mappings: ${existingPairs.size}`);

  // 2. Load all ingredients
  const ingredientsRes = await client.query('SELECT ingredient_id, inci_name, ingredient_group FROM ingredients ORDER BY ingredient_id');
  const ingredients = ingredientsRes.rows;
  console.log(`Total ingredients: ${ingredients.length}`);

  // 3. Generate mappings
  const allMappings = [];

  for (const ing of ingredients) {
    const { ingredient_id, inci_name, ingredient_group } = ing;
    let mappings = [];

    // Normalize group name for Turkish aliases
    const group = ingredient_group || null;

    if (group === 'Plant Extract' || group === 'Bitki Özütü') {
      mappings = getPlantExtractMappings(inci_name);
      // Set evidence level
      mappings.forEach(m => { if (!m.evidence_level) m.evidence_level = 'limited'; });

    } else if (group === 'Rare Botanical') {
      mappings = getRareBotanicalMappings(inci_name);
      mappings.forEach(m => { if (!m.evidence_level) m.evidence_level = 'traditional'; });

    } else if (group === 'Essential Oil') {
      // Base group mapping (caution_related to hassasiyet)
      mappings = getGroupMappings(group);
      // Add specific essential oil benefits
      const extras = getEssentialOilExtraMappings(inci_name);
      mappings = [...mappings, ...extras];
      mappings.forEach(m => { if (!m.evidence_level) m.evidence_level = 'limited'; });

    } else if (group === 'Active' || group === 'Aktif') {
      mappings = getActiveMappings(inci_name);
      mappings.forEach(m => { if (!m.evidence_level) m.evidence_level = 'moderate'; });

    } else if (group === 'Vitamin/Antioxidant' || group === 'Vitamin' || group === 'Antioksidan') {
      // Base group mapping
      mappings = getGroupMappings('Vitamin/Antioxidant');
      // Add specific vitamin benefits
      const extras = getVitaminSpecificMappings(inci_name);
      mappings = [...mappings, ...extras];
      mappings.forEach(m => { if (!m.evidence_level) m.evidence_level = 'strong'; });

    } else if (group === 'Mineral') {
      mappings = getGroupMappings('Mineral');
      const extras = getMineralSpecificMappings(inci_name);
      mappings = [...mappings, ...extras];
      mappings.forEach(m => { if (!m.evidence_level) m.evidence_level = 'moderate'; });

    } else if (group === null) {
      mappings = getNullGroupMappings(inci_name);
      mappings.forEach(m => { if (!m.evidence_level) m.evidence_level = 'moderate'; });

    } else {
      // All other groups use standard group-based mappings
      mappings = getGroupMappings(group);
      const ev = evidenceForGroup(group);
      mappings.forEach(m => { if (!m.evidence_level) m.evidence_level = ev; });
    }

    // Deduplicate need_ids within this ingredient (keep first occurrence)
    const seenNeeds = new Set();
    const uniqueMappings = [];
    for (const m of mappings) {
      if (!seenNeeds.has(m.need_id)) {
        seenNeeds.add(m.need_id);
        uniqueMappings.push(m);
      }
    }

    // Filter out already-existing pairs
    for (const m of uniqueMappings) {
      const key = `${ingredient_id}_${m.need_id}`;
      if (!existingPairs.has(key)) {
        allMappings.push({
          ingredient_id,
          need_id: m.need_id,
          relevance_score: rand(m.rmin, m.rmax),
          effect_type: m.effect_type,
          evidence_level: m.evidence_level || null,
          usage_context_note: m.note || null,
        });
        existingPairs.add(key); // Prevent duplicates within batch
      }
    }
  }

  console.log(`New mappings to insert: ${allMappings.length}`);

  // 4. Insert in batches of 200
  const BATCH_SIZE = 200;
  let inserted = 0;
  for (let i = 0; i < allMappings.length; i += BATCH_SIZE) {
    const batch = allMappings.slice(i, i + BATCH_SIZE);
    const values = [];
    const params = [];
    let paramIdx = 1;

    for (const m of batch) {
      values.push(`($${paramIdx}, $${paramIdx + 1}, $${paramIdx + 2}, $${paramIdx + 3}, $${paramIdx + 4}, $${paramIdx + 5})`);
      params.push(m.ingredient_id, m.need_id, m.relevance_score, m.effect_type, m.evidence_level, m.usage_context_note);
      paramIdx += 6;
    }

    const sql = `INSERT INTO ingredient_need_mappings (ingredient_id, need_id, relevance_score, effect_type, evidence_level, usage_context_note) VALUES ${values.join(', ')}`;
    await client.query(sql, params);
    inserted += batch.length;

    if (inserted % 1000 === 0 || inserted === allMappings.length) {
      console.log(`  Inserted ${inserted}/${allMappings.length}`);
    }
  }

  // 5. Final count
  const finalCount = await client.query('SELECT COUNT(*) FROM ingredient_need_mappings');
  console.log(`\n=== DONE ===`);
  console.log(`New mappings inserted: ${inserted}`);
  console.log(`Total mappings in DB: ${finalCount.rows[0].count}`);

  // Stats
  const stats = await client.query(`
    SELECT ingredient_group, COUNT(*) as cnt
    FROM ingredient_need_mappings m
    JOIN ingredients i ON m.ingredient_id = i.ingredient_id
    GROUP BY ingredient_group
    ORDER BY cnt DESC
  `);
  console.log(`\nMappings per group:`);
  stats.rows.forEach(r => console.log(`  ${r.ingredient_group || 'NULL'}: ${r.cnt}`));

  const avgMappings = await client.query(`
    SELECT ROUND(AVG(cnt), 1) as avg_mappings
    FROM (SELECT ingredient_id, COUNT(*) as cnt FROM ingredient_need_mappings GROUP BY ingredient_id) sub
  `);
  console.log(`\nAvg mappings per ingredient: ${avgMappings.rows[0].avg_mappings}`);

  const unmapped = await client.query(`
    SELECT COUNT(*) FROM ingredients i
    LEFT JOIN ingredient_need_mappings m ON i.ingredient_id = m.ingredient_id
    WHERE m.ingredient_need_mapping_id IS NULL
  `);
  console.log(`Unmapped ingredients: ${unmapped.rows[0].count}`);

  await client.end();
}

main().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
