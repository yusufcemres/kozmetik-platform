'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Need {
  need_id: number;
  need_name: string;
  need_slug: string;
  need_group?: string;
  short_description?: string;
  user_friendly_label?: string;
}

function groupLabel(group: string): string {
  const map: Record<string, string> = {
    skin_concern: 'Cilt Sorunlari',
    skin_goal: 'Cilt Hedefleri',
    sensitivity: 'Hassasiyetler',
  };
  return map[group] || group;
}

function groupIcon(group: string): string {
  const map: Record<string, string> = {
    skin_concern: 'error_outline',
    skin_goal: 'auto_awesome',
    sensitivity: 'warning_amber',
  };
  return map[group] || 'target';
}

export default function NeedsListPage() {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data: Need[]; meta: { total: number } }>('/needs?limit=100')
      .then((data) => setNeeds(data.data || []))
      .catch(() => setNeeds([]))
      .finally(() => setLoading(false));
  }, []);

  // Group needs by need_group
  const grouped = needs.reduce<Record<string, Need[]>>((acc, need) => {
    const group = need.need_group || 'other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(need);
    return acc;
  }, {});

  const groupOrder = ['skin_concern', 'skin_goal', 'sensitivity'];
  const sortedGroups = [
    ...groupOrder.filter((g) => grouped[g]),
    ...Object.keys(grouped).filter((g) => !groupOrder.includes(g)),
  ];

  return (
    <div className="curator-section max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <span className="label-caps text-outline block mb-2 tracking-[0.3em]">Kesfet</span>
        <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface">CILT IHTIYACLARI</h1>
        <p className="text-on-surface-variant text-sm mt-2">
          Cilt sorunlarini ve ihtiyaclarini kesfet, her biri icin en etkili icerik maddelerini ogren
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <p className="text-on-surface-variant">Henuz ihtiyac tanimlanmamis</p>
        </div>
      ) : (
        <div className="space-y-12">
          {sortedGroups.map((group) => (
            <section key={group}>
              <div className="flex items-center gap-3 mb-5">
                <span className="material-icon text-primary" aria-hidden="true">{groupIcon(group)}</span>
                <h2 className="text-xl font-bold text-on-surface">
                  {groupLabel(group)}
                </h2>
                <span className="label-caps text-outline">
                  ({grouped[group].length})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped[group].map((need) => (
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
          ))}
        </div>
      )}

      {/* Profile CTA */}
      <div className="mt-16 curator-card p-8 text-center">
        <h3 className="text-xl headline-tight text-on-surface mb-2">
          HANGI IHTIYACLAR SENINLE ILGILI?
        </h3>
        <p className="text-sm text-on-surface-variant mb-6">
          Cilt profilini olustur, sana ozel ihtiyac ve urun onerileri al.
        </p>
        <Link
          href="/profilim"
          className="curator-btn-primary text-[10px] px-8 py-3 inline-block"
        >
          PROFILIMI OLUSTUR
        </Link>
      </div>
    </div>
  );
}
