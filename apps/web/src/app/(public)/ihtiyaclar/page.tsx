'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

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

export default function NeedsListPage() {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

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

  const sortedCategories = [
    ...CATEGORY_ORDER.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  const filteredCategories = activeFilter
    ? sortedCategories.filter((c) => c === activeFilter)
    : sortedCategories;

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

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mb-10">
        <button
          onClick={() => setActiveFilter(null)}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
            !activeFilter
              ? 'bg-on-surface text-surface'
              : 'border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          Tumunu Goster
        </button>
        {CATEGORY_ORDER.filter((c) => grouped[c]).map((cat) => {
          const meta = CATEGORY_META[cat];
          return (
            <button
              key={cat}
              onClick={() => setActiveFilter(activeFilter === cat ? null : cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                activeFilter === cat
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
        <div className="space-y-14">
          {filteredCategories.map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <section key={cat}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-icon text-primary text-[24px]" aria-hidden="true">{meta?.icon || 'target'}</span>
                  <h2 className="text-xl font-bold text-on-surface">
                    {meta?.label || cat}
                  </h2>
                  <span className="label-caps text-outline">
                    ({grouped[cat].length})
                  </span>
                </div>
                {meta?.desc && (
                  <p className="text-sm text-on-surface-variant mb-5 ml-9">{meta.desc}</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {grouped[cat].map((need) => (
                    <Link
                      key={need.need_id}
                      href={`/ihtiyaclar/${need.need_slug}`}
                      className="curator-card p-5 group"
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
                        Detaylari gor
                        <span className="material-icon material-icon-sm" aria-hidden="true">arrow_forward</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
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
