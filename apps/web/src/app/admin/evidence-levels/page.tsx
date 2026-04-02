'use client';

import PageHeader from '@/components/admin/PageHeader';

const evidenceLevels = [
  { key: 'systematic_review', name: 'Sistematik Derleme', emoji: '🟢', color: '#22c55e', rank: 1 },
  { key: 'randomized_controlled', name: 'Randomize Kontrollü', emoji: '🟢', color: '#22c55e', rank: 2 },
  { key: 'cohort_study', name: 'Kohort Çalışması', emoji: '🟡', color: '#eab308', rank: 3 },
  { key: 'case_control', name: 'Vaka Kontrol', emoji: '🟡', color: '#eab308', rank: 4 },
  { key: 'expert_opinion', name: 'Uzman Görüşü', emoji: '🟠', color: '#f97316', rank: 5 },
  { key: 'in_vitro', name: 'In Vitro', emoji: '🟠', color: '#f97316', rank: 6 },
  { key: 'traditional_use', name: 'Geleneksel Kullanım', emoji: '🔵', color: '#3b82f6', rank: 7 },
  { key: 'anecdotal', name: 'Anekdot', emoji: '🔵', color: '#3b82f6', rank: 8 },
];

export default function EvidenceLevelsPage() {
  return (
    <div>
      <PageHeader title="Kanıt Seviyeleri" description="8 seviyeli kanıt piramidi" />

      <div className="bg-white rounded-lg shadow">
        {evidenceLevels.map((level) => (
          <div
            key={level.key}
            className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{level.emoji}</span>
              <div>
                <p className="font-medium">{level.name}</p>
                <p className="text-xs text-gray-400">{level.key}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: level.color }}
              />
              <span className="text-sm text-gray-500">Sıra: {level.rank}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
