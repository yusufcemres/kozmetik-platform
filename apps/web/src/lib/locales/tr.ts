/**
 * Türkçe locale (default) — Madde 25e i18n iskelet.
 *
 * Yeni key ekleyenler önce `lib/i18n.ts` Dictionary type'ına bakmaz,
 * direkt buraya eklesin. AR + EN Q3 2027'de gelecek (memory: project_revela_foto_analiz_v2).
 */
export const tr: Record<string, string> = {
  // Empty states
  'empty.no_results': 'Sonuç bulunamadı',
  'empty.no_results_desc': 'Arama kriterlerini değiştirip tekrar dene.',
  'empty.no_history': 'Henüz tarama yapmadın',
  'empty.no_history_desc': 'İlk taramanı yap, geçmişin burada birikecek.',
  'empty.no_favorites': 'Favori listen boş',
  'empty.no_favorites_desc': 'Beğendiğin ürünleri favorile, burada toplansın.',
  'empty.no_payments': 'Henüz ödeme yapmadın',
  'empty.no_payments_desc': 'Premium tier ile ödeme geçmişin burada görünecek.',
  'empty.no_analyses': 'Henüz analiz yapmadın',
  'empty.no_analyses_desc': 'Foto cilt analizi ile başlayabilirsin.',

  // CTA
  'cta.go_back_home': 'Anasayfaya dön',
  'cta.start_scan': 'İlk taramana başla',
  'cta.start_analysis': 'Foto analizine başla',
  'cta.browse_products': 'Ürünlere göz at',
  'cta.upgrade_premium': 'Premium\'a yükselt',

  // Common
  'common.loading': 'Yükleniyor…',
  'common.error_generic': 'Bir hata oluştu',
  'common.try_again': 'Tekrar dene',
  'common.cancel': 'İptal',
  'common.confirm': 'Onayla',
  'common.save': 'Kaydet',
  'common.delete': 'Sil',
};
