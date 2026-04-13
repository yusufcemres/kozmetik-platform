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
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">AI Arama</h1>
        <p className="mt-2 text-neutral-600">
          Doğal dilde sor: "rozam var ne iyi gelir", "hamilelikte güvenli içerikler", "akne için başlangıç".
        </p>
      </header>

      <form onSubmit={submit} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ne arıyorsun?"
          className="flex-1 rounded-xl border border-neutral-300 px-4 py-3 text-base focus:border-neutral-900 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-neutral-900 px-6 py-3 text-white disabled:opacity-50"
        >
          {loading ? '...' : 'Ara'}
        </button>
      </form>

      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}

      {result && result.type === 'shortcut' && (
        <section className="mt-10 space-y-6">
          <div className="rounded-xl border border-neutral-200 p-6">
            <h2 className="text-xl font-semibold">{result.title}</h2>
            <p className="mt-2 text-neutral-700">{result.description}</p>
            {result.caution && (
              <p className="mt-3 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-900">
                ⚠ {result.caution}
              </p>
            )}
          </div>

          {result.products.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase text-neutral-500">Önerilen ürünler</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {result.products.map((p) => (
                  <Link
                    key={p.product_id}
                    href={`/urunler/${p.slug}`}
                    className="rounded-lg border border-neutral-200 p-3 hover:border-neutral-900"
                  >
                    {p.product_name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {result.ingredients.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase text-neutral-500">İlgili içerikler</h3>
              <ul className="flex flex-wrap gap-2">
                {result.ingredients.map((i) => (
                  <li key={i.ingredient_id}>
                    <Link
                      href={`/icerikler/${i.inci_slug}`}
                      className="rounded-full border border-neutral-300 px-3 py-1 text-sm hover:border-neutral-900"
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
              <h3 className="mb-3 text-sm font-semibold uppercase text-neutral-500">Okuma önerileri</h3>
              <ul className="space-y-2">
                {result.posts.map((b) => (
                  <li key={b.post_id}>
                    <Link href={`/blog/${b.slug}`} className="text-neutral-900 hover:underline">
                      {b.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {result && result.type === 'fallback' && (
        <section className="mt-10">
          <p className="mb-4 text-sm text-neutral-500">
            Spesifik bir rehber bulamadık ama eşleşen ürünler şunlar:
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {result.products.map((p) => (
              <Link
                key={p.product_id}
                href={`/urunler/${p.slug}`}
                className="rounded-lg border border-neutral-200 p-3 hover:border-neutral-900"
              >
                {p.product_name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
