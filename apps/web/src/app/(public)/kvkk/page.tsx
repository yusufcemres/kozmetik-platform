import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni',
  description: '6698 sayılı KVKK kapsamında REVELA aydınlatma metni — işlenen veriler, amaçlar, haklar.',
};

export default function KvkkPage() {
  return (
    <div className="curator-section max-w-[1000px] mx-auto">
      <div className="text-center mb-16">
        <span className="label-caps text-outline block mb-4 tracking-[0.4em]">Yasal</span>
        <h1 className="text-4xl lg:text-5xl headline-tight text-on-surface">KVKK AYDINLATMA METNİ</h1>
        <p className="text-xs text-outline mt-4">Son güncelleme: 12 Nisan 2026</p>
      </div>

      <div className="prose-custom space-y-8">
        <Section title="1. Veri Sorumlusu">
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında veri sorumlusu
            sıfatıyla REVELA (&quot;Platform&quot;), kişisel verilerinizin güvenliğine ve mahremiyetine
            önem verir. Bu aydınlatma metni, hangi verilerin, hangi amaçla, hangi hukuki sebeple
            işlendiğini ve haklarınızı açıklar.
          </p>
        </Section>

        <Section title="2. İşlenen Kişisel Veriler">
          <p>Platform kullanımı sırasında aşağıdaki kişisel veriler işlenebilir:</p>
          <ul className="list-disc ml-6 space-y-2 mt-2">
            <li>
              <strong className="text-on-surface">Kimlik / İletişim:</strong> E-posta adresi — yalnızca
              isteğe bağlı kullanıcı girişinde (&quot;magic link&quot;) doğrulama için kullanılır.
            </li>
            <li>
              <strong className="text-on-surface">Görsel Veri:</strong> &quot;Akıllı Tarama&quot; özelliğiyle
              kameradan alınan ürün fotoğrafı — sadece ürün tanıma için işlenir, sunucuda kalıcı olarak
              saklanmaz. Görsel hash (MD5) 24 saat süreyle cache amaçlı tutulur.
            </li>
            <li>
              <strong className="text-on-surface">İşlem Güvenliği:</strong> IP adresi (hash&apos;lenmiş),
              tarayıcı/cihaz bilgisi, push abonelik anahtarları — güvenlik ve kötüye kullanım önleme.
            </li>
            <li>
              <strong className="text-on-surface">Profil Verileri (yerel):</strong> Cilt profili,
              favoriler, karşılaştırma listesi — tarayıcınızın <em>localStorage</em> alanında saklanır,
              sunucuya gönderilmez.
            </li>
            <li>
              <strong className="text-on-surface">Analitik (opsiyonel):</strong> Sayfa görüntüleme,
              tıklama, cihaz türü — yalnızca çerez bannerından onay verdiğinizde Google Analytics 4
              aracılığıyla anonim olarak toplanır.
            </li>
          </ul>
        </Section>

        <Section title="3. İşleme Amaçları">
          <ul className="list-disc ml-6 space-y-1">
            <li>Kişiselleştirilmiş ürün skoru hesaplama ve içerik analizi</li>
            <li>Kullanıcı girişinin doğrulanması (magic link)</li>
            <li>Akıllı Tarama (barkod/görsel/INCI OCR) ile ürün eşleştirme</li>
            <li>Push bildirim aboneliği yönetimi (yalnızca açık rıza ile)</li>
            <li>Platform güvenliği, kötüye kullanım önleme, rate-limit</li>
            <li>Affiliate tıklama istatistikleri (anonim toplulaştırma)</li>
            <li>Hizmet kalitesinin iyileştirilmesi ve hata ayıklama</li>
          </ul>
        </Section>

        <Section title="4. Hukuki Sebep">
          <p>Kişisel verileriniz KVKK&apos;nın 5. maddesi çerçevesinde aşağıdaki hukuki sebeplere dayanılarak işlenir:</p>
          <ul className="list-disc ml-6 space-y-1 mt-2">
            <li><strong>Açık rıza</strong> — analitik çerezler, push bildirimler, Akıllı Tarama görsel işleme</li>
            <li><strong>Sözleşmenin kurulması / ifası</strong> — magic link doğrulama, hesap oluşturma</li>
            <li><strong>Meşru menfaat</strong> — güvenlik, kötüye kullanım önleme, anonim analitik</li>
            <li><strong>Hukuki yükümlülük</strong> — talep halinde yetkili makamlara bilgi sağlama</li>
          </ul>
        </Section>

        <Section title="5. Aktarım">
          <p>Kişisel verileriniz, yalnızca aşağıdaki hizmet sağlayıcılara, amaçla sınırlı olarak aktarılabilir:</p>
          <ul className="list-disc ml-6 space-y-1 mt-2">
            <li><strong>Resend</strong> — magic link e-posta gönderimi (yalnızca e-posta adresi)</li>
            <li><strong>Google Gemini / Anthropic Claude</strong> — Akıllı Tarama görsel tanıma (fotoğraf, kalıcı saklanmaz)</li>
            <li><strong>Google Analytics 4</strong> — onay verilmişse anonim analitik</li>
            <li><strong>Neon / Render / Vercel</strong> — veritabanı, API ve hosting altyapısı</li>
          </ul>
          <p className="mt-3">
            Yurt dışına veri aktarımı KVKK madde 9 çerçevesinde ve açık rızaya dayalı olarak yapılır.
          </p>
        </Section>

        <Section title="6. Saklama Süresi">
          <ul className="list-disc ml-6 space-y-1">
            <li>Hesap e-postası: hesap aktif olduğu sürece</li>
            <li>Magic link token: 20 dakika (sonra otomatik silinir)</li>
            <li>Tarama görselleri: sunucuda saklanmaz (yalnızca 24 saatlik hash cache)</li>
            <li>Push abonelikleri: aboneliği iptal edene kadar</li>
            <li>Sunucu logları: 30 gün</li>
          </ul>
        </Section>

        <Section title="7. KVKK Madde 11 — Haklarınız">
          <p>Kanun&apos;un 11. maddesi uyarınca:</p>
          <ul className="list-disc ml-6 space-y-1 mt-2">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
            <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde/dışında aktarıldığı üçüncü kişileri bilme</li>
            <li>Eksik veya yanlış işlenmiş ise düzeltilmesini isteme</li>
            <li>Silinmesini veya yok edilmesini isteme</li>
            <li>Otomatik sistemlerle analiz sonucu aleyhinize çıkan sonuca itiraz etme</li>
            <li>Kanuna aykırı işleme nedeniyle zarara uğramanız halinde tazminat talep etme</li>
          </ul>
        </Section>

        <Section title="8. Başvuru">
          <p>
            KVKK kapsamındaki taleplerinizi <strong>hello@revela.com.tr</strong> adresine gönderebilirsiniz.
            Başvurularınız en geç 30 gün içinde yanıtlanır. Veri Sorumluları Siciline (VERBİS) kayıt
            yükümlülüğü doğduğunda bilgiler bu sayfada güncellenecektir.
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
