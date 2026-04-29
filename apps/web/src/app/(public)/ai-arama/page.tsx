'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface ShortcutResult {
  type: 'shortcut';
  intent: string;
  title: string;
  description: string;
  caution?: string;
  products: Array<{ product_id: number; product_name: string; slug: string; image_url: string | null }>;
  ingredients: Array<{ ingredient_id: number; inci_name: string; inci_slug: string }>;
  posts: Array<{ post_id: number; slug: string; title: string; excerpt: string }>;
}
interface FallbackResult {
  type: 'fallback';
  query: string;
  products: Array<{ product_id: number; product_name: string; slug: string; image_url: string | null }>;
}
type Result = ShortcutResult | FallbackResult | { type: 'empty' };

export default function AiSearchPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await apiFetch<Result>('/ai-search', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });
      setResult(res);
    } catch (e: any) {
      setErr(e.message || 'Arama başarısız');
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="curator-section max-w-[1400px] mx-auto">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-icon text-primary text-[26px]" aria-hidden="true">auto_awesome</span>
          <h1 className="text-2xl md:text-3xl headline-tight text-on-surface">AI Arama</h1>
        </div>
        <p className="text-sm text-on-surface-variant max-w-2xl">
          Doğal dilde sor — REVELA seni doğru ürün, içerik veya rehbere yönlendirir.
        </p>
      </header>

      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 mb-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Örn: rozam var ne iyi gelir?"
          className="flex-1 rounded-sm border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="curator-btn-primary text-[10px] px-6 py-3 disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="material-icon text-[14px] animate-spin" aria-hidden="true">progress_activity</span>
              Aranıyor
            </>
          ) : (
            <>
              <span className="material-icon text-[14px]" aria-hidden="true">search</span>
              Ara
            </>
          )}
        </button>
      </form>

      {/* Quick examples — boş input için ilham */}
      {!result && !loading && !err && (
        <div className="mb-6">
          <p className="label-caps text-outline mb-2 text-[10px]">Örnek sorular</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              'rozam var ne iyi gelir',
              'hamilelikte güvenli içerikler',
              'akne için başlangıç rutini',
              'kuru cilt için nemlendirici',
              'göz altı morluğu için',
              'C vitamini en iyi marka',
              'hassas cilt güneş kremi',
              '40+ yaş için takviye',
            ].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => { setQuery(q); }}
                className="text-xs bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 hover:border-primary/40 rounded-full px-3 py-1.5 text-on-surface transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          <div className="curator-card p-4">
            <div className="h-4 bg-surface-container rounded w-1/3 mb-2" />
            <div className="h-3 bg-surface-container rounded w-2/3 mb-1" />
            <div className="h-3 bg-surface-container rounded w-1/2" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="curator-card p-2 h-12" />
            ))}
          </div>
        </div>
      )}

      {err && (
        <div className="mb-4 bg-error/5 border border-error/20 rounded-sm p-3 flex items-start gap-2">
          <span className="material-icon text-error text-[16px] mt-0.5" aria-hidden="true">error</span>
          <p className="text-xs text-error leading-relaxed">{err}</p>
        </div>
      )}

      {result && result.type === 'shortcut' && (
        <section className="space-y-4">
          <div className="curator-card p-4">
            <h2 className="text-lg font-bold text-on-surface mb-1">{result.title}</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">{result.description}</p>
            {result.caution && (
              <div className="mt-3 bg-score-medium/5 border border-score-medium/20 rounded-sm p-2 flex items-start gap-2">
                <span className="material-icon text-score-medium text-[14px] mt-0.5" aria-hidden="true">warning</span>
                <p className="text-xs text-score-medium leading-relaxed">{result.caution}</p>
              </div>
            )}
          </div>

          {result.products.length > 0 && (
            <div>
              <h3 className="label-caps text-outline mb-2">Önerilen ürünler</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {result.products.map((p) => (
                  <Link
                    key={p.product_id}
                    href={`/urunler/${p.slug}`}
                    className="curator-card p-2 hover:border-primary/30 transition-colors"
                  >
                    <p className="text-[11px] font-medium text-on-surface line-clamp-2 leading-tight">{p.product_name}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {result.ingredients.length > 0 && (
            <div>
              <h3 className="label-caps text-outline mb-2">İlgili içerikler</h3>
              <ul className="flex flex-wrap gap-1.5">
                {result.ingredients.map((i) => (
                  <li key={i.ingredient_id}>
                    <Link
                      href={`/icerikler/${i.inci_slug}`}
                      className="inline-flex items-center px-2.5 py-1 rounded-sm border border-outline-variant/30 text-xs text-on-surface hover:border-primary hover:text-primary transition-colors"
                    >
                      {i.inci_name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.posts.length > 0 && (
            <div>
              <h3 className="label-caps text-outline mb-2">Okuma önerileri</h3>
              <ul className="space-y-1.5">
                {result.posts.map((b) => (
                  <li key={b.post_id} className="curator-card p-2">
                    <Link href={`/rehber/${b.slug}`} className="text-sm font-medium text-on-surface hover:text-primary transition-colors">
                      {b.title}
                    </Link>
                    {b.excerpt && (
                      <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-2">{b.excerpt}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {result && result.type === 'fallback' && (
        <section>
          <p className="text-xs text-on-surface-variant mb-3">
            Spesifik bir rehber bulamadık ama eşleşen ürünler şunlar:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {result.products.map((p) => (
              <Link
                key={p.product_id}
                href={`/urunler/${p.slug}`}
                className="curator-card p-2 hover:border-primary/30 transition-colors"
              >
                <p className="text-[11px] font-medium text-on-surface line-clamp-2 leading-tight">{p.product_name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {result && result.type === 'empty' && (
        <div className="bg-surface-container-low rounded-sm p-6 text-center text-sm text-on-surface-variant">
          Bu sorgu için sonuç bulunamadı. Daha genel bir terim dene.
        </div>
      )}
    </article>
  );
}
