import * as bcrypt from 'bcrypt';
import dataSource from '../data-source';

async function seed() {
  const ds = await dataSource.initialize();
  console.log('Database connected for seeding...');

  try {
    // ===== EVIDENCE LEVELS =====
    await ds.query(`
      INSERT INTO evidence_levels (level_key, level_name, description, rank_order, badge_color, badge_emoji)
      VALUES
        ('systematic_review', 'Sistematik Derleme', 'Birden fazla çalışmanın meta-analizi', 1, '#22c55e', '🟢'),
        ('randomized_controlled', 'Randomize Kontrollü', 'Altın standart klinik çalışma', 2, '#22c55e', '🟢'),
        ('cohort_study', 'Kohort Çalışması', 'Gözlemsel takip çalışması', 3, '#eab308', '🟡'),
        ('case_control', 'Vaka Kontrol', 'Geriye dönük karşılaştırma', 4, '#eab308', '🟡'),
        ('expert_opinion', 'Uzman Görüşü', 'Dermatolojist/kimyager konsensüsü', 5, '#f97316', '🟠'),
        ('in_vitro', 'In Vitro', 'Laboratuvar ortamı çalışması', 6, '#f97316', '🟠'),
        ('traditional_use', 'Geleneksel Kullanım', 'Uzun süreli geleneksel deneyim', 7, '#3b82f6', '🔵'),
        ('anecdotal', 'Anekdot', 'Bireysel deneyim ve gözlem', 8, '#3b82f6', '🔵')
      ON CONFLICT (level_key) DO NOTHING
    `);
    console.log('  ✓ Evidence levels');

    // ===== ADMIN ROLES + USER =====
    await ds.query(`
      INSERT INTO admin_roles (role_key, role_name, description, permissions)
      VALUES
        ('super_admin', 'Süper Admin', 'Tüm yetkiler', '["*"]'),
        ('content_editor', 'İçerik Editörü', 'Makale ve ürün metinleri', '["articles.write","products.write","approved_wordings.write"]'),
        ('taxonomy_editor', 'Taksonomi Editörü', 'İçerik, ihtiyaç, kategori, marka CRUD', '["ingredients.write","needs.write","categories.write","brands.write"]'),
        ('reviewer', 'İnceleyici', 'Review ve publish onayı', '["*.review","*.publish"]'),
        ('methodology_reviewer', 'Metodoloji İnceleyici', 'Kanıt seviyesi ve ifade onayı', '["evidence_levels.write","approved_wordings.write"]')
      ON CONFLICT (role_key) DO NOTHING
    `);

    const passwordHash = await bcrypt.hash('SuperAdmin123!', 12);
    const roleResult = await ds.query(`SELECT role_id FROM admin_roles WHERE role_key = 'super_admin'`);
    if (roleResult.length > 0) {
      await ds.query(
        `INSERT INTO admin_users (email, password_hash, full_name, role_id) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING`,
        ['admin@kozmetik.com', passwordHash, 'Sistem Admin', roleResult[0].role_id],
      );
    }
    console.log('  ✓ Admin roles + user');

    // ===== CATEGORIES =====
    await ds.query(`
      INSERT INTO categories (category_name, category_slug, domain_type, sort_order) VALUES
        ('Yüz Bakım', 'yuz-bakim', 'cosmetic', 1),
        ('Temizleme', 'temizleme', 'cosmetic', 2),
        ('Güneş Koruma', 'gunes-koruma', 'cosmetic', 3),
        ('Göz Bakım', 'goz-bakim', 'cosmetic', 4),
        ('Dudak Bakım', 'dudak-bakim', 'cosmetic', 5),
        ('Vücut Bakım', 'vucut-bakim', 'cosmetic', 6),
        ('Saç Bakım', 'sac-bakim', 'cosmetic', 7),
        ('Makyaj', 'makyaj', 'cosmetic', 8)
      ON CONFLICT (category_slug) DO NOTHING
    `);
    console.log('  ✓ Categories');

    // ===== BRANDS =====
    await ds.query(`
      INSERT INTO brands (brand_name, brand_slug, country_of_origin) VALUES
        ('La Roche-Posay', 'la-roche-posay', 'Fransa'),
        ('CeraVe', 'cerave', 'ABD'),
        ('The Ordinary', 'the-ordinary', 'Kanada'),
        ('Bioderma', 'bioderma', 'Fransa'),
        ('Avene', 'avene', 'Fransa'),
        ('SVR', 'svr', 'Fransa'),
        ('Eucerin', 'eucerin', 'Almanya'),
        ('Neutrogena', 'neutrogena', 'ABD'),
        ('Vichy', 'vichy', 'Fransa'),
        ('Nuxe', 'nuxe', 'Fransa')
      ON CONFLICT (brand_slug) DO NOTHING
    `);
    console.log('  ✓ Brands');

    // ===== NEEDS =====
    await ds.query(`
      INSERT INTO needs (need_name, need_slug, need_group, short_description, user_friendly_label, domain_type) VALUES
        ('Sivilce / Akne', 'sivilce-akne', 'Cilt Sorunları', 'Sivilce ve akne eğilimli cilt bakımı', 'Sivilce ve akne eğilimli cilt', 'cosmetic'),
        ('Leke / Hiperpigmentasyon', 'leke-hiperpigmentasyon', 'Cilt Sorunları', 'Cilt lekesi ve ton eşitsizliği', 'Leke ve ton eşitsizliği', 'cosmetic'),
        ('Kırışıklık / Yaşlanma', 'kirisiklik-yaslanma', 'Cilt Sorunları', 'Kırışıklık ve erken yaşlanma belirtileri', 'Kırışıklık ve yaşlanma karşıtı', 'cosmetic'),
        ('Kuruluk / Dehidrasyon', 'kuruluk-dehidrasyon', 'Nem', 'Kuru ve dehidre cilt bakımı', 'Kuru ve susuz cilt', 'cosmetic'),
        ('Bariyer Desteği', 'bariyer-destegi', 'Bakım', 'Cilt bariyerini güçlendirme', 'Hassas ve tahriş olmuş cilt', 'cosmetic'),
        ('Gözenek Sıkılaştırma', 'gozenek-sikilastirma', 'Cilt Sorunları', 'Geniş gözenekleri sıkılaştırma', 'Geniş gözenekler', 'cosmetic'),
        ('Cilt Tonu Eşitleme', 'cilt-tonu-esitleme', 'Bakım', 'Cilt tonunu eşitleme ve aydınlatma', 'Solgun ve eşitsiz cilt tonu', 'cosmetic'),
        ('Güneş Koruması', 'gunes-korumasi', 'Koruma', 'UV ışınlarından koruma', 'Güneşten korunma', 'cosmetic'),
        ('Yağ Kontrolü', 'yag-kontrolu', 'Cilt Sorunları', 'Aşırı yağlanma kontrolü', 'Yağlı ve parlak cilt', 'cosmetic'),
        ('Nemlendirme', 'nemlendirme', 'Nem', 'Cilde nem takviyesi', 'Nem ihtiyacı olan cilt', 'cosmetic'),
        ('Hassasiyet', 'hassasiyet', 'Bakım', 'Hassas cilt bakımı', 'Hassas ve reaktif cilt', 'cosmetic'),
        ('Anti-Oksidan Koruma', 'anti-oksidan-koruma', 'Koruma', 'Serbest radikal hasarına karşı koruma', 'Çevresel etkenlerden koruma', 'cosmetic')
      ON CONFLICT (need_slug) DO NOTHING
    `);
    console.log('  ✓ Needs');

    // ===== INGREDIENTS =====
    await ds.query(`
      INSERT INTO ingredients (inci_name, common_name, ingredient_slug, ingredient_group, origin_type, function_summary, evidence_level, allergen_flag, fragrance_flag, preservative_flag) VALUES
        ('Niacinamide', 'Niasinamid (B3 Vitamini)', 'niacinamide', 'Vitamin', 'synthetic', 'Gözenek sıkılaştırıcı, leke giderici, bariyer güçlendirici. Hemen her cilt tipine uygun çok yönlü aktif.', 'randomized_controlled', false, false, false),
        ('Retinol', 'Retinol (A Vitamini)', 'retinol', 'Vitamin', 'synthetic', 'Anti-aging altın standardı. Kırışıklık, leke ve akne üzerinde güçlü etki. Gece kullanımı gerektirir.', 'systematic_review', false, false, false),
        ('Hyaluronic Acid', 'Hyaluronik Asit', 'hyaluronic-acid', 'Nemlendirici', 'biotech', 'Kendi ağırlığının 1000 katı su tutan nemlendirici. Tüm cilt tipleri için uygun.', 'randomized_controlled', false, false, false),
        ('Salicylic Acid', 'Salisilik Asit', 'salicylic-acid', 'BHA', 'synthetic', 'Yağda çözünür eksfoliyant. Gözeneklerin derinlerine ulaşarak sivilce oluşumunu engeller.', 'randomized_controlled', false, false, false),
        ('Glycolic Acid', 'Glikolik Asit', 'glycolic-acid', 'AHA', 'synthetic', 'En küçük AHA molekülü. Ölü hücreleri arındırarak cilt yenilenmesini hızlandırır.', 'randomized_controlled', false, false, false),
        ('Ceramide NP', 'Seramid NP', 'ceramide-np', 'Lipid', 'synthetic', 'Cilt bariyerinin temel yapı taşı. Nem kaybını önler ve bariyeri onarır.', 'cohort_study', false, false, false),
        ('Ascorbic Acid', 'C Vitamini', 'ascorbic-acid', 'Vitamin', 'synthetic', 'Güçlü antioksidan. Leke giderici, kolajen sentezini destekler.', 'systematic_review', false, false, false),
        ('Panthenol', 'Panthenol (B5 Vitamini)', 'panthenol', 'Vitamin', 'synthetic', 'Yatıştırıcı ve nemlendirici. Cilt bariyerini güçlendirir.', 'randomized_controlled', false, false, false),
        ('Zinc PCA', 'Çinko PCA', 'zinc-pca', 'Mineral', 'synthetic', 'Sebum düzenleyici, anti-bakteriyel. Yağlı ve akne eğilimli cilde uygun.', 'cohort_study', false, false, false),
        ('Tocopherol', 'E Vitamini', 'tocopherol', 'Vitamin', 'natural', 'Güçlü antioksidan, nemlendirici ve iyileştirici.', 'systematic_review', false, false, false),
        ('Centella Asiatica Extract', 'Centella Asiatica Özütü', 'centella-asiatica-extract', 'Bitki Özütü', 'natural', 'Yatıştırıcı, iyileştirici, bariyer güçlendirici. Hassas ciltlere özel.', 'cohort_study', false, false, false),
        ('Glycerin', 'Gliserin', 'glycerin', 'Nemlendirici', 'synthetic', 'Temel nemlendirici humektant. Havadan nem çeker ve ciltte tutar.', 'systematic_review', false, false, false),
        ('Azelaic Acid', 'Azelaik Asit', 'azelaic-acid', 'Aktif', 'synthetic', 'Sivilce, leke ve rozasea için etkili. Antienflamatuar ve antibakteriyel.', 'randomized_controlled', false, false, false),
        ('Squalane', 'Skualan', 'squalane', 'Emoliyan', 'biotech', 'Cildin doğal yağına benzeyen hafif emoliyan. Gözenekleri tıkamaz.', 'expert_opinion', false, false, false),
        ('Allantoin', 'Allantoin', 'allantoin', 'Yatıştırıcı', 'synthetic', 'Cilt yatıştırıcı ve yumuşatıcı. Tahrişi azaltır.', 'cohort_study', false, false, false),
        ('Lactic Acid', 'Laktik Asit', 'lactic-acid', 'AHA', 'biotech', 'Hassas ciltler için uygun yumuşak AHA. Hem eksfoliye eder hem nemlendirir.', 'randomized_controlled', false, false, false),
        ('Madecassoside', 'Madesassosid', 'madecassoside', 'Bitki Özütü', 'natural', 'Centella türevi. Güçlü yatıştırıcı ve onarıcı.', 'cohort_study', false, false, false),
        ('Sodium Hyaluronate', 'Sodyum Hyaluronat', 'sodium-hyaluronate', 'Nemlendirici', 'biotech', 'Hyaluronik asidin tuzu. Daha küçük molekül, daha derin penetrasyon.', 'randomized_controlled', false, false, false),
        ('Urea', 'Üre', 'urea', 'Nemlendirici', 'synthetic', 'Güçlü humektant ve hafif keratolotik. Ekstra kuru ciltler için ideal.', 'systematic_review', false, false, false),
        ('Bakuchiol', 'Bakuchiol', 'bakuchiol', 'Bitki Özütü', 'natural', 'Retinol alternatifi bitkisel aktif. Hamilelikte de kullanılabilir.', 'randomized_controlled', false, false, false),
        ('Aqua', 'Su', 'aqua', 'Çözücü', 'natural', 'Tüm kozmetik formülasyonların temel çözücüsü.', 'expert_opinion', false, false, false),
        ('Parfum', 'Parfüm', 'parfum', 'Koku', 'synthetic', 'Ürüne koku veren bileşen karışımı. Hassas ciltler için tahriş riski taşır.', 'expert_opinion', true, true, false),
        ('Phenoxyethanol', 'Fenoksietanol', 'phenoxyethanol', 'Koruyucu', 'synthetic', 'Yaygın kullanılan koruyucu. Paraben alternatifi.', 'expert_opinion', false, false, true),
        ('Butylene Glycol', 'Butilen Glikol', 'butylene-glycol', 'Nemlendirici', 'synthetic', 'Hafif nemlendirici ve çözücü. Aktif maddelerin penetrasyonunu artırır.', 'expert_opinion', false, false, false),
        ('Dimethicone', 'Dimetikon', 'dimethicone', 'Silikon', 'synthetic', 'Cilt yüzeyini yumuşatan ve koruyan silikon. Tıkayıcı değildir.', 'expert_opinion', false, false, false)
      ON CONFLICT (ingredient_slug) DO NOTHING
    `);
    console.log('  ✓ Ingredients (25)');

    // ===== INGREDIENT ALIASES =====
    await ds.query(`
      INSERT INTO ingredient_aliases (ingredient_id, alias_name, language, alias_type)
      SELECT i.ingredient_id, a.alias_name, a.language, a.alias_type
      FROM (VALUES
        ('niacinamide', 'Vitamin B3', 'tr', 'common'),
        ('niacinamide', 'Nikotinamid', 'tr', 'common'),
        ('retinol', 'A Vitamini', 'tr', 'common'),
        ('hyaluronic-acid', 'HA', 'en', 'abbreviation'),
        ('hyaluronic-acid', 'Hyaluronik Asit', 'tr', 'common'),
        ('salicylic-acid', 'BHA', 'en', 'abbreviation'),
        ('salicylic-acid', 'Salisilik Asit', 'tr', 'common'),
        ('glycolic-acid', 'AHA', 'en', 'abbreviation'),
        ('ascorbic-acid', 'C Vitamini', 'tr', 'common'),
        ('ascorbic-acid', 'L-Ascorbic Acid', 'en', 'inci'),
        ('panthenol', 'Dekspantenol', 'tr', 'common'),
        ('panthenol', 'Provitamin B5', 'en', 'common'),
        ('centella-asiatica-extract', 'Cica', 'en', 'common'),
        ('centella-asiatica-extract', 'Tiger Grass', 'en', 'common'),
        ('glycerin', 'Gliserin', 'tr', 'common'),
        ('tocopherol', 'E Vitamini', 'tr', 'common'),
        ('ceramide-np', 'Seramid', 'tr', 'common'),
        ('squalane', 'Skualen', 'tr', 'common'),
        ('azelaic-acid', 'Azelaik Asit', 'tr', 'common')
      ) AS a(slug, alias_name, language, alias_type)
      JOIN ingredients i ON i.ingredient_slug = a.slug
      ON CONFLICT DO NOTHING
    `);
    console.log('  ✓ Ingredient aliases');

    // ===== APPROVED WORDINGS =====
    await ds.query(`
      INSERT INTO approved_wordings (category, approved_text, forbidden_alternative, usage_note) VALUES
        ('nemlendirme', 'Cildi nemlendirmeye yardımcı olur', 'Cildi sonsuza kadar nemlendirir', 'Kesin ifadelerden kaçının'),
        ('nemlendirme', 'Nem dengesini korumaya destek olur', 'Kuruluğu tamamen ortadan kaldırır', NULL),
        ('anti-aging', 'Kırışıklık görünümünü azaltmaya yardımcı olur', 'Kırışıklıkları yok eder', 'Kozmetik ürünler tedavi etmez'),
        ('anti-aging', 'Yaşlanma belirtilerinin görünümünü iyileştirmeye destek olur', '10 yaş gençleştirir', NULL),
        ('sivilce', 'Sivilce eğilimli ciltler için formüle edilmiştir', 'Sivilceleri tedavi eder', 'Tedavi ifadesi tıbbi üründür'),
        ('sivilce', 'Gözeneklerin tıkanmasını azaltmaya yardımcı olur', 'Sivilceleri kesin çözüm', NULL),
        ('leke', 'Cilt tonunun eşitlenmesine yardımcı olur', 'Lekeleri siler', 'Silmek ifadesi yanıltıcı'),
        ('leke', 'Koyu leke görünümünü azaltmaya destek olur', 'Lekeleri tedavi eder', NULL),
        ('bariyer', 'Cilt bariyerini güçlendirmeye yardımcı olur', 'Cilt bariyerini onarır', 'Onarım ifadesi tıbbi'),
        ('hassasiyet', 'Hassas ciltler için uygunluğu test edilmiştir', 'Alerji yapmaz', '%100 garanti verilemez'),
        ('genel', 'İçerdiği [aktif] sayesinde [fayda] sağlamaya yardımcı olur', '[Aktif] sayesinde kesinlikle [fayda] sağlar', 'Kesinlik belirten ifadelerden kaçının'),
        ('genel', 'Dermatolojik olarak test edilmiştir', 'Doktor onaylıdır', 'Onay ile test farklı kavramlar'),
        ('güneş', 'SPF koruma faktörlü', 'Güneşten %100 korur', '%100 koruma mümkün değil'),
        ('parfüm', 'Parfüm içermez', 'Hipoalerjenik', 'Hipoalerjenik düzenlenmiş bir terim değil'),
        ('doğal', 'Doğal kaynaklı içerikler ile formüle edilmiştir', '%100 doğal', '%100 doğal formülasyon neredeyse imkansız')
      ON CONFLICT DO NOTHING
    `);
    console.log('  ✓ Approved wordings');

    // ===== SCORING CONFIGS =====
    await ds.query(`
      INSERT INTO scoring_configs (config_key, config_value, description, config_group) VALUES
        ('rank_weight_need_compat', 0.500, 'ProductRankScore: Need uyumu ağırlığı', 'scoring'),
        ('rank_weight_strength', 0.200, 'ProductRankScore: Ingredient gücü ağırlığı', 'scoring'),
        ('rank_weight_label', 0.150, 'ProductRankScore: Etiket tutarlılığı ağırlığı', 'scoring'),
        ('rank_weight_completeness', 0.150, 'ProductRankScore: İçerik tamlığı ağırlığı', 'scoring'),
        ('penalty_fragrance', 0.600, 'Hassasiyet cezası: Parfüm', 'sensitivity'),
        ('penalty_alcohol', 0.700, 'Hassasiyet cezası: Alkol', 'sensitivity'),
        ('penalty_paraben', 0.800, 'Hassasiyet cezası: Paraben', 'sensitivity'),
        ('penalty_essential_oils', 0.750, 'Hassasiyet cezası: Esansiyel yağ', 'sensitivity')
      ON CONFLICT (config_key) DO NOTHING
    `);
    console.log('  ✓ Scoring configs');

    // ===== SAMPLE SKIN PROFILES =====
    await ds.query(`
      INSERT INTO user_skin_profiles (anonymous_id, skin_type, concerns, sensitivities, age_range) VALUES
        ('demo-profile-1', 'oily', '[1, 6, 9]', '{"fragrance": true, "alcohol": false, "paraben": false, "essential_oils": false}', '25-34'),
        ('demo-profile-2', 'dry', '[4, 5, 10]', '{"fragrance": false, "alcohol": true, "paraben": false, "essential_oils": false}', '35-44'),
        ('demo-profile-3', 'combination', '[2, 3, 7]', '{"fragrance": true, "alcohol": false, "paraben": true, "essential_oils": false}', '25-34')
      ON CONFLICT (anonymous_id) DO NOTHING
    `);
    console.log('  ✓ Sample skin profiles');

    // ===== SUPPLEMENT CATEGORIES + NEEDS =====
    await ds.query(`
      INSERT INTO categories (category_name, category_slug, domain_type, sort_order) VALUES
        ('Vitamin & Mineral', 'vitamin-mineral', 'supplement', 10),
        ('Probiyotik', 'probiyotik', 'supplement', 11),
        ('Bitkisel Takviye', 'bitkisel-takviye', 'supplement', 12),
        ('Omega & Yağ Asitleri', 'omega-yag-asitleri', 'supplement', 13)
      ON CONFLICT (category_slug) DO NOTHING
    `);
    await ds.query(`
      INSERT INTO needs (need_name, need_slug, need_group, short_description, user_friendly_label, domain_type) VALUES
        ('Enerji & Canlılık', 'enerji-canlilik', 'Genel Sağlık', 'Enerji düzeyini artırmaya destek', 'Enerji ve canlılık desteği', 'supplement'),
        ('Bağışıklık Desteği', 'bagisiklik-destegi', 'Genel Sağlık', 'Bağışıklık sistemini destekleme', 'Bağışıklık güçlendirme', 'supplement'),
        ('Sindirim Sağlığı', 'sindirim-sagligi', 'Sindirim', 'Sindirim sistemi dengesini koruma', 'Sindirim düzeni desteği', 'supplement'),
        ('Kemik & Eklem', 'kemik-eklem', 'Kas-İskelet', 'Kemik ve eklem sağlığını destekleme', 'Kemik ve eklem güçlendirme', 'supplement')
      ON CONFLICT (need_slug) DO NOTHING
    `);
    console.log('  ✓ Supplement categories + needs');

    // ===== INGREDIENT INTERACTIONS =====
    await ds.query(`
      INSERT INTO ingredient_interactions (ingredient_a_id, ingredient_b_id, severity, domain_type, interaction_context, description, recommendation)
      SELECT a.ingredient_id, b.ingredient_id, v.severity, v.domain_type, 'ingredient', v.description, v.recommendation
      FROM (VALUES
        ('retinol', 'glycolic-acid', 'moderate', 'cosmetic', 'Retinol ve AHA birlikte kullanılmamalı — aşırı tahriş ve bariyer hasarı riski', 'Farklı günlerde veya sabah/akşam ayrı kullanın'),
        ('retinol', 'salicylic-acid', 'mild', 'cosmetic', 'Retinol ve BHA birlikte dikkatli kullanılmalı', 'Cildiniz tolere ediyorsa kullanabilirsiniz, aksi halde farklı günlere ayırın'),
        ('retinol', 'ascorbic-acid', 'mild', 'cosmetic', 'Retinol ve C vitamini birlikte etkisizleşebilir', 'C vitamini sabah, retinol akşam kullanın'),
        ('glycolic-acid', 'salicylic-acid', 'moderate', 'cosmetic', 'AHA ve BHA birlikte aşırı eksfoliasyona neden olabilir', 'Aynı anda kullanmayın, farklı günlere ayırın'),
        ('niacinamide', 'ascorbic-acid', 'mild', 'cosmetic', 'Birlikte flush (kızarıklık) riski — eski bilgi, modern formüllerde sorun yok', 'Modern formülasyonlarda birlikte kullanılabilir'),
        ('ceramide-np', 'hyaluronic-acid', 'none', 'cosmetic', 'Birlikte mükemmel çalışır — ceramide bariyeri güçlendirir, HA nemi çeker', 'Birlikte kullanımı önerilir')
      ) AS v(slug_a, slug_b, severity, domain_type, description, recommendation)
      JOIN ingredients a ON a.ingredient_slug = v.slug_a
      JOIN ingredients b ON b.ingredient_slug = v.slug_b
      ON CONFLICT DO NOTHING
    `);
    console.log('  ✓ Ingredient interactions');

    console.log('\nSeed completed successfully!');
    console.log('Admin login: admin@kozmetik.com / SuperAdmin123!');
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  } finally {
    await ds.destroy();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
