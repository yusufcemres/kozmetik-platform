/**
 * Format utilities — DRY paylaşımlı yardımcılar.
 *
 * 2026-05-15 Madde 23: formatPrice 2 sayfada duplicate idi
 * (urunler/[slug] + takviyeler/[slug]); buraya çekildi.
 */

const trCurrency = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });

export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || price === 0 || Number.isNaN(price)) return '';
  return trCurrency.format(price);
}
