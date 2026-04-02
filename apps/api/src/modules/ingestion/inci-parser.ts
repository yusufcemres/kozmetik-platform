export interface ParsedIngredient {
  raw: string;
  normalized: string;
  order: number;
}

/**
 * Parse raw INCI text into ordered ingredient list.
 * Handles: comma-separated, parenthesized sub-ingredients, CI numbers,
 * newlines, extra whitespace, and common formatting issues.
 */
export function parseInciText(raw: string): ParsedIngredient[] {
  if (!raw || !raw.trim()) return [];

  // Normalize whitespace and line breaks
  let text = raw
    .replace(/\r?\n/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();

  // Remove trailing period if present
  text = text.replace(/\.\s*$/, '');

  // Split on commas, but not commas inside parentheses
  const parts: string[] = [];
  let depth = 0;
  let current = '';

  for (const ch of text) {
    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts
    .filter((p) => p.length > 0)
    .map((raw, index) => ({
      raw,
      normalized: normalizeIngredientName(raw),
      order: index + 1,
    }));
}

function normalizeIngredientName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^\d+[\.\)]\s*/, '') // Remove leading numbers like "1. " or "1)"
    .replace(/\*+/g, '')          // Remove asterisks (organic markers)
    .trim();
}
