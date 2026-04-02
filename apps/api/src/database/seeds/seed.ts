import dataSource from '../data-source';

async function seed() {
  const ds = await dataSource.initialize();
  console.log('Database connected for seeding...');

  try {
    // Seed will be populated in Prompt 14
    // For now, just verify connection works

    // Evidence levels
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

    // Admin roles
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

    console.log('Seed completed successfully!');
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
