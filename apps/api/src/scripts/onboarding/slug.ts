/**
 * Turkish-aware slug generator. Replaces Turkish chars before kebab-case.
 * Used when auto-generating product_slug from product_name.
 */
const TR_MAP: Record<string, string> = {
  'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'İ': 'i',
  'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u',
};

export function slugify(s: string): string {
  const normalized = s
    .split('')
    .map((ch) => TR_MAP[ch] ?? ch)
    .join('');
  return normalized
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 290);
}
