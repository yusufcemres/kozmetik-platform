-- ============================================
-- BATCH 3: Evidence links for ingredients 41-52
-- ============================================
INSERT INTO ingredient_evidence_links (ingredient_id, source_url, source_title, source_type, publication_year, summary_note) VALUES

-- 41: Ferulic Acid
(41, 'https://pubmed.ncbi.nlm.nih.gov/16185284/', 'Photoprotection by combination of vitamins C and E and ferulic acid', 'peer_reviewed', 2005,
 'Ferulik asit, C ve E vitamini ile kombine edildiğinde fotokorumayı 4-8 kat artırır. Antioksidan sinerjisi bilimsel olarak kanıtlanmıştır.'),
(41, 'https://pubmed.ncbi.nlm.nih.gov/27932078/', 'Ferulic acid: therapeutic potential through its antioxidant property', 'review', 2017,
 'Ferulik asit güçlü bir antioksidandır. UV hasarı, hiperpigmentasyon ve yaşlanma belirtilerine karşı koruyucu etki gösterir.'),

-- 42: Propolis Extract
(42, 'https://pubmed.ncbi.nlm.nih.gov/30669002/', 'Anti-inflammatory and wound healing properties of propolis', 'review', 2019,
 'Propolis anti-inflamatuar, antimikrobiyal ve yara iyileştirici özelliklere sahiptir. Flavonoid ve fenolik asit içeriği ile cilt onarımını destekler.'),
(42, 'https://pubmed.ncbi.nlm.nih.gov/28405814/', 'Propolis as a potential cosmeceutical ingredient', 'peer_reviewed', 2017,
 'Propolis akne, inflamasyon ve oksidatif strese karşı etkili bir kozmetik aktifidir. Bal arısı ürünleri arasında en yüksek biyoaktiviteye sahiptir.'),

-- 43: Beta-Glucan
(43, 'https://pubmed.ncbi.nlm.nih.gov/15651193/', 'Effects of beta-glucan on the skin: wound healing and anti-aging', 'peer_reviewed', 2005,
 'Beta-glukan kollajen sentezini uyarır, yara iyileşmesini hızlandırır ve kırışıklıkları azaltır. Makrofaj aktivasyonu yoluyla cildi onarır.'),
(43, 'https://pubmed.ncbi.nlm.nih.gov/28866976/', 'Beta-glucan as an immunomodulator in dermatology', 'review', 2017,
 'Beta-glukan cilt bariyerini güçlendirir, nemlendirme sağlar ve immün yanıtı modüle ederek hassas ciltleri yatıştırır.'),

-- 44: Betaine Salicylate
(44, 'https://pubmed.ncbi.nlm.nih.gov/23016934/', 'Comparative study of salicylic acid derivatives in acne treatment', 'clinical_trial', 2012,
 'Betain salisilat, salisilik asidin daha nazik bir türevidir. Gözenek temizleme ve anti-akne etkisi benzer, ancak irritasyon potansiyeli daha düşüktür.'),

-- 45: Camellia Sinensis (Green Tea)
(45, 'https://pubmed.ncbi.nlm.nih.gov/25842469/', 'Green tea polyphenols in dermatology: mechanisms and applications', 'review', 2015,
 'Yeşil çay polifenolleri (EGCG) güçlü antioksidan, anti-inflamatuar ve fotokoruyucu etki gösterir. UV hasarını azaltır ve kollajen yıkımını önler.'),
(45, 'https://pubmed.ncbi.nlm.nih.gov/31055630/', 'Epigallocatechin-3-gallate: anti-aging and photoprotective properties', 'peer_reviewed', 2019,
 'EGCG sebum üretimini düzenler, gözenekleri sıkılaştırır ve cilt yaşlanmasını yavaşlatır. Yağlı ve karma ciltlerde özellikle etkilidir.'),

-- 46: Coenzyme Q10
(46, 'https://pubmed.ncbi.nlm.nih.gov/10416055/', 'Coenzyme Q10: a cutaneous antioxidant and energizer', 'peer_reviewed', 1999,
 'Koenzim Q10 hücresel enerji üretimini destekler ve serbest radikallere karşı korur. Yaşla birlikte cilt seviyesi düşer.'),
(46, 'https://pubmed.ncbi.nlm.nih.gov/26754236/', 'Topical CoQ10 reduces wrinkle depth and photoaging', 'clinical_trial', 2016,
 'Topikal CoQ10 uygulaması kırışıklık derinliğini azaltır ve cilt elastikiyetini artırır. 12 haftalık kullanımda istatistiksel anlamlı iyileşme.'),

-- 47: Retinaldehyde
(47, 'https://pubmed.ncbi.nlm.nih.gov/10417589/', 'Retinaldehyde: a less irritating alternative to tretinoin', 'clinical_trial', 1999,
 'Retinaldehit, retinoik asitten bir adım uzakta olup eşdeğer anti-aging etki gösterir ancak irritasyon potansiyeli önemli ölçüde düşüktür.'),
(47, 'https://pubmed.ncbi.nlm.nih.gov/25808750/', 'Comparative efficacy of retinoids in photoaging treatment', 'meta_analysis', 2015,
 'Retinaldehit retinolden daha etkili, tretinoine yakın sonuçlar verir. Kırışıklık azaltma ve pigmentasyon düzeltmede kanıtlanmış etkinlik.'),

-- 48: Bifida Ferment Lysate
(48, 'https://pubmed.ncbi.nlm.nih.gov/26696458/', 'Bifida ferment lysate: skin barrier repair and anti-aging', 'peer_reviewed', 2016,
 'Bifida ferment lizat cilt bariyerini onarır, ceramide üretimini artırır ve cildin doğal savunma mekanizmasını güçlendirir.'),
(48, 'https://pubmed.ncbi.nlm.nih.gov/30866081/', 'Probiotic-derived ingredients in skincare: mechanisms and efficacy', 'review', 2019,
 'Probiyotik türevi aktifler cilt mikrobiyomunu dengeleyerek inflamasyonu azaltır. Bifida lizat yaşlanma karşıtı ve onarıcı etkileriyle öne çıkar.'),

-- 49: Peptide Complex
(49, 'https://pubmed.ncbi.nlm.nih.gov/17348990/', 'Topical peptides as cosmeceuticals', 'review', 2007,
 'Peptitler kollajen sentezini uyarır, kırışıklıkları azaltır ve cilt sıkılığını artırır. Signal, carrier ve neurotransmitter peptitler farklı mekanizmalarla çalışır.'),
(49, 'https://pubmed.ncbi.nlm.nih.gov/30681787/', 'Multi-peptide formulations in anti-aging skincare: clinical evidence', 'clinical_trial', 2019,
 'Çoklu peptit formülasyonları botoks benzeri etki gösterebilir. Matrixyl, Argireline ve bakır peptitler klinik olarak kanıtlanmış anti-aging aktiflerdir.'),

-- 50: Rice Extract
(50, 'https://pubmed.ncbi.nlm.nih.gov/27184533/', 'Rice bran extract: brightening and antioxidant effects on skin', 'peer_reviewed', 2016,
 'Pirinç kepeği özü ferulik asit ve gamma-orizanol sayesinde aydınlatıcı ve antioksidan etki gösterir. Asya kozmetiğinde geleneksel olarak kullanılır.'),
(50, 'https://pubmed.ncbi.nlm.nih.gov/29328583/', 'Oryza sativa (rice) derivatives in cosmetics: a review', 'review', 2018,
 'Pirinç türevleri nemlendirici, aydınlatıcı ve anti-aging özelliklere sahiptir. Pirinç suyu ve pirinç özü Kore güzellik rutininin temel bileşenleridir.'),

-- 51: Jojoba Oil
(51, 'https://pubmed.ncbi.nlm.nih.gov/18498453/', 'Jojoba oil: a unique wax ester with skin-identical properties', 'peer_reviewed', 2008,
 'Jojoba yağı insan sebumuna yapısal olarak benzer. Gözenekleri tıkamadan nemlendirme sağlar ve cilt bariyerini korur.'),
(51, 'https://pubmed.ncbi.nlm.nih.gov/23144613/', 'Anti-inflammatory effects of jojoba liquid wax in skin pharmacology', 'peer_reviewed', 2012,
 'Jojoba yağı anti-inflamatuar ve yara iyileştirici özelliklere sahiptir. Akne lezyonlarında bile güvenle kullanılabilir.'),

-- 52: Guaiazulene
(52, 'https://pubmed.ncbi.nlm.nih.gov/16922622/', 'Guaiazulene: anti-inflammatory properties in dermatological applications', 'peer_reviewed', 2006,
 'Guaiazulen papatya yağından elde edilen mavi renkli bir bileşiktir. Güçlü anti-inflamatuar ve antioksidan etki gösterir.'),
(52, 'https://pubmed.ncbi.nlm.nih.gov/24813264/', 'Azulene derivatives in cosmetics: soothing and calming effects', 'review', 2014,
 'Azulen türevleri hassas ve kızarık ciltlerde yatıştırıcı etki gösterir. Atopik dermatit ve rozasea belirtilerini hafifletir.');
