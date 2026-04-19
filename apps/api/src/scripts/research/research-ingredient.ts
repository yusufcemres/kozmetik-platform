/**
 * Research helper — Gemini + URL scrape → Türkçe ingredient taslağı.
 *
 * Bu tool DB'YE YAZMAZ. Sadece terminale JSON taslağı basar. İnsan editör
 * inceler, düzeltir, `products-queue/<product>.json` içine elle kopyalar.
 *
 * Akış:
 *   1. Tavily Extract ile 1-3 kaynak URL'i fetch et
 *   2. İngilizce özet + prompt template → Gemini
 *   3. Stdout'a JSON bas
 *
 * Usage:
 *   ts-node research-ingredient.ts <ingredient-slug> <url1> [url2...]
 *
 * Env:
 *   TAVILY_API_KEY       (zorunlu, URL içerik scrape için)
 *   GEMINI_API_KEY       (zorunlu)
 *   GEMINI_MODEL=gemini-2.0-flash  (opsiyonel, default)
 */
import * as fs from 'fs';
import * as path from 'path';

const TAVILY_KEY = process.env.TAVILY_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';

async function tavilyFetch(urls: string[]): Promise<string> {
  if (!TAVILY_KEY) throw new Error('TAVILY_API_KEY yok.');
  const res = await fetch('https://api.tavily.com/extract', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TAVILY_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls, include_images: false, extract_depth: 'advanced' }),
  });
  if (!res.ok) throw new Error(`Tavily ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data: any = await res.json();
  const chunks = (data?.results ?? []).map((r: any) => {
    const body = (r.raw_content ?? r.content ?? '').slice(0, 8000);
    return `## ${r.url}\n\n${body}\n`;
  });
  return chunks.join('\n---\n');
}

async function geminiComplete(prompt: string): Promise<string> {
  if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY yok.');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 2048, responseMimeType: 'application/json' },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data: any = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini cevapta text yok.');
  return text;
}

async function main(): Promise<void> {
  const [slug, ...urls] = process.argv.slice(2);
  if (!slug || urls.length === 0) {
    console.error('Kullanım: research-ingredient.ts <ingredient-slug> <url1> [url2...]');
    process.exit(1);
  }

  const promptFile = path.resolve(__dirname, 'prompts/ingredient-template.md');
  const template = fs.readFileSync(promptFile, 'utf-8');

  console.error(`[1/3] Tavily fetch — ${urls.length} URL...`);
  const scraped = await tavilyFetch(urls);

  const prompt = [
    template,
    '',
    '---',
    '',
    `## Hedef slug: ${slug}`,
    '',
    '## Kaynak metinler:',
    '',
    scraped,
  ].join('\n');

  console.error(`[2/3] Gemini (${GEMINI_MODEL}) çağrılıyor...`);
  const text = await geminiComplete(prompt);

  console.error(`[3/3] Çıktı:\n`);
  // Ham JSON metin. Ekstra '```' blokları varsa temizle.
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  console.log(cleaned);
}

main().catch((e) => {
  console.error(`❌ ${e?.stack ?? e?.message ?? e}`);
  process.exit(1);
});
