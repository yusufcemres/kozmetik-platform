'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getUserToken, useUser } from '@/lib/user-auth';

type Review = {
  review_id: number;
  user_id: number;
  rating: number;
  title: string | null;
  body: string | null;
  helpful_count: number;
  verified_purchase: boolean;
  created_at: string;
  updated_at?: string;
  user_display_name: string | null;
};

type Aggregate = {
  rating_value: number | null;
  review_count: number;
  rating_distribution: Record<'1' | '2' | '3' | '4' | '5', number>;
};

type ListResponse = {
  aggregate: Aggregate;
  items: Review[];
  limit: number;
  offset: number;
};

function StarBar({ value, max = 5, size = 16 }: { value: number; max?: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} / ${max} yıldız`}>
      {Array.from({ length: max }, (_, i) => {
        const full = i + 1 <= Math.round(value);
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 20 20"
            fill={full ? '#FBBF24' : 'none'}
            stroke={full ? '#FBBF24' : '#9CA3AF'}
            strokeWidth="1.5"
          >
            <path d="M10 2l2.4 5 5.6.8-4 3.9 1 5.7L10 14.8 5 17.4l1-5.7-4-3.9 5.6-.8z" />
          </svg>
        );
      })}
    </span>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function ReviewsBlock({ productId }: { productId: number }) {
  const { user, isAuthenticated } = useUser();
  const [data, setData] = useState<ListResponse | null>(null);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<{ rating: number; title: string; body: string }>({
    rating: 5,
    title: '',
    body: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const d = await api.get<ListResponse>(`/products/${productId}/reviews?limit=20`);
      setData(d);
      if (user) {
        const mine = d.items.find((r) => r.user_id === user.user_id) ?? null;
        setMyReview(mine);
        if (mine && !editing) {
          setForm({ rating: mine.rating, title: mine.title ?? '', body: mine.body ?? '' });
        }
      }
    } catch {
      setData(null);
    }
  }, [productId, user, editing]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function submit() {
    setError(null);
    setSaving(true);
    try {
      const token = getUserToken();
      if (!token) throw new Error('Giriş yapmanız gerekiyor.');
      const payload = {
        rating: form.rating,
        title: form.title.trim() || null,
        body: form.body.trim() || null,
      };
      if (myReview) {
        await api.patch(`/reviews/${myReview.review_id}`, payload, { token });
      } else {
        await api.post(`/products/${productId}/reviews`, payload, { token });
      }
      setEditing(false);
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? 'Yorum gönderilemedi.');
    } finally {
      setSaving(false);
    }
  }

  async function removeMine() {
    if (!myReview) return;
    if (!confirm('Yorumunu silmek istediğine emin misin?')) return;
    try {
      const token = getUserToken();
      if (!token) return;
      await api.delete(`/reviews/${myReview.review_id}`, { token });
      setMyReview(null);
      setForm({ rating: 5, title: '', body: '' });
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? 'Silme başarısız.');
    }
  }

  const agg = data?.aggregate;

  return (
    <section className="curator-card p-5 mb-4" id="reviews">
      <div className="flex items-center justify-between mb-4">
        <h2 className="label-caps text-on-surface-variant tracking-[0.2em]">Kullanıcı Yorumları</h2>
        {agg && agg.review_count > 0 && agg.rating_value != null && (
          <div className="flex items-center gap-2">
            <StarBar value={agg.rating_value} />
            <span className="text-sm font-semibold text-on-surface">
              {agg.rating_value.toFixed(1)}
            </span>
            <span className="text-xs text-outline">({agg.review_count})</span>
          </div>
        )}
      </div>

      {agg && agg.review_count > 0 && (
        <div className="grid grid-cols-5 gap-2 mb-4">
          {(['5', '4', '3', '2', '1'] as const).map((k) => {
            const count = agg.rating_distribution[k] ?? 0;
            const pct = agg.review_count ? (count / agg.review_count) * 100 : 0;
            return (
              <div key={k} className="flex items-center gap-1.5 text-[11px] text-outline">
                <span className="w-3">{k}</span>
                <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${pct.toFixed(0)}%` }}
                  />
                </div>
                <span className="w-5 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Write/edit own review */}
      <div className="border-t border-outline-variant/20 pt-4 mb-4">
        {!isAuthenticated && (
          <p className="text-sm text-on-surface-variant">
            Yorum yazmak için{' '}
            <Link href="/giris" className="text-primary underline">
              giriş yap
            </Link>
            .
          </p>
        )}
        {isAuthenticated && !editing && !myReview && (
          <button
            onClick={() => setEditing(true)}
            className="text-sm px-4 py-2 rounded-sm bg-primary text-on-primary hover:opacity-90 transition"
          >
            Yorum yaz
          </button>
        )}
        {isAuthenticated && !editing && myReview && (
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <StarBar value={myReview.rating} />
                <span className="text-xs text-outline">
                  {formatDate(myReview.updated_at ?? myReview.created_at)} · Senin yorumun
                </span>
              </div>
              {myReview.title && (
                <p className="font-semibold text-sm text-on-surface">{myReview.title}</p>
              )}
              {myReview.body && (
                <p className="text-sm text-on-surface-variant mt-1">{myReview.body}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setEditing(true)}
                className="text-xs px-2 py-1 rounded-sm border border-outline-variant hover:bg-surface-container"
              >
                Düzenle
              </button>
              <button
                onClick={removeMine}
                className="text-xs px-2 py-1 rounded-sm border border-outline-variant text-score-low hover:bg-surface-container"
              >
                Sil
              </button>
            </div>
          </div>
        )}
        {isAuthenticated && editing && (
          <div className="space-y-3">
            <div>
              <label className="label-caps text-on-surface-variant mb-1 block">Puanın</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, rating: n }))}
                    aria-label={`${n} yıldız`}
                    className="p-0.5"
                  >
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 20 20"
                      fill={n <= form.rating ? '#FBBF24' : 'none'}
                      stroke={n <= form.rating ? '#FBBF24' : '#9CA3AF'}
                      strokeWidth="1.5"
                    >
                      <path d="M10 2l2.4 5 5.6.8-4 3.9 1 5.7L10 14.8 5 17.4l1-5.7-4-3.9 5.6-.8z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              value={form.title}
              maxLength={200}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Başlık (opsiyonel)"
              className="w-full border border-outline-variant rounded-sm px-3 py-2 text-sm"
            />
            <textarea
              value={form.body}
              maxLength={4000}
              rows={4}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="Deneyimini paylaş (opsiyonel)"
              className="w-full border border-outline-variant rounded-sm px-3 py-2 text-sm resize-y"
            />
            {error && <p className="text-xs text-score-low">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={submit}
                disabled={saving}
                className="text-sm px-4 py-2 rounded-sm bg-primary text-on-primary disabled:opacity-50"
              >
                {saving ? 'Gönderiliyor…' : myReview ? 'Güncelle' : 'Gönder'}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setError(null);
                  if (myReview)
                    setForm({
                      rating: myReview.rating,
                      title: myReview.title ?? '',
                      body: myReview.body ?? '',
                    });
                }}
                className="text-sm px-4 py-2 rounded-sm border border-outline-variant"
              >
                İptal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Everyone else's reviews */}
      <div className="space-y-4">
        {(data?.items ?? [])
          .filter((r) => !myReview || r.review_id !== myReview.review_id)
          .map((r) => (
            <div key={r.review_id} className="border-b border-outline-variant/15 last:border-0 pb-3 last:pb-0">
              <div className="flex items-center gap-2 mb-1">
                <StarBar value={r.rating} size={14} />
                <span className="text-xs font-semibold text-on-surface">
                  {r.user_display_name || 'Anonim'}
                </span>
                {r.verified_purchase && (
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-score-high/15 text-score-high rounded-sm">
                    Doğrulanmış
                  </span>
                )}
                <span className="text-[10px] text-outline ml-auto">{formatDate(r.created_at)}</span>
              </div>
              {r.title && <p className="font-semibold text-sm text-on-surface mb-1">{r.title}</p>}
              {r.body && (
                <p className="text-sm text-on-surface-variant whitespace-pre-wrap">{r.body}</p>
              )}
            </div>
          ))}
        {data && data.items.length === 0 && (
          <p className="text-sm text-on-surface-variant">
            Henüz yorum yok. İlk yorumu sen bırak.
          </p>
        )}
      </div>
    </section>
  );
}
