import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'İletişim',
  description: 'REVELA iletişim bilgileri. Sorularınız, geri bildirimleriniz ve iş birliği teklifleriniz için bize ulaşın.',
};

export default function ContactPage() {
  return (
    <div className="curator-section max-w-[1200px] mx-auto">
      <div className="text-center mb-16">
        <span className="label-caps text-outline block mb-4 tracking-[0.4em]">Destek</span>
        <h1 className="text-4xl lg:text-5xl headline-tight text-on-surface">İLETİŞİM</h1>
        <p className="text-on-surface-variant mt-4 max-w-xl mx-auto">
          Sorularınız, geri bildirimleriniz veya iş birliği teklifleriniz için bize ulaşabilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {[
          // TODO: revela.com.tr domain alındığında info@revela.com.tr'a güncelle
          // Şu an info@sololabstr.com (SoloLabs Google Workspace, aktif/reachable)
          {
            icon: 'mail',
            title: 'E-posta',
            desc: 'Genel sorular ve geri bildirim',
            value: 'info@sololabstr.com',
            href: 'mailto:info@sololabstr.com',
          },
          {
            icon: 'handshake',
            title: 'İş Birliği',
            desc: 'Marka ve iş ortaklığı teklifleri',
            value: 'info@sololabstr.com',
            href: 'mailto:info@sololabstr.com?subject=İş%20Birliği',
          },
          {
            icon: 'bug_report',
            title: 'Hata Bildirimi',
            desc: 'Teknik sorunlar ve veri düzeltmeleri',
            value: 'info@sololabstr.com',
            href: 'mailto:info@sololabstr.com?subject=Hata%20Bildirimi',
          },
        ].map((item) => (
          <a
            key={item.title}
            href={item.href}
            className="curator-card p-8 text-center group hover:border-primary/30 transition-all"
          >
            <span className="material-icon material-icon-lg text-primary/60 group-hover:text-primary transition-colors mb-4 block" aria-hidden="true">
              {item.icon}
            </span>
            <h2 className="font-bold text-on-surface mb-1">{item.title}</h2>
            <p className="text-xs text-on-surface-variant mb-4">{item.desc}</p>
            <span className="text-sm text-primary font-medium">{item.value}</span>
          </a>
        ))}
      </div>

      {/* FAQ */}
      <div className="bg-surface-container-low rounded-sm p-12 mb-16">
        <h2 className="text-xl font-bold text-on-surface mb-8 text-center">Sıkça Sorulan Sorular</h2>
        <div className="space-y-6 max-w-3xl mx-auto">
          {[
            {
              q: 'Ürün bilgilerinde hata var, nasıl düzelttirebilirim?',
              a: 'Ürün sayfasının alt kısmındaki "Hata Bildir" bağlantısını kullanabilir veya destek@revela.com.tr adresine ürün bağlantısıyla birlikte yazabilirsiniz.',
            },
            {
              q: 'Markamı platforma ekletebilir miyim?',
              a: 'Evet! isbirligi@revela.com.tr adresine markanızın adı, web sitesi ve ürün listesiyle birlikte yazmanız yeterlidir.',
            },
            {
              q: 'Skorlar nasıl hesaplanıyor?',
              a: 'INCI listesindeki her bileşenin sırası, konsantrasyonu ve cilt ihtiyaçlarıyla ilişkisi analiz edilerek hesaplanır. Detaylı bilgi için Metodoloji sayfamızı inceleyin.',
            },
            {
              q: 'Verileriniz nereden geliyor?',
              a: 'Ürün INCI listeleri resmi kaynaklardan alınmaktadır. Bileşen bilgileri uluslararası INCI veritabanları ve hakemli bilimsel yayınlara dayanmaktadır.',
            },
          ].map((faq) => (
            <div key={faq.q}>
              <h3 className="font-semibold text-on-surface mb-2 text-sm">{faq.q}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link href="/hakkimizda" className="curator-btn-outline text-xs px-6 py-3">
          Hakkımızda
        </Link>
      </div>
    </div>
  );
}
