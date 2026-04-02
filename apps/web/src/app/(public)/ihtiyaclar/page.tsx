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
    skin_concern: 'Cilt Sorunları',
    skin_goal: 'Cilt Hedefleri',
    sensitivity: 'Hassasiyetler',
  };
  return map[group] || group;
}

function groupIcon(group: string): string {
  const map: Record<string, string> = {
    skin_concern: '🔴',
    skin_goal: '✨',
    sensitivity: '⚠️',
  };
  return map[group] || '🎯';
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Cilt İhtiyaçları</h1>
      <p className="text-gray-500 mb-8">
        Cilt sorunlarını ve ihtiyaçlarını keşfet, her biri için en etkili içerik maddelerini öğren
      </p>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Yükleniyor...</div>
      ) : needs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🎯</p>
          <p className="text-gray-400">Henüz ihtiyaç tanımlanmamış</p>
        </div>
      ) : (
        <div className="space-y-10">
          {sortedGroups.map((group) => (
            <section key={group}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{groupIcon(group)}</span>
                <h2 className="text-xl font-bold text-gray-800">
                  {groupLabel(group)}
                </h2>
                <span className="text-sm text-gray-400">
                  ({grouped[group].length})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped[group].map((need) => (
                  <Link
                    key={need.need_id}
                    href={`/ihtiyaclar/${need.need_slug}`}
                    className="bg-white border rounded-xl p-5 hover:shadow-lg hover:border-primary/30 transition-all group"
                  >
                    <h3 className="font-bold text-gray-800 group-hover:text-primary transition-colors">
                      {need.need_name}
                    </h3>
                    {need.user_friendly_label && (
                      <p className="text-xs text-primary mt-1">
                        {need.user_friendly_label}
                      </p>
                    )}
                    {need.short_description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                        {need.short_description}
                      </p>
                    )}
                    <span className="inline-block text-xs text-primary font-medium mt-3">
                      Detayları gör &rarr;
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Profile CTA */}
      <div className="mt-12 bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Hangi İhtiyaçlar Seninle İlgili?
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Cilt profilini oluştur, sana özel ihtiyaç ve ürün önerileri al.
        </p>
        <Link
          href="/profilim"
          className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold"
        >
          Profilimi Oluştur
        </Link>
      </div>
    </div>
  );
}
