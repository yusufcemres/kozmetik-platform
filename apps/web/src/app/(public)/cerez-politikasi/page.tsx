import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Çerez Politikası',
  description: 'REVELA çerez kullanım politikası ve KVKK uyumlu çerez yönetimi.',
};

export default function CerezPolitikasiPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 prose prose-sm sm:prose-base">
      <span className="label-caps text-outline block mb-2 tracking-[0.3em]">Yasal</span>
      <h1 className="text-3xl sm:text-4xl headline-tight text-on-surface mb-2">Çerez Politikası</h1>
      <p className="text-on-surface-variant text-sm mb-8">Son güncelleme: 12 Nisan 2026</p>

      <section className="space-y-5 text-sm sm:text-base text-on-surface leading-relaxed">
        <div>
          <h2 className="text-lg font-bold mt-8 mb-2">Çerez Nedir?</h2>
          <p className="text-on-surface-variant">
            Çerezler, bir web sitesini ziyaret ettiğinde tarayıcına kaydedilen küçük metin dosyalarıdır.
            REVELA, deneyimini iyileştirmek ve siteyi analiz etmek için çerez kullanır.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold mt-8 mb-2">Kullandığımız Çerez Türleri</h2>
          <ul className="space-y-3 text-on-surface-variant">
            <li>
              <strong className="text-on-surface">Zorunlu çerezler:</strong> Sitenin çalışması için gerekli.
              Oturum yönetimi, güvenlik, tercih saklama. İzin gerektirmez.
            </li>
            <li>
              <strong className="text-on-surface">Analitik çerezler (opsiyonel):</strong> Google Analytics 4
              — ziyaretçi sayısı, hangi sayfalar daha popüler, hangi cihazlar kullanılıyor gibi anonim istatistikler.
              Sadece onay verdiğinde aktifleşir.
            </li>
            <li>
              <strong className="text-on-surface">İşlevsel çerezler:</strong> Favoriler, cilt profili, karşılaştırma
              listesi gibi kişisel tercihlerini cihazında saklar. localStorage tabanlı.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold mt-8 mb-2">KVKK Uyumluluğu</h2>
          <p className="text-on-surface-variant">
            6698 sayılı Kişisel Verilerin Korunması Kanunu ve Google Consent Mode v2 çerçevesinde,
            analitik ve pazarlama çerezleri <strong>varsayılan olarak kapalıdır</strong>. İlk ziyaretinde çıkan
            bannerdan açık rıza vermediğin sürece bu veriler toplanmaz.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold mt-8 mb-2">Tercihlerini Yönetme</h2>
          <p className="text-on-surface-variant">
            Onayını dilediğin zaman değiştirmek için tarayıcının site verilerini temizleyebilir ya da
            REVELA'ya tekrar giriş yaptığında banner üzerinden seçim yapabilirsin. Tarayıcı ayarlarından
            da çerezleri tamamen engelleyebilirsin — ancak bu durumda bazı özellikler çalışmayabilir.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold mt-8 mb-2">İletişim</h2>
          <p className="text-on-surface-variant">
            Çerezler veya kişisel veri işleme hakkında soruların için{' '}
            <a href="mailto:hello@revela.com.tr" className="underline">hello@revela.com.tr</a> adresinden
            bize ulaşabilirsin.
          </p>
        </div>
      </section>
    </article>
  );
}
