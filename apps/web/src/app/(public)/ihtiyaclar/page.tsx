'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import ProductCarousel from '@/components/public/ProductCarousel';

interface Need {
  need_id: number;
  need_name: string;
  need_slug: string;
  need_group?: string;
  need_category?: string;
  domain_type?: string;
  short_description?: string;
  user_friendly_label?: string;
}

const CATEGORY_META: Record<string, { label: string; icon: string; desc: string }> = {
  skin: { label: 'Cilt İhtiyaçları', icon: 'face', desc: 'Cilt bakım ve koruma ihtiyaçları' },
  body: { label: 'Beden İhtiyaçları', icon: 'self_improvement', desc: 'Sindirim, eklem ve vücut sağlığı' },
  hair: { label: 'Saç İhtiyaçları', icon: 'content_cut', desc: 'Saç ve saç derisi bakımı' },
  general_health: { label: 'Genel Sağlık', icon: 'health_and_safety', desc: 'Bağışıklık, enerji ve genel sağlık' },
};

const CATEGORY_ORDER = ['skin', 'body', 'hair', 'general_health'];

const DOMAIN_GROUPS = [
  { key: 'cosmetic', label: 'Dış Bakım', icon: 'spa', desc: 'Cilt, saç ve vücut bakım ihtiyaçları', categories: ['skin', 'hair'] },
  { key: 'supplement', label: 'İç Bakım', icon: 'medication', desc: 'Beden sağlığı, bağışıklık ve genel sağlık', categories: ['body', 'general_health'] },
];

function NeedsListContent() {
  const searchParams = useSearchParams();
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const kategori = searchParams.get('kategori');
    if (kategori && CATEGORY_META[kategori]) {
      setActiveCategory(kategori);
      setActiveDomain(null);
    }
  }, [searchParams]);

  useEffect(() => {
    api
      .get<{ data: Need[]; meta: { total: number } }>('/needs?limit=100')
      .then((data) => setNeeds(data.data || []))
      .catch(() => setNeeds([]))
      .finally(() => setLoading(false));
  }, []);

  // Group needs by need_category
  const grouped = needs.reduce<Record<string, Need[]>>((acc, need) => {
    const cat = need.need_category || 'skin';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(need);
    return acc;
  }, {});

  // Domain-based grouping
  const domainNeeds = DOMAIN_GROUPS.map((dg) => ({
    ...dg,
    categories: CATEGORY_ORDER
      .filter((c) => grouped[c])
      .filter((c) => {
        if (dg.key === 'cosmetic') return needs.some((n) => n.need_category === c && n.domain_type === 'cosmetic');
        return needs.some((n) => n.need_category === c && n.domain_type === 'supplement');
      }),
    needs: needs.filter((n) => n.domain_type === dg.key),
  }));

  const filteredDomains = activeDomain
    ? domainNeeds.filter((d) => d.key === activeDomain)
    : domainNeeds;

  return (
    <div className="curator-section max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <span className="label-caps text-outline block mb-2 tracking-[0.3em]">Keşfet</span>
        <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface">İHTİYAÇLAR</h1>
        <p className="text-on-surface-variant text-sm mt-2">
          Cilt, beden ve genel sağlık ihtiyaçlarını keşfet — her biri için en etkili ürün ve içerikleri öğren
        </p>
      </div>

      {/* Domain filter chips */}
      <div className="flex flex-wrap gap-2 mb-10">
        <button
          onClick={() => { setActiveDomain(null); setActiveCategory(null); }}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
            !activeDomain
              ? 'bg-on-surface text-surface'
              : 'border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          Tümünü Göster
        </button>
        {DOMAIN_GROUPS.map((dg) => {
          const count = needs.filter((n) => n.domain_type === dg.key).length;
          if (!count) return null;
          return (
            <button
              key={dg.key}
              onClick={() => { setActiveDomain(activeDomain === dg.key ? null : dg.key); setActiveCategory(null); }}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                activeDomain === dg.key
                  ? 'bg-on-surface text-surface'
                  : 'border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <span className="material-icon text-[14px]" aria-hidden="true">{dg.icon}</span>
              {dg.label}
              <span className="opacity-60">({count})</span>
            </button>
          );
        })}
        {CATEGORY_ORDER.filter((c) => grouped[c]).map((cat) => {
          const meta = CATEGORY_META[cat];
          return (
            <button
              key={cat}
              onClick={() => { setActiveCategory(activeCategory === cat ? null : cat); setActiveDomain(null); }}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                activeCategory === cat
                  ? 'bg-on-surface text-surface'
                  : 'border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <span className="material-icon text-[14px]" aria-hidden="true">{meta?.icon || 'target'}</span>
              {meta?.label || cat}
              <span className="opacity-60">({grouped[cat].length})</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="curator-card p-5 animate-pulse">
              <div className="h-4 bg-surface-container rounded w-2/3 mb-3" />
              <div className="h-3 bg-surface-container rounded w-full" />
            </div>
          ))}
        </div>
      ) : needs.length === 0 ? (
        <div className="text-center py-24">
          <span className="material-icon text-outline-variant mb-4 block" style={{ fontSize: '64px' }} aria-hidden="true">target</span>
          <p className="text-on-surface-variant">Henüz ihtiyaç tanımlanmamış</p>
        </div>
      ) : (
        <div className="space-y-16">
          {filteredDomains.map((domain) => {
            if (domain.needs.length === 0) return null;
            // Group this domain's needs by category
            const domainGrouped = domain.needs.reduce<Record<string, Need[]>>((acc, n) => {
              const cat = n.need_category || 'skin';
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(n);
              return acc;
            }, {});
            const cats = activeCategory
              ? [activeCategory].filter((c) => domainGrouped[c])
              : CATEGORY_ORDER.filter((c) => domainGrouped[c]);
            if (cats.length === 0) return null;

            return (
              <div key={domain.key}>
                {/* Domain header */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-icon text-[28px] text-primary" aria-hidden="true">{domain.icon}</span>
                  <h2 className="text-2xl font-bold text-on-surface tracking-tight">{domain.label}</h2>
                  <span className="label-caps text-outline">({domain.needs.length})</span>
                </div>
                <p className="text-sm text-on-surface-variant mb-8 ml-10">{domain.desc}</p>

                <div className="space-y-12 ml-1">
                  {cats.map((cat) => {
                    const meta = CATEGORY_META[cat];
                    return (
                      <section key={cat}>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="material-icon text-primary text-[22px]" aria-hidden="true">{meta?.icon || 'target'}</span>
                          <h3 className="text-lg font-bold text-on-surface">
                            {meta?.label || cat}
                          </h3>
                          <span className="label-caps text-outline">
                            ({domainGrouped[cat].length})
                          </span>
                        </div>
                        {meta?.desc && (
                          <p className="text-sm text-on-surface-variant mb-5 ml-9">{meta.desc}</p>
                        )}
                        <ProductCarousel>
                          {domainGrouped[cat].map((need) => (
                            <Link
                              key={need.need_id}
                              href={`/ihtiyaclar/${need.need_slug}`}
                              className="curator-card p-5 group snap-start shrink-0 w-[260px] sm:w-[280px]"
                            >
                              <h3 className="font-semibold text-on-surface group-hover:text-primary transition-colors tracking-tight">
                                {need.need_name}
                              </h3>
                              {need.user_friendly_label && (
                                <p className="text-xs text-primary mt-1">
                                  {need.user_friendly_label}
                                </p>
                              )}
                              {need.short_description && (
                                <p className="text-sm text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">
                                  {need.short_description}
                                </p>
                              )}
                              <span className="inline-flex items-center gap-1 label-caps text-primary mt-3">
                                Detayları Gör
                                <span className="material-icon material-icon-sm" aria-hidden="true">arrow_forward</span>
                              </span>
                            </Link>
                          ))}
                        </ProductCarousel>
                      </section>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Profile CTA */}
      <div className="mt-16 curator-card p-8 text-center">
        <h3 className="text-xl headline-tight text-on-surface mb-2">
          HANGİ İHTİYAÇLAR SENİNLE İLGİLİ?
        </h3>
        <p className="text-sm text-on-surface-variant mb-6">
          Cilt profilini oluştur, sana özel ihtiyaç ve ürün önerileri al.
        </p>
        <Link
          href="/profilim"
          className="curator-btn-primary text-[10px] px-8 py-3 inline-block"
        >
          PROFİLİMİ OLUŞTUR
        </Link>
      </div>
    </div>
  );
}

export default function NeedsListPage() {
  return (
    <Suspense fallback={<div className="curator-section text-center text-outline">Yükleniyor...</div>}>
      <NeedsListContent />
    </Suspense>
  );
}
