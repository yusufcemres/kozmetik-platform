'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';

interface BulkResult {
  passed: number;
  failed: number;
  reasonCounts: Record<string, number>;
}

export default function TagReviewPage() {
  const [result, setResult] = useState<BulkResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState('');
  const [singleResult, setSingleResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  async function runBulk() {
    setLoading(true);
    setErr(null);
    try {
      const res = await apiFetch<BulkResult>('/tag-validator/bulk?limit=200', { method: 'POST' });
      setResult(res);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function checkOne() {
    if (!productId) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await apiFetch<any>(`/tag-validator/check/${productId}`, { method: 'POST' });
      setSingleResult(res);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold">Tag Review & Publish Gate</h1>
      <p className="mt-2 text-neutral-600">
        Draft ürünlerde publish gate çalıştır, eksik tag/çakışma dağılımı gör.
      </p>

      <section className="mt-8 rounded-xl border border-neutral-200 p-6">
        <h2 className="font-semibold">Bulk Publish Gate</h2>
        <p className="mt-1 text-sm text-neutral-600">200 draft ürüne kadar çalışır, geçenler otomatik published olur.</p>
        <button
          onClick={runBulk}
          disabled={loading}
          className="mt-4 rounded-xl bg-neutral-900 px-5 py-2 text-white disabled:opacity-50"
        >
          {loading ? 'Çalışıyor...' : 'Çalıştır'}
        </button>

        {result && (
          <div className="mt-5 space-y-2 text-sm">
            <div>
              <span className="font-semibold text-emerald-700">Geçen:</span> {result.passed} ·{' '}
              <span className="font-semibold text-red-700">Kalan:</span> {result.failed}
            </div>
            <div>
              <div className="font-semibold">Sebep dağılımı:</div>
              <ul className="mt-1 list-inside list-disc">
                {Object.entries(result.reasonCounts).map(([k, v]) => (
                  <li key={k}>
                    {k}: {v}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      <section className="mt-8 rounded-xl border border-neutral-200 p-6">
        <h2 className="font-semibold">Tek Ürün Kontrolü</h2>
        <div className="mt-4 flex gap-2">
          <input
            type="number"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="product_id"
            className="flex-1 rounded-xl border border-neutral-300 px-4 py-2"
          />
          <button
            onClick={checkOne}
            disabled={loading}
            className="rounded-xl bg-neutral-900 px-5 py-2 text-white disabled:opacity-50"
          >
            Kontrol
          </button>
        </div>
        {singleResult && (
          <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-neutral-50 p-4 text-xs">
            {JSON.stringify(singleResult, null, 2)}
          </pre>
        )}
      </section>

      {err && <p className="mt-6 text-sm text-red-600">{err}</p>}
    </main>
  );
}
