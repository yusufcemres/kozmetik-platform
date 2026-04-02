'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Stats {
  products: number;
  ingredients: number;
  needs: number;
  articles: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({ products: 0, ingredients: 0, needs: 0, articles: 0 });

  useEffect(() => {
    // Fetch counts in parallel
    Promise.allSettled([
      api.get<{ meta: { total: number } }>('/products?limit=1'),
      api.get<{ meta: { total: number } }>('/ingredients?limit=1'),
      api.get<{ data: any[] }>('/needs?limit=100'),
      api.get<{ meta: { total: number } }>('/articles?limit=1'),
    ]).then(([pRes, iRes, nRes, aRes]) => {
      setStats({
        products: pRes.status === 'fulfilled' ? pRes.value.meta?.total || 0 : 0,
        ingredients: iRes.status === 'fulfilled' ? iRes.value.meta?.total || 0 : 0,
        needs: nRes.status === 'fulfilled' ? nRes.value.data?.length || 0 : 0,
        articles: aRes.status === 'fulfilled' ? aRes.value.meta?.total || 0 : 0,
      });
    });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Kozmetik Ürünlerini Anla
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            INCI listesini analiz et, cildine uygun ürünleri keşfet.
            Bilimsel kanıta dayalı, bağımsız ve Türkçe.
          </p>

          <div className="max-w-xl mx-auto">
            <Link
              href="/ara"
              className="flex items-center gap-3 bg-white border-2 border-gray-200 rounded-xl px-6 py-4 text-gray-400 hover:border-primary transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Ürün, içerik veya cilt ihtiyacı ara...
            </Link>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-10">
            {[
              { label: 'Ürün', value: stats.products, icon: '📦' },
              { label: 'İçerik', value: stats.ingredients, icon: '🧪' },
              { label: 'İhtiyaç', value: stats.needs, icon: '🎯' },
              { label: 'Rehber', value: stats.articles, icon: '📝' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {s.value > 0 ? s.value : '-'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  <span className="mr-1">{s.icon}</span>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link
            href="/urunler"
            className="bg-white border rounded-xl p-8 hover:shadow-lg hover:border-primary/30 transition-all group"
          >
            <div className="text-3xl mb-4">📦</div>
            <h2 className="text-xl font-bold mb-2 group-hover:text-primary">Ürünler</h2>
            <p className="text-gray-500 text-sm">
              Kozmetik ürünleri incele, içeriklerini analiz et ve ihtiyacına uygunluğunu kontrol et.
            </p>
          </Link>

          <Link
            href="/icerikler"
            className="bg-white border rounded-xl p-8 hover:shadow-lg hover:border-primary/30 transition-all group"
          >
            <div className="text-3xl mb-4">🧪</div>
            <h2 className="text-xl font-bold mb-2 group-hover:text-primary">İçerik Maddeleri</h2>
            <p className="text-gray-500 text-sm">
              Niacinamide, Retinol, Hyaluronic Acid... Her içerik maddesini bilimsel kaynaklarıyla öğren.
            </p>
          </Link>

          <Link
            href="/ihtiyaclar"
            className="bg-white border rounded-xl p-8 hover:shadow-lg hover:border-primary/30 transition-all group"
          >
            <div className="text-3xl mb-4">🎯</div>
            <h2 className="text-xl font-bold mb-2 group-hover:text-primary">Cilt İhtiyaçları</h2>
            <p className="text-gray-500 text-sm">
              Sivilce, leke, kırışıklık, kuruluk... İhtiyacına göre en etkili içerikleri ve ürünleri bul.
            </p>
          </Link>
        </div>
      </section>

      {/* Takviyeler + Rehber row */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link
            href="/takviyeler"
            className="bg-white border rounded-xl p-8 hover:shadow-lg hover:border-primary/30 transition-all group"
          >
            <div className="text-3xl mb-4">💊</div>
            <h2 className="text-xl font-bold mb-2 group-hover:text-primary">Takviye Ürünleri</h2>
            <p className="text-gray-500 text-sm">
              Vitamin, mineral ve besin takviyeleri. İçerik analizi, etkileşim kontrolü ve besin değerleri.
            </p>
          </Link>

          <Link
            href="/rehber"
            className="bg-white border rounded-xl p-8 hover:shadow-lg hover:border-primary/30 transition-all group"
          >
            <div className="text-3xl mb-4">📝</div>
            <h2 className="text-xl font-bold mb-2 group-hover:text-primary">Rehber</h2>
            <p className="text-gray-500 text-sm">
              Cilt bakımı rehberleri, içerik incelemeleri ve uzman içerikleri. A&apos;dan Z&apos;ye cilt bakımı.
            </p>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">Nasıl Çalışır?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Ürünü Bul',
                desc: 'İsmini yaz veya barkodunu tara. INCI listesini otomatik analiz ediyoruz.',
              },
              {
                step: '2',
                title: 'İçerikleri Anla',
                desc: 'Her içerik maddesinin ne işe yaradığını, kanıt seviyesini ve olası etkilerini gör.',
              },
              {
                step: '3',
                title: 'Cildine Uygunluğunu Gör',
                desc: 'Cilt profilini oluştur, her ürün için kişisel uyum skorunu al.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Profile CTA */}
      <section className="bg-primary/5 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">Cilt Profilini Oluştur</h2>
          <p className="text-gray-600 mb-6">
            Cilt tipini, ihtiyaçlarını ve hassasiyetlerini belirle.
            Her ürün sayfasında sana özel uyum skoru gör.
          </p>
          <Link
            href="/profilim"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Profilimi Oluştur
          </Link>
        </div>
      </section>

      {/* Disclosure */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-xs text-gray-400 text-center leading-relaxed">
          Kozmetik Platform bağımsız bir bilgi platformudur. Sunduğumuz bilgiler tıbbi tavsiye
          niteliğinde değildir. Ürün sayfalarındaki satın alma linkleri komisyon içerebilir.{' '}
          <Link href="/rehber" className="underline hover:text-gray-600">
            Daha fazla bilgi
          </Link>
        </p>
      </section>
    </div>
  );
}
