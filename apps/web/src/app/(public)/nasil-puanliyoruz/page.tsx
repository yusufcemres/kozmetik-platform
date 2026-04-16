import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Nasıl Puanlıyoruz? — REVELA Skorlama Metodolojisi',
  description: 'REVELA takviye ve kozmetik ürün skorlama sistemi: 13 bileşen, kanıt hiyerarşisi, veri kaynakları ve şeffaflık ilkelerimiz.',
};

export default function NasilPuanliyoruzPage() {
  return (
    <div className="curator-section max-w-[900px] mx-auto">
      {/* Header */}
      <section className="text-center mb-12">
        <span className="label-caps text-outline mb-3 block tracking-[0.4em]">Şeffaflık</span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-on-surface mb-4">
          Nasıl Puanlıyoruz?
        </h1>
        <p className="text-on-surface-variant max-w-lg mx-auto leading-relaxed">
          Her REVELA skoru deterministik, kanıt temelli ve versionlanmıştır.
          Affiliate ilişkilerimiz skor hesabını hiçbir şekilde etkilemez.
        </p>
      </section>

      {/* Kanıt Hiyerarşisi */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-icon text-primary" aria-hidden="true">science</span>
          Kanıt Hiyerarşisi (A-E)
        </h2>
        <div className="curator-card p-6 space-y-3">
          {[
            { grade: 'A', label: 'Sistematik Derleme / Meta-analiz', desc: 'Cochrane, PubMed meta-analiz — en güçlü kanıt.', color: 'bg-green-500' },
            { grade: 'B', label: 'Çoklu RCT', desc: 'Birden fazla randomize kontrollü çalışma.', color: 'bg-lime-500' },
            { grade: 'C', label: 'Tekil RCT veya Büyük Kohort', desc: 'Tek RCT veya geniş gözlemsel çalışma.', color: 'bg-amber-500' },
            { grade: 'D', label: 'Mekanizma / Hayvan / In-vitro', desc: 'Preklinik çalışmalar, henüz insan verisi yok.', color: 'bg-orange-500' },
            { grade: 'E', label: 'Uzman Görüşü / Gelenek', desc: 'Bilimsel kanıt yetersiz, geleneksel kullanım.', color: 'bg-red-500' },
          ].map((item) => (
            <div key={item.grade} className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full ${item.color} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                {item.grade}
              </div>
              <div>
                <span className="font-semibold text-on-surface text-sm">{item.label}</span>
                <p className="text-xs text-on-surface-variant">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Grade Boundaries */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-icon text-primary" aria-hidden="true">grade</span>
          Skor Sınıfları
        </h2>
        <div className="curator-card p-6">
          <div className="grid grid-cols-5 gap-2 text-center text-sm">
            {[
              { grade: 'A', range: '85-100', label: 'Çok İyi', color: 'bg-green-500' },
              { grade: 'B', range: '70-84', label: 'İyi', color: 'bg-lime-500' },
              { grade: 'C', range: '55-69', label: 'Orta', color: 'bg-amber-500' },
              { grade: 'D', range: '40-54', label: 'Zayıf', color: 'bg-orange-500' },
              { grade: 'F', range: '0-39', label: 'Kaçınılmalı', color: 'bg-red-500' },
            ].map((item) => (
              <div key={item.grade} className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-full ${item.color} text-white flex items-center justify-center font-bold`}>
                  {item.grade}
                </div>
                <span className="text-xs font-bold text-on-surface">{item.range}</span>
                <span className="text-[10px] text-on-surface-variant">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Takviye Metodolojisi */}
      <section id="supplement" className="mb-12 scroll-mt-20">
        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-icon text-primary" aria-hidden="true">medication</span>
          Takviye Skorlama (supplement-v2)
        </h2>
        <div className="curator-card p-6">
          <p className="text-sm text-on-surface-variant mb-4">
            6 bileşen, toplam ağırlık 100. Her bileşen kaynağıyla birlikte raporlanır.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="text-left py-2 text-on-surface-variant font-medium">Bileşen</th>
                  <th className="text-center py-2 text-on-surface-variant font-medium w-16">Ağırlık</th>
                  <th className="text-left py-2 text-on-surface-variant font-medium">Kaynak</th>
                </tr>
              </thead>
              <tbody className="text-on-surface">
                {[
                  { name: 'Form Biyoyararlanım', weight: '25%', source: 'PubMed PK çalışmaları' },
                  { name: 'Doz Etkinliği', weight: '25%', source: 'NIH ODS Fact Sheets' },
                  { name: 'Kanıt Seviyesi', weight: '15%', source: 'Cochrane, Examine.com' },
                  { name: 'Bağımsız Test (Third-Party)', weight: '15%', source: 'USP, NSF, ConsumerLab, Labdoor' },
                  { name: 'Etkileşim Güvenliği', weight: '10%', source: 'NIH Drug-Nutrient Interactions' },
                  { name: 'Şeffaflık + Manufacturing', weight: '10%', source: 'EFSA, FDA cGMP' },
                ].map((row) => (
                  <tr key={row.name} className="border-b border-outline-variant/10">
                    <td className="py-2 font-medium">{row.name}</td>
                    <td className="py-2 text-center font-bold text-primary">{row.weight}</td>
                    <td className="py-2 text-xs text-on-surface-variant">{row.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="font-bold text-on-surface text-sm mt-6 mb-2">Floor Cap&apos;ler (Takviye)</h3>
          <ul className="text-xs text-on-surface-variant space-y-1.5">
            <li className="flex items-start gap-1.5">
              <span className="material-icon text-error text-sm mt-0.5 shrink-0" aria-hidden="true">block</span>
              UL (Tolerable Upper Intake Level) aşıldıysa → max skor 50
            </li>
            <li className="flex items-start gap-1.5">
              <span className="material-icon text-error text-sm mt-0.5 shrink-0" aria-hidden="true">block</span>
              ≥2 zararlı etkileşim → max skor 45
            </li>
            <li className="flex items-start gap-1.5">
              <span className="material-icon text-error text-sm mt-0.5 shrink-0" aria-hidden="true">block</span>
              Kanıt seviyesi yalnızca E → max skor 55
            </li>
          </ul>
        </div>
      </section>

      {/* Kozmetik Metodolojisi */}
      <section id="cosmetic" className="mb-12 scroll-mt-20">
        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-icon text-primary" aria-hidden="true">spa</span>
          Kozmetik Skorlama (cosmetic-v1)
        </h2>
        <div className="curator-card p-6">
          <p className="text-sm text-on-surface-variant mb-4">
            7 bileşen, toplam ağırlık 100. AB 1223/2009, CIR, SCCS, IARC ve ANSES verileri kullanılır.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="text-left py-2 text-on-surface-variant font-medium">Bileşen</th>
                  <th className="text-center py-2 text-on-surface-variant font-medium w-16">Ağırlık</th>
                  <th className="text-left py-2 text-on-surface-variant font-medium">Kaynak</th>
                </tr>
              </thead>
              <tbody className="text-on-surface">
                {[
                  { name: 'Aktif Etkinlik', weight: '25%', source: 'PubMed dermatoloji RCT' },
                  { name: 'Güvenlik Sınıfı (CIR/SCCS)', weight: '20%', source: 'CIR reports, SCCS opinions' },
                  { name: 'Konsantrasyon Uygunluğu', weight: '15%', source: 'EU 1223/2009 Annex III' },
                  { name: 'Etkileşim Güvenliği', weight: '10%', source: 'Dermatolojik consensus, PubMed' },
                  { name: 'Alerjen / İrritasyon Yükü', weight: '10%', source: 'EU Annex III (26 alerjen)' },
                  { name: 'Endokrin / CMR Risk', weight: '10%', source: 'ANSES, IARC, EU CMR listesi' },
                  { name: 'Şeffaflık & Sertifika', weight: '10%', source: 'ECOCERT, COSMOS, Vegan Society' },
                ].map((row) => (
                  <tr key={row.name} className="border-b border-outline-variant/10">
                    <td className="py-2 font-medium">{row.name}</td>
                    <td className="py-2 text-center font-bold text-primary">{row.weight}</td>
                    <td className="py-2 text-xs text-on-surface-variant">{row.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="font-bold text-on-surface text-sm mt-6 mb-2">Floor Cap&apos;ler (Kozmetik)</h3>
          <ul className="text-xs text-on-surface-variant space-y-1.5">
            <li className="flex items-start gap-1.5">
              <span className="material-icon text-error text-sm mt-0.5 shrink-0" aria-hidden="true">block</span>
              AB&apos;de yasaklı içerik (Annex II) → max skor 20
            </li>
            <li className="flex items-start gap-1.5">
              <span className="material-icon text-error text-sm mt-0.5 shrink-0" aria-hidden="true">block</span>
              CMR 1A/1B sınıflandırılmış → max skor 30
            </li>
            <li className="flex items-start gap-1.5">
              <span className="material-icon text-error text-sm mt-0.5 shrink-0" aria-hidden="true">block</span>
              IARC Grup 1 karsinojen → max skor 35
            </li>
            <li className="flex items-start gap-1.5">
              <span className="material-icon text-score-medium text-sm mt-0.5 shrink-0" aria-hidden="true">warning</span>
              Endokrin bozucu içerik → max skor 55
            </li>
            <li className="flex items-start gap-1.5">
              <span className="material-icon text-score-medium text-sm mt-0.5 shrink-0" aria-hidden="true">warning</span>
              &gt;%50 içerik güvenlik verisi yok → max skor 65
            </li>
          </ul>
        </div>
      </section>

      {/* Veri Kaynakları */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-icon text-primary" aria-hidden="true">library_books</span>
          Veri Kaynakları
        </h2>
        <div className="curator-card p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold text-on-surface text-sm mb-2">Takviye</h3>
              <ul className="text-xs text-on-surface-variant space-y-1.5">
                <li><a href="https://ods.od.nih.gov/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NIH ODS Fact Sheets</a> — her vitamin/mineral için otorite</li>
                <li><a href="https://examine.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Examine.com</a> — evidence grade başlıkları</li>
                <li><a href="https://www.cochranelibrary.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Cochrane Library</a> — sistematik derlemeler</li>
                <li><a href="https://pubmed.ncbi.nlm.nih.gov/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PubMed / DOI</a> — RCT&apos;ler</li>
                <li><a href="https://www.usp.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">USP / NSF / ConsumerLab</a> — bağımsız test</li>
                <li><a href="https://www.efsa.europa.eu/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">EFSA</a> — Avrupa Gıda Güvenliği</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-on-surface text-sm mb-2">Kozmetik</h3>
              <ul className="text-xs text-on-surface-variant space-y-1.5">
                <li><a href="https://cir-safety.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">CIR</a> — Cosmetic Ingredient Review</li>
                <li><a href="https://health.ec.europa.eu/scientific-committees/scientific-committee-consumer-safety-sccs_en" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">EU SCCS</a> — Scientific Committee</li>
                <li><a href="https://ec.europa.eu/growth/tools-databases/cosing/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">EU CosIng</a> — Regulatory database</li>
                <li><a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32009R1223" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">EU 1223/2009</a> — Annex II/III/IV/V</li>
                <li><a href="https://monographs.iarc.who.int/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">IARC</a> — Karsinojen sınıflandırma</li>
                <li><a href="https://www.anses.fr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ANSES</a> — Endokrin bozucu listesi</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Algoritma Versiyonu */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-icon text-primary" aria-hidden="true">code</span>
          Algoritma Versiyonu
        </h2>
        <div className="curator-card p-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="label-caps text-outline">Takviye</span>
              <div className="font-mono text-on-surface font-bold mt-1">supplement-v2</div>
              <p className="text-xs text-on-surface-variant mt-1">6 bileşen, kanıt katmanı, floor cap&apos;ler</p>
            </div>
            <div>
              <span className="label-caps text-outline">Kozmetik</span>
              <div className="font-mono text-on-surface font-bold mt-1">cosmetic-v1</div>
              <p className="text-xs text-on-surface-variant mt-1">7 bileşen, EU/CIR/SCCS regülasyon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Şeffaflık & Legal */}
      <section className="mb-12">
        <div className="curator-card p-6 border-l-2 border-l-primary/40">
          <h2 className="font-bold text-on-surface text-sm mb-2 flex items-center gap-2">
            <span className="material-icon text-primary text-sm" aria-hidden="true">verified</span>
            Şeffaflık Notu
          </h2>
          <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
            REVELA, ürün sayfalarındaki affiliate linkleri aracılığıyla gelir elde eder.
            Ancak <strong>affiliate ilişkileri skor hesabını hiçbir şekilde etkilemez</strong>.
            Tüm skorlar yalnızca bilimsel kanıtlara ve regülasyonlara dayalı deterministik algoritmalarla hesaplanır.
          </p>
          <p className="text-[10px] text-outline leading-relaxed">
            <strong>Yasal Uyarı:</strong> REVELA skorları medikal tavsiye niteliğinde değildir.
            Herhangi bir takviye veya kozmetik ürün kullanmadan önce sağlık uzmanınıza danışın.
            Veriler bilinen kaynaklardan alınmış olup güncelliği garanti edilemez.
          </p>
        </div>
      </section>

      <div className="text-center">
        <Link href="/" className="text-sm text-primary hover:underline">
          ← Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
