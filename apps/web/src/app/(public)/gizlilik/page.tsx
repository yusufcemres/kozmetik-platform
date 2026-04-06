import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası',
  description: 'REVELA gizlilik politikası — kişisel verilerinizin korunması, KVKK uyumu ve çerez politikası.',
};

export default function PrivacyPage() {
  return (
    <div className="curator-section max-w-[1000px] mx-auto">
      <div className="text-center mb-16">
        <span className="label-caps text-outline block mb-4 tracking-[0.4em]">Yasal</span>
        <h1 className="text-4xl lg:text-5xl headline-tight text-on-surface">GİZLİLİK POLİTİKASI</h1>
        <p className="text-xs text-outline mt-4">Son güncelleme: Nisan 2026</p>
      </div>

      <div className="prose-custom space-y-8">
        <Section title="1. Veri Sorumlusu">
          <p>
            REVELA (&quot;Platform&quot;), kozmetik ürünlerin içerik analizini sunan bağımsız bir web platformudur.
            Bu gizlilik politikası, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında
            kişisel verilerinizin nasıl toplandığını, işlendiğini ve korunduğunu açıklamaktadır.
          </p>
        </Section>

        <Section title="2. Toplanan Veriler">
          <p>Platform üzerinde aşağıdaki veriler toplanabilir:</p>
          <ul className="list-disc ml-6 space-y-1 mt-2">
            <li><strong>Cilt Profili Verileri:</strong> Cilt analizi sırasında girdiğiniz cilt tipi, yaş aralığı, hassasiyetler ve ihtiyaçlar. Bu veriler yalnızca tarayıcınızda (localStorage) saklanır ve sunucularımıza gönderilmez.</li>
            <li><strong>Favori Listeleri:</strong> Favorilediğiniz ürünler tarayıcınızda yerel olarak saklanır.</li>
            <li><strong>Analitik Veriler:</strong> Sayfa görüntüleme, tıklama ve gezinme verileri anonim olarak toplanabilir (Google Analytics).</li>
            <li><strong>Teknik Veriler:</strong> IP adresi (hash&apos;lenmiş), tarayıcı bilgisi, cihaz türü — sunucu günlüklerinde geçici olarak tutulur.</li>
          </ul>
        </Section>

        <Section title="3. Verilerin İşlenme Amacı">
          <ul className="list-disc ml-6 space-y-1">
            <li>Kişiselleştirilmiş ürün uyumluluk skoru hesaplama</li>
            <li>Platform performansının iyileştirilmesi</li>
            <li>Affiliate tıklama istatistikleri (anonim)</li>
            <li>Hizmet kalitesinin artırılması</li>
          </ul>
        </Section>

        <Section title="4. Veri Saklama ve Güvenlik">
          <p>
            Cilt profili ve favori verileri yalnızca tarayıcınızda saklanır; sunucularımıza aktarılmaz.
            Sunucu tarafında tutulan veriler (affiliate tıklamaları, fiyat alarmları) şifrelenmiş
            veritabanında saklanır. IP adresleri SHA-256 ile hash&apos;lenir ve geriye dönük olarak
            kişiye bağlanamaz.
          </p>
        </Section>

        <Section title="5. Çerezler">
          <p>
            Platform, temel işlevsellik için birinci taraf çerezleri kullanır. Analitik amaçlı
            üçüncü taraf çerezleri (Google Analytics) kullanılabilir. Tarayıcı ayarlarınızdan
            çerezleri devre dışı bırakabilirsiniz.
          </p>
        </Section>

        <Section title="6. Üçüncü Taraf Paylaşımı">
          <p>
            Kişisel verileriniz üçüncü taraflarla paylaşılmaz. Affiliate linklere tıkladığınızda,
            ilgili e-ticaret platformunun (Trendyol, Hepsiburada, Amazon vb.) kendi gizlilik
            politikaları geçerli olur.
          </p>
        </Section>

        <Section title="7. KVKK Kapsamında Haklarınız">
          <p>6698 sayılı Kanun kapsamında aşağıdaki haklara sahipsiniz:</p>
          <ul className="list-disc ml-6 space-y-1 mt-2">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
            <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
            <li>Eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme</li>
            <li>KVKK&apos;nın 7. maddesinde öngörülen şartlar çerçevesinde silinmesini isteme</li>
            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
          </ul>
        </Section>

        <Section title="8. İletişim">
          <p>
            KVKK kapsamındaki talepleriniz için <strong>info@revela.com.tr</strong> adresine
            e-posta gönderebilirsiniz. Başvurularınız en geç 30 gün içinde yanıtlanacaktır.
          </p>
        </Section>
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
