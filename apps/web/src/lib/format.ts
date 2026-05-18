/**
 * Format utilities — DRY paylaşımlı yardımcılar.
 *
 * 2026-05-15 Madde 23 V1: formatPrice 2 sayfada duplicate idi
 * (urunler/[slug] + takviyeler/[slug]); buraya çekildi.
 * 2026-05-19 V2: formatTL (PriceChart) + formatTL kurus (admin/payments) dedupe.
 */

const trCurrency = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });
const trCurrencyInt = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * TL fiyat formatla (kuruş ondalık, ₺ sembolü).
 * Boş/sıfır/null → '' (UI'da göstermeme).
 */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || price === 0 || Number.isNaN(price)) return '';
  return trCurrency.format(price);
}

/**
 * TL fiyat tam sayı (kuruş yok). Grafiklerin Y-ekseni vb. için.
 */
export function formatPriceInt(price: number): string {
  return trCurrencyInt.format(price);
}

/**
 * Kuruştan TL formatına çevir (PayTR + payments tablosu kurus saklar).
 * Ondalık yok, tam sayı.
 */
export function formatPriceFromKurus(kurus: number): string {
  return trCurrencyInt.format(kurus / 100);
}
