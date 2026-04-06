import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Metodoloji',
  description: 'REVELA skorlama metodolojisi: INCI analizi, kanıt değerlendirmesi ve uyumluluk skoru hesaplama yöntemi.',
};

export default function MethodologyPage() {
  return (
    <div className="curator-section max-w-[1200px] mx-auto">
      <div className="text-center mb-16">
        <span className="label-caps text-outline block mb-4 tracking-[0.4em]">Bilim</span>
        <h1 className="text-4xl lg:text-5xl headline-tight text-on-surface">METODOLOJİ</h1>
        <p className="text-on-surface-variant mt-4 max-w-2xl mx-auto">
          Her ürün için hesapladığımız uyumluluk skoru, aşağıdaki bilimsel süreçten geçmektedir.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-16 mb-24">
        {[
          {
            step: '01',
            icon: 'list_alt',
            title: 'INCI Listesi Ayrıştırma',
            content: [
              'Her ürünün INCI (International Nomenclature of Cosmetic Ingredients) listesi bileşenlerine ayrılır.',
              'Her bileşenin sıra numarası (inci_order_rank) kaydedilir. INCI kurallarına göre, ilk sıradaki bileşenler en yüksek konsantrasyona sahiptir.',
              'Bileşenler veritabanımızdaki 5.000+ ingredient kaydıyla eşleştirilir. Eşleşmeyen bileşenler trigram benzerlik algoritması ile otomatik önerilir.',
            ],
          },
          {
            step: '02',
            icon: 'science',
            title: 'Ingredient Güç Skoru Hesaplama',
            content: [
              'Her bileşen için bir güç skoru (IngredientStrengthScore) hesaplanır:',
              'BaseOrderScore: INCI sırasına göre ağırlık. İlk 5 bileşen en yüksek puanı alır, sıra arttıkça puan logaritmik olarak düşer.',
              'ConcentrationBandWeight: Bileşenin konsantrasyon bandına göre çarpan (yüksek, orta, düşük, %1 altı).',
              'ClaimBoost: Ürün etiketinde öne çıkarılan bileşenler (ör. "Niacinamide %10") ek çarpan alır.',
              'Formül: StrengthScore = BaseOrderScore x ConcentrationWeight x ClaimBoost',
            ],
          },
          {
            step: '03',
            icon: 'hub',
            title: 'İhtiyaç-Bileşen Eşleştirme',
            content: [
              'Her bileşenin cilt ihtiyaçlarıyla ilişkisi (IngredientNeedMapping) veritabanımızda kayıtlıdır.',
              'Her eşleşme için relevance_score (0-100) ve etki tipi (pozitif, negatif, dikkat gerektiren) belirlenir.',
              'Bu eşleşmeler bilimsel literatür, klinik çalışmalar ve uzman değerlendirmelerine dayanır.',
            ],
          },
          {
            step: '04',
            icon: 'calculate',
            title: 'Uyumluluk Skoru',
            content: [
              'Her ihtiyaç için, ürünün içerdiği ilgili bileşenlerin katkıları toplanır:',
              'Katkı = (Relevance / 100) x StrengthScore',
              'Negatif etkili bileşenler (tahriş edici, alerjik) katkıdan düşülür.',
              'Toplam skor, maksimum olası skora bölünerek 0-100 aralığına normalize edilir.',
              'Güven seviyesi: 3+ eşleşen bileşen = yüksek, 1-2 = orta, 0 = düşük.',
            ],
          },
          {
            step: '05',
            icon: 'person',
            title: 'Kişiselleştirilmiş Skor',
            content: [
              'Cilt profilini oluşturduysan, genel uyumluluk skoruna ek olarak kişisel skor hesaplanır.',
              'Senin ihtiyaçlarına (ör. sivilce, nemlendirme) uygun skorlar ağırlıklı ortalama ile birleştirilir.',
              'Hassasiyetlerin varsa (parfüm, alkol, paraben) ceza çarpanları uygulanır.',
              'Örn: Parfüm hassasiyetin varsa ve ürün parfüm içeriyorsa, skor otomatik düşürülür.',
            ],
          },
        ].map((s) => (
          <div key={s.step} className="flex gap-8">
            <div className="shrink-0 w-16 text-center">
              <span className="text-3xl font-bold text-outline-variant/40">{s.step}</span>
              <span className="material-icon text-primary block mt-2" aria-hidden="true">{s.icon}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-on-surface mb-4">{s.title}</h2>
              <ul className="space-y-2">
                {s.content.map((line, i) => (
                  <li key={i} className="text-on-surface-variant leading-relaxed text-sm flex gap-2">
                    <span className="text-outline mt-1 shrink-0">&bull;</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Confidence */}
      <div className="bg-surface-container-low rounded-sm p-12 mb-16">
        <h2 className="text-xl font-bold text-on-surface mb-6 text-center">Güven Seviyeleri</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { level: 'Yüksek', color: 'text-score-high', desc: '3 veya daha fazla bileşen ilgili ihtiyaçla eşleşmiş. Skor güvenilir.' },
            { level: 'Orta', color: 'text-score-medium', desc: '1-2 bileşen eşleşmiş. Skor yaklaşık, daha fazla veri gerekebilir.' },
            { level: 'Düşük', color: 'text-score-low', desc: 'Eşleşme yok veya yetersiz veri. Skor referans amaçlıdır.' },
          ].map((c) => (
            <div key={c.level} className="text-center">
              <span className={`text-2xl font-bold ${c.color} block mb-2`}>{c.level}</span>
              <p className="text-xs text-on-surface-variant leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-center">
        <p className="text-xs text-outline leading-relaxed max-w-2xl mx-auto mb-6">
          REVELA bağımsız bir bilgi platformudur. Sunduğumuz bilgiler tıbbi tavsiye niteliğinde değildir.
          Cilt sorunlarınız için bir dermatoloğa danışmanızı öneririz. Metodolojimizi sürekli geliştirmekteyiz.
        </p>
        <Link href="/cilt-analizi" className="curator-btn-primary text-xs px-6 py-3">
          Cilt Analizini Başlat
        </Link>
      </div>
    </div>
  );
}
