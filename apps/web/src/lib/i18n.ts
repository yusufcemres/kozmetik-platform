/**
 * i18n iskelet (Madde 25e).
 *
 * Şu an Türkçe-only ama runtime'da dil değiştirilebilir altyapı. Tüm metinler
 * `t('key')` ile alınır → ileride AR/EN eklemek için locale dosyalarına ekleme yeterli.
 *
 * Production'da i18next/next-intl entegrasyonu kuruluncaya kadar, bu basit
 * key-value lookup pattern'i. Yeni key ekleyenler önce buraya, sonra
 * locales/tr.ts'ye eklesin.
 *
 * Q3 2027'de AR + EN için locales/ar.ts + locales/en.ts dosyaları eklenir.
 */
import { tr } from './locales/tr';

export type Locale = 'tr' | 'en' | 'ar';

const dictionaries: Record<Locale, Record<string, string>> = {
  tr,
  en: {}, // Q3 2027
  ar: {}, // Q3 2027
};

let currentLocale: Locale = 'tr';

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

/**
 * Çeviri lookup. Key bulunamazsa key'in kendisi döner (fallback) — UI bozulmaz.
 * Param substitution: `t('greeting', { name: 'Ada' })` → "Merhaba, {name}!" template.
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const dict = dictionaries[currentLocale] || {};
  let text = dict[key] || key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return text;
}
