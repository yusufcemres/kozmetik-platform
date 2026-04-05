'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';

// === Types ===

interface Need {
  need_id: number;
  need_name: string;
  need_slug: string;
}

interface ProductScore {
  compatibility_score: number;
  confidence_level: string;
  needId?: number;
  product?: {
    product_id: number;
    product_name: string;
    product_slug: string;
    brand?: { brand_name: string };
    category?: { category_name: string };
    images?: { image_url: string; sort_order?: number }[];
    affiliate_links?: { platform: string; affiliate_url: string; price_snapshot?: number }[];
  };
}

interface Ingredient {
  ingredient_id: number;
  inci_name: string;
  common_name?: string;
}

// === Helpers ===

const skinTypeLabels: Record<string, string> = {
  oily: 'Yağlı', dry: 'Kuru', combination: 'Karma', normal: 'Normal', sensitive: 'Hassas',
};

const budgetLabels: Record<string, string> = {
  budget: 'Uygun Fiyatlı', mid: 'Orta Segment', premium: 'Premium',
};

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-score-high';
  if (score >= 40) return 'text-score-medium';
  return 'text-score-low';
}

function getScoreBarColor(score: number): string {
  if (score >= 70) return 'bg-score-high';
  if (score >= 40) return 'bg-score-medium';
  return 'bg-score-low';
}

// === Morning/Evening routine category order ===
const MORNING_ORDER = ['Temizleme', 'Yüz Temizleme Jeli', 'Tonik & Losyon', 'Serum & Ampul', 'Göz Kremi', 'Nemlendirici Krem', 'Yüz Güneş Kremi'];
const EVENING_ORDER = ['Makyaj Temizleyici', 'Temizleme Yağı & Balm', 'Yüz Temizleme Jeli', 'Tonik & Losyon', 'Peeling & Eksfolyan', 'Serum & Ampul', 'Göz Kremi', 'Nemlendirici Krem', 'Gece Bakım'];

// === Content ===

function ResultsContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductScore[]>([]);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [avoidIngredients, setAvoidIngredients] = useState<string[]>([]);

  const skinType = searchParams.get('skin_type') || '';
  const ageRange = searchParams.get('age_range') || '';
  const concerns = searchParams.get('concerns')?.split(',').filter(Boolean).map(Number) || [];
  const sensitivityList = searchParams.get('sensitivities')?.split(',').filter(Boolean) || [];
  const budget = searchParams.get('budget') || '';

  useEffect(() => {
    async function load() {
      try {
        // Fetch needs
        const needsRes = await api.get<{ data: Need[] }>('/needs?limit=50');
        const allNeeds = needsRes.data || [];
        const selectedNeeds = allNeeds.filter((n) => concerns.includes(n.need_id));
        setNeeds(selectedNeeds);

        // Fetch top products for each concern
        const allProducts: ProductScore[] = [];
        for (const needId of concerns) {
          try {
            const scores = await api.get<ProductScore[]>(
              `/scoring/needs/${needId}/top-products?limit=5`,
            );
            if (scores) allProducts.push(...scores.map(s => ({ ...s, needId })));
          } catch {}
        }

        // Deduplicate by product_id, keep highest score + needId
        const productMap = new Map<number, ProductScore>();
        for (const ps of allProducts) {
          if (!ps.product) continue;
          const existing = productMap.get(ps.product.product_id);
          if (!existing || Number(ps.compatibility_score) > Number(existing.compatibility_score)) {
            productMap.set(ps.product.product_id, ps);
          }
        }

        // Sort by score descending, limit to 10
        const sorted = [...productMap.values()]
          .sort((a, b) => Number(b.compatibility_score) - Number(a.compatibility_score))
          .slice(0, 10);
        setProducts(sorted);

        // Ingredients to avoid based on sensitivities
        const avoid: string[] = [];
        if (sensitivityList.includes('fragrance')) avoid.push('Parfum (Fragrance)', 'Linalool', 'Limonene', 'Citronellol');
        if (sensitivityList.includes('alcohol')) avoid.push('Alcohol Denat', 'Ethanol', 'Isopropyl Alcohol');
        if (sensitivityList.includes('paraben')) avoid.push('Methylparaben', 'Propylparaben', 'Butylparaben', 'Ethylparaben');
        if (sensitivityList.includes('essential_oils')) avoid.push('Tea Tree Oil', 'Lavender Oil', 'Eucalyptus Oil', 'Peppermint Oil');
        setAvoidIngredients(avoid);
      } catch (err) {
        console.error('Failed to load results:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="text-center py-24">
        <div className="inline-flex items-center gap-3 text-primary">
          <span className="material-icon animate-spin" aria-hidden="true">progress_activity</span>
          <span className="text-sm font-medium">Analiz sonuçlarınız hazırlanıyor...</span>
        </div>
      </div>
    );
  }

  const shareText = `REVELA Cilt Analizi sonucum: ${skinTypeLabels[skinType]} cilt, ${needs.map(n => n.need_name).join(', ')} ihtiyaçları. Kişisel ürün önerilerimi gör!`;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="curator-section max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="material-icon text-score-high mb-2 block" style={{ fontSize: '48px' }} aria-hidden="true">
          check_circle
        </span>
        <h1 className="text-3xl headline-tight text-on-surface">ANALİZ SONUÇLARIN</h1>
        <p className="text-on-surface-variant text-sm mt-2">İşte sana özel bakım önerileri</p>
      </div>

      {/* Profile Summary Card */}
      <div className="curator-card p-6 mb-8">
        <h2 className="font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-icon text-primary" aria-hidden="true">person</span>
          Cilt Profilin
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-surface-container-low rounded-sm p-3 text-center">
            <p className="label-caps text-outline mb-1">Cilt Tipi</p>
            <p className="font-bold text-on-surface">{skinTypeLabels[skinType] || skinType}</p>
          </div>
          <div className="bg-surface-container-low rounded-sm p-3 text-center">
            <p className="label-caps text-outline mb-1">Yaş</p>
            <p className="font-bold text-on-surface">{ageRange || '-'}</p>
          </div>
          <div className="bg-surface-container-low rounded-sm p-3 text-center">
            <p className="label-caps text-outline mb-1">Bütçe</p>
            <p className="font-bold text-on-surface">{budgetLabels[budget] || budget}</p>
          </div>
          <div className="bg-surface-container-low rounded-sm p-3 text-center">
            <p className="label-caps text-outline mb-1">Hassasiyet</p>
            <p className="font-bold text-on-surface">{sensitivityList.length > 0 ? sensitivityList.length + ' madde' : 'Yok'}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="label-caps text-outline mb-2">İhtiyaçların</p>
          <div className="flex flex-wrap gap-2">
            {needs.map((n) => (
              <Link
                key={n.need_id}
                href={`/ihtiyaclar/${n.need_slug}`}
                className="bg-primary/5 text-primary px-3 py-1.5 rounded-sm text-xs font-medium hover:bg-primary/10 transition-colors"
              >
                {n.need_name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Top 5 Product Recommendations */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-icon text-primary" aria-hidden="true">recommend</span>
          Sana Özel Ürün Önerileri
        </h2>
        {products.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-8">
            Henüz yeterli veri yok, yakında öneriler burada olacak.
          </p>
        ) : (
          <div className="space-y-3">
            {products.slice(0, 5).map((ps, idx) => {
              const product = ps.product!;
              const score = Math.round(Number(ps.compatibility_score));
              const img = product.images?.find(i => i.sort_order === 0)?.image_url || product.images?.[0]?.image_url;
              const cheapest = product.affiliate_links?.reduce((min, l) =>
                l.price_snapshot && (!min.price_snapshot || l.price_snapshot < min.price_snapshot) ? l : min,
                product.affiliate_links[0],
              );

              return (
                <div key={product.product_id} className="curator-card p-4 flex items-center gap-4 group">
                  <span className="text-lg font-bold text-outline w-6 text-center shrink-0">
                    {idx + 1}
                  </span>
                  <Link href={`/urunler/${product.product_slug}`} className="w-16 h-16 bg-surface-container-low rounded-sm overflow-hidden shrink-0 relative">
                    {img ? (
                      <Image src={img} alt={product.product_name} fill sizes="64px" className="object-contain" />
                    ) : (
                      <span className="material-icon text-outline-variant flex items-center justify-center h-full" aria-hidden="true">inventory_2</span>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    {product.brand && (
                      <p className="label-caps text-outline">{product.brand.brand_name}</p>
                    )}
                    <Link href={`/urunler/${product.product_slug}`} className="text-sm font-semibold text-on-surface truncate block group-hover:text-primary transition-colors">
                      {product.product_name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {ps.needId && (
                        <span className="bg-primary/5 text-primary px-2 py-0.5 rounded-sm text-[10px] font-medium">
                          {needs.find(n => n.need_id === ps.needId)?.need_name}
                        </span>
                      )}
                      <div className="flex-1 h-1 bg-surface-container rounded-full overflow-hidden max-w-[100px]">
                        <div className={`h-full rounded-full ${getScoreBarColor(score)}`} style={{ width: `${score}%` }} />
                      </div>
                      <span className={`text-[10px] font-bold ${getScoreColor(score)}`}>%{score}</span>
                    </div>
                  </div>
                  {cheapest && (
                    <a
                      href={`${cheapest.affiliate_url}${cheapest.affiliate_url.includes('?') ? '&' : '?'}utm_source=revela&utm_medium=affiliate&utm_campaign=cilt-analizi`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 bg-primary text-on-primary px-4 py-2 rounded-sm text-xs font-medium hover:bg-primary/90 transition-colors"
                    >
                      {cheapest.price_snapshot ? `₺${Number(cheapest.price_snapshot).toFixed(0)}` : 'Satın Al'}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Morning & Evening Routine */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-icon text-primary" aria-hidden="true">schedule</span>
          Önerilen Rutin
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Morning */}
          <div className="curator-card p-5 border-l-2 border-l-score-medium">
            <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-icon text-score-medium" aria-hidden="true">light_mode</span>
              Sabah Rutini
            </h3>
            <ol className="space-y-2.5 text-sm">
              {MORNING_ORDER.map((cat, idx) => {
                const matched = products.find(ps => {
                  const catName = ps.product?.category?.category_name || '';
                  return catName === cat || cat.split(' ')[0].length > 3 && catName.includes(cat.split(' ')[0]);
                });
                return (
                  <li key={cat} className="flex items-center gap-3 text-on-surface-variant">
                    <span className="text-xs font-bold text-score-medium w-5">{idx + 1}</span>
                    <span className="flex-1">{cat}</span>
                    {matched?.product && (
                      <Link href={`/urunler/${matched.product.product_slug}`} className="text-[10px] text-primary truncate max-w-[160px] hover:underline">
                        {matched.product.brand?.brand_name} {matched.product.product_name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
          {/* Evening */}
          <div className="curator-card p-5 border-l-2 border-l-primary">
            <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-icon text-primary" aria-hidden="true">dark_mode</span>
              Akşam Rutini
            </h3>
            <ol className="space-y-2.5 text-sm">
              {EVENING_ORDER.map((cat, idx) => {
                const matched = products.find(ps => {
                  const catName = ps.product?.category?.category_name || '';
                  return catName === cat || cat.split(' ')[0].length > 3 && catName.includes(cat.split(' ')[0]);
                });
                return (
                  <li key={cat} className="flex items-center gap-3 text-on-surface-variant">
                    <span className="text-xs font-bold text-primary w-5">{idx + 1}</span>
                    <span className="flex-1">{cat}</span>
                    {matched?.product && (
                      <Link href={`/urunler/${matched.product.product_slug}`} className="text-[10px] text-primary truncate max-w-[160px] hover:underline">
                        {matched.product.brand?.brand_name} {matched.product.product_name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* Ingredients to Avoid */}
      {avoidIngredients.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-icon text-error" aria-hidden="true">block</span>
            Kaçınılması Gereken İçerikler
          </h2>
          <div className="bg-error/5 border border-error/20 rounded-sm p-5">
            <div className="flex flex-wrap gap-2">
              {avoidIngredients.map((ing) => (
                <span key={ing} className="bg-surface text-error px-3 py-1.5 rounded-sm text-xs font-medium border border-error/20">
                  {ing}
                </span>
              ))}
            </div>
            <p className="text-xs text-on-surface-variant mt-3">
              Hassasiyetlerine göre bu içerikleri barındıran ürünlerden kaçınmanı öneriyoruz.
            </p>
          </div>
        </section>
      )}

      {/* Share + Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8 border-t border-outline-variant/20 pt-8">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-sm text-xs font-medium uppercase tracking-wider hover:bg-[#20BD5C] transition-colors"
        >
          <span className="material-icon material-icon-sm" aria-hidden="true">share</span>
          WhatsApp ile Paylaş
        </a>
        <Link
          href="/cilt-analizi"
          className="flex-1 curator-btn-outline py-3 text-xs text-center"
        >
          Testi Tekrarla
        </Link>
        <Link
          href="/onerilerimiz"
          className="flex-1 curator-btn-primary py-3 text-xs text-center"
        >
          Tüm Önerileri Gör
        </Link>
      </div>
    </div>
  );
}

export default function SkinAnalysisResultPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-24">
        <span className="material-icon animate-spin text-primary" aria-hidden="true">progress_activity</span>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
