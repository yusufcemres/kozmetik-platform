'use client';

import { useEffect, useState } from 'react';

interface Props {
  productId: number;
  ingredients?: Array<{ ingredient?: { inci_name: string; allergen_flag?: boolean; fragrance_flag?: boolean } }>;
}

const SENSITIVITY_KEYWORDS: Record<string, RegExp> = {
  fragrance: /(fragrance|parfum|linalool|limonene|citronellol|geraniol)/i,
  alcohol: /(alcohol denat|ethanol|isopropyl alcohol)/i,
  paraben: /paraben/i,
  essential_oils: /(tea tree|lavender|eucalyptus|peppermint) oil/i,
  retinol: /(retinol|retinyl|retinaldehyde)/i,
  aha_bha: /(glycolic|salicylic|lactic|mandelic) acid/i,
};

export function AllergyAlertBanner({ productId, ingredients }: Props) {
  const [matches, setMatches] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('skin_profile');
      if (!stored) return;
      const prof = JSON.parse(stored);
      const sens: Record<string, boolean> = prof.sensitivities || {};
      const active = Object.entries(sens).filter(([, v]) => v).map(([k]) => k);
      if (active.length === 0 || !ingredients) return;
      const inciList = ingredients.map((i) => i.ingredient?.inci_name || '').filter(Boolean);
      const hits = new Set<string>();
      for (const key of active) {
        const rx = SENSITIVITY_KEYWORDS[key];
        if (!rx) continue;
        for (const name of inciList) {
          if (rx.test(name)) hits.add(name);
        }
      }
      setMatches(Array.from(hits));
    } catch {}
  }, [productId, ingredients]);

  if (matches.length === 0) return null;

  return (
    <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <strong>Profilindeki hassasiyet uyarısı:</strong> Bu ürün{' '}
      {matches.slice(0, 4).join(', ')} içerir.
    </div>
  );
}
