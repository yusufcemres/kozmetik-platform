import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları',
  description: 'REVELA kullanım koşulları — platform kullanım kuralları, sorumluluk reddi ve fikri mülkiyet hakları.',
};

export default function TermsPage() {
  return (
    <div className="curator-section max-w-[1000px] mx-auto">
      <div className="text-center mb-16">
        <span className="label-caps text-outline block mb-4 tracking-[0.4em]">Yasal</span>
        <h1 className="text-4xl lg:text-5xl headline-tight text-on-surface">KULLANIM KOŞULLARI</h1>
        <p className="text-xs text-outline mt-4">Son güncelleme: Nisan 2026</p>
      </div>

      <div className="prose-custom space-y-8">
        <Section title="1. Genel">
          <p>
            Bu kullanım koşulları, REVELA platformunu (&quot;Platform&quot;) kullanan tüm ziyaretçiler
            ve kullanıcılar (&quot;Kullanıcı&quot;) için geçerlidir. Platformu kullanarak bu koşulları
            kabul etmiş sayılırsınız.
          </p>
        </Section>

        <Section title="2. Hizmet Tanımı">
          <p>
            REVELA, kozmetik ürünlerin INCI içeriklerini analiz eden ve cilt ihtiyaçlarına göre
            uyumluluk skoru hesaplayan bağımsız bir bilgi platformudur. Platform:
          </p>
          <ul className="list-disc ml-6 space-y-1 mt-2">
            <li>Tıbbi tavsiye niteliğinde değildir</li>
            <li>Dermatolojik teşhis veya tedavi sunmaz</li>
            <li>Ürün satışı yapmaz; yalnızca bilgi ve analiz sunar</li>
            <li>Üçüncü taraf e-ticaret platformlarına yönlendirme yapabilir</li>
          </ul>
        </Section>

        <Section title="3. Sorumluluk Reddi">
          <p>
            Platformda sunulan bilgiler genel bilgilendirme amaçlıdır. Cilt sorunlarınız için
            mutlaka bir dermatoloğa danışmanızı öneririz. REVELA:
          </p>
          <ul className="list-disc ml-6 space-y-1 mt-2">
            <li>Ürün bilgilerinin her zaman güncel ve eksiksiz olduğunu garanti etmez</li>
            <li>Skorlama sonuçlarının kişisel cilt tepkinizi kesin olarak yansıtacağını garanti etmez</li>
            <li>Üçüncü taraf sitelere yönlendirmelerden doğan sorunlardan sorumlu değildir</li>
            <li>Affiliate linkler üzerinden yapılan alışverişlerden komisyon alabilir</li>
          </ul>
        </Section>

        <Section title="4. Affiliate Bağlantılar">
          <p>
            Ürün sayfalarında yer alan satın alma bağlantıları affiliate (komisyon) linkleri
            içerebilir. Bu bağlantılar üzerinden yapılan alışverişlerden REVELA komisyon
            alabilir. Bu durum, ürün değerlendirmelerimizi ve skorlamamızı hiçbir şekilde
            etkilememektedir. Komisyon geliri platformun sürdürülebilirliği için kullanılmaktadır.
          </p>
        </Section>

        <Section title="5. Fikri Mülkiyet">
          <p>
            Platform üzerindeki tüm içerik (metin, tasarım, skorlama algoritması, veritabanı
            yapısı) REVELA&apos;ya aittir ve telif hakları ile korunmaktadır. İzinsiz kopyalama,
            dağıtma veya ticari amaçla kullanma yasaktır.
          </p>
        </Section>

        <Section title="6. Kullanıcı Yükümlülükleri">
          <ul className="list-disc ml-6 space-y-1">
            <li>Platformu yasal amaçlarla kullanmak</li>
            <li>Otomatik veri çekme (scraping) araçları kullanmamak</li>
            <li>Platformun işleyişini bozmaya yönelik girişimlerde bulunmamak</li>
            <li>Yanlış veya yanıltıcı bilgi bildirmemek</li>
          </ul>
        </Section>

        <Section title="7. Değişiklikler">
          <p>
            REVELA, bu kullanım koşullarını önceden haber vermeksizin güncelleme hakkını saklı
            tutar. Güncellemeler bu sayfada yayınlanır. Platformu kullanmaya devam etmeniz,
            güncellenmiş koşulları kabul ettiğiniz anlamına gelir.
          </p>
        </Section>

        <Section title="8. Uygulanacak Hukuk">
          <p>
            Bu kullanım koşulları Türkiye Cumhuriyeti hukukuna tabidir. Uyuşmazlıklarda
            Türkiye Cumhuriyeti mahkemeleri yetkilidir.
          </p>
        </Section>

        <Section title="9. İletişim">
          {/* TODO: revela.com.tr domain alındığında info@revela.com.tr'a güncelle */}
          <p>
            Kullanım koşullarıyla ilgili sorularınız için <strong>info@sololabstr.com</strong> adresine
            e-posta gönderebilirsiniz.
          </p>
        </Section>
      </div>

      <div className="text-center mt-12">
        <Link href="/gizlilik" className="curator-btn-outline text-xs px-6 py-3">
          Gizlilik Politikası
        </Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-on-surface mb-3">{title}</h2>
      <div className="text-sm text-on-surface-variant leading-relaxed">{children}</div>
    </section>
  );
}
