'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface DashboardData {
  stats: {
    product_count: number;
    total_questions: number;
    unanswered_questions: number;
    certificate_count: number;
  };
  transparency: {
    overall: number;
    grade: string;
    breakdown: {
      product_completeness: number;
      ingredient_transparency: number;
      certification_trust: number;
      community_engagement: number;
      scientific_evidence: number;
    };
  };
  recent_questions: any[];
}

const GRADE_COLORS: Record<string, string> = {
  S: 'text-yellow-500',
  A: 'text-green-600 dark:text-green-400',
  B: 'text-green-500 dark:text-green-300',
  C: 'text-yellow-500 dark:text-yellow-400',
  D: 'text-orange-500 dark:text-orange-400',
  F: 'text-gray-400',
};

export default function BrandDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('brand_token');
    if (!token) {
      window.location.href = '/brand-portal/login';
      return;
    }

    fetch(`${API_URL}/brand-portal/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Yetkilendirme hatası');
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const { stats, transparency, recent_questions } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-on-surface">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="inventory_2" label="Ürünler" value={stats.product_count} />
        <StatCard
          icon="forum"
          label="Cevaplanmamış"
          value={stats.unanswered_questions}
          accent={stats.unanswered_questions > 0}
        />
        <StatCard icon="help_outline" label="Toplam Soru" value={stats.total_questions} />
        <StatCard icon="verified" label="Sertifika" value={stats.certificate_count} />
      </div>

      {/* Transparency Score */}
      <div className="bg-surface rounded-xl border border-outline-variant/30 p-6">
        <h2 className="text-lg font-semibold text-on-surface mb-4">Şeffaflık Skoru</h2>
        <div className="flex items-center gap-6 mb-6">
          <div className="text-center">
            <div className={`text-4xl font-bold ${GRADE_COLORS[transparency.grade] || ''}`}>
              {transparency.overall}
            </div>
            <div className={`text-sm font-medium ${GRADE_COLORS[transparency.grade] || ''}`}>
              Sınıf {transparency.grade}
            </div>
          </div>
          <div className="flex-1">
            <div className="w-full bg-surface-container rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all"
                style={{ width: `${transparency.overall}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <BreakdownItem label="Ürün Bilgi" value={transparency.breakdown.product_completeness} max={25} />
          <BreakdownItem label="İçerik Şeffaflığı" value={transparency.breakdown.ingredient_transparency} max={25} />
          <BreakdownItem label="Sertifika" value={transparency.breakdown.certification_trust} max={20} />
          <BreakdownItem label="Etkileşim" value={transparency.breakdown.community_engagement} max={15} />
          <BreakdownItem label="Bilimsel Kanıt" value={transparency.breakdown.scientific_evidence} max={15} />
        </div>
      </div>

      {/* Recent Questions */}
      <div className="bg-surface rounded-xl border border-outline-variant/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-on-surface">Son Sorular</h2>
          <Link
            href="/brand-portal/questions"
            className="text-sm text-primary hover:underline"
          >
            Tümünü gör →
          </Link>
        </div>

        {recent_questions.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-4">Henüz soru yok.</p>
        ) : (
          <div className="space-y-3">
            {recent_questions.map((q: any) => (
              <div
                key={q.question_id}
                className="flex items-start gap-3 p-3 rounded-lg bg-surface-container"
              >
                <span
                  className={`material-symbols-outlined text-xl ${
                    q.status === 'pending' ? 'text-orange-500' : 'text-green-500'
                  }`}
                >
                  {q.status === 'pending' ? 'schedule' : 'check_circle'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-on-surface line-clamp-2">{q.question}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-on-surface-variant capitalize">
                      {q.category}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {new Date(q.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
                {q.status === 'pending' && (
                  <Link
                    href={`/brand-portal/questions`}
                    className="text-xs text-primary hover:underline shrink-0"
                  >
                    Yanıtla
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionCard
          href="/brand-portal/products"
          icon="edit_note"
          title="Ürün Bilgilerini Güncelle"
          description="INCI doğrulama, konsantrasyon girişi"
        />
        <ActionCard
          href="/brand-portal/certificates"
          icon="upload_file"
          title="Sertifika Yükle"
          description="GMP, dermatolog testi, klinik çalışma"
        />
        <ActionCard
          href="/brand-portal/questions"
          icon="chat"
          title="Soruları Yanıtla"
          description={`${stats.unanswered_questions} soru bekliyor`}
        />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: string;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="bg-surface rounded-xl border border-outline-variant/30 p-4">
      <span className={`material-symbols-outlined text-2xl ${accent ? 'text-orange-500' : 'text-on-surface-variant'}`}>
        {icon}
      </span>
      <div className={`text-2xl font-bold mt-2 ${accent ? 'text-orange-500' : 'text-on-surface'}`}>
        {value}
      </div>
      <div className="text-xs text-on-surface-variant">{label}</div>
    </div>
  );
}

function BreakdownItem({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="text-center">
      <div className="text-xs text-on-surface-variant mb-1">{label}</div>
      <div className="text-sm font-semibold text-on-surface">
        {value}/{max}
      </div>
      <div className="w-full bg-surface-container rounded-full h-1.5 mt-1">
        <div
          className="bg-primary h-1.5 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="bg-surface rounded-xl border border-outline-variant/30 p-4 hover:border-primary/50 transition-colors group"
    >
      <span className="material-symbols-outlined text-2xl text-primary group-hover:text-primary/80">
        {icon}
      </span>
      <h3 className="text-sm font-medium text-on-surface mt-2">{title}</h3>
      <p className="text-xs text-on-surface-variant mt-1">{description}</p>
    </Link>
  );
}
