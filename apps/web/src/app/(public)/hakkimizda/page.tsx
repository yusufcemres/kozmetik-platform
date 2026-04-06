import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Hakkımızda',
  description: 'REVELA — Bağımsız kozmetik içerik analiz platformu. Misyonumuz, ekibimiz ve değerlerimiz.',
};

export default function AboutPage() {
  return (
    <div className="curator-section max-w-[1200px] mx-auto">
      <div className="text-center mb-16">
        <span className="label-caps text-outline block mb-4 tracking-[0.4em]">Platform</span>
        <h1 className="text-4xl lg:text-5xl headline-tight text-on-surface">HAKKIMIZDA</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
        <div>
          <h2 className="text-2xl font-bold text-on-surface mb-6">Misyonumuz</h2>
          <p className="text-on-surface-variant leading-relaxed mb-4">
            REVELA, kozmetik ürünlerin INCI içeriklerini bilimsel verilere dayalı olarak analiz eden,
            bağımsız ve Türkçe bir karar destek platformudur. Amacımız, tüketicilerin cilt bakım
            ürünlerini bilinçli bir şekilde seçmelerine yardımcı olmaktır.
          </p>
          <p className="text-on-surface-variant leading-relaxed mb-4">
            Hiçbir marka ile ticari bağımızlığımız yoktur. Ürün değerlendirmelerimiz tamamen
            içerik analizine ve bilimsel literatüre dayanmaktadır.
          </p>
          <p className="text-on-surface-variant leading-relaxed">
            Platformumuzda yer alan ürün sayfalarındaki satın alma linkleri komisyon içerebilir.
            Bu gelir, platformun sürdürülebilirliği için kullanılmaktadır ve değerlendirmelerimizi
            hiçbir şekilde etkilememektedir.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-on-surface mb-6">Ne Yapıyoruz?</h2>
          <div className="space-y-6">
            {[
              {
                icon: 'science',
                title: 'INCI Analizi',
                desc: 'Her ürünün içerik listesini moleküler düzeyde analiz ediyor, aktif bileşenlerin etkinliğini ve konsantrasyonunu değerlendiriyoruz.',
              },
              {
                icon: 'verified_user',
                title: 'Bilimsel Kanıt Değerlendirmesi',
                desc: 'Sistematik derlemeler, klinik çalışmalar ve uzman görüşleri bazında her içerik maddesine kanıt seviyesi atıyoruz.',
              },
              {
                icon: 'auto_awesome',
                title: 'Kişiselleştirilmiş Uyumluluk Skoru',
                desc: 'Cilt tipine, ihtiyaçlarına ve hassasiyetlerine göre her ürün için kişiselleştirilmiş uyumluluk skoru hesaplıyoruz.',
              },
              {
                icon: 'compare',
                title: 'Ürün Karşılaştırma',
                desc: 'Birden fazla ürünü yan yana koyarak içerik farklarını ve uyumluluk skorlarını karşılaştırabilirsiniz.',
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <span className="material-icon text-primary mt-1 shrink-0" aria-hidden="true">
                  {item.icon}
                </span>
                <div>
                  <h3 className="font-semibold text-on-surface mb-1">{item.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-surface-container-low rounded-sm p-12 mb-16">
        <h2 className="text-2xl font-bold text-on-surface mb-8 text-center">Değerlerimiz</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { icon: 'shield', title: 'Bağımsızlık', desc: 'Hiçbir marka ile ticari bağlantımız yoktur. Değerlendirmeler tamamen bilimsel verilere dayanır.' },
            { icon: 'visibility', title: 'Şeffaflık', desc: 'Skorlama metodolojimiz ve veri kaynaklarımız tamamen açıktır. Nasıl çalıştığımızı metodoloji sayfamızda detaylı açıklıyoruz.' },
            { icon: 'translate', title: 'Türkçe Erişim', desc: 'Uluslararası INCI veritabanlarındaki bilgiyi Türkçe olarak erişilebilir kılıyoruz.' },
          ].map((v) => (
            <div key={v.title} className="text-center">
              <span className="material-icon material-icon-lg text-primary mb-4 block" aria-hidden="true">{v.icon}</span>
              <h3 className="font-bold text-on-surface mb-2">{v.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <p className="text-on-surface-variant mb-6">Daha fazla bilgi veya iş birliği için:</p>
        <div className="flex gap-4 justify-center">
          <Link href="/metodoloji" className="curator-btn-outline text-xs px-6 py-3">
            Metodolojimiz
          </Link>
          <Link href="/iletisim" className="curator-btn-primary text-xs px-6 py-3">
            İletişim
          </Link>
        </div>
      </div>
    </div>
  );
}
