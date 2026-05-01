// MD → HTML batch (sonra browser'da Ctrl+P → PDF)
import { marked } from 'marked';
import { resolve, dirname, basename } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const FILES = [
  'SUNUM_DEMO_AKIS_4MAYIS.md',
  'SUNUM_QA_DATASET_4MAYIS.md',
  'MORNING_REPORT_REVELA_GECE_VARDIYASI_4_20260430.md',
  'MORNING_REPORT_REVELA_GECE_VARDIYASI_3_20260430.md',
  'podcast-pilot/SPOTIFY_DEPLOY_REHBERI.md',
];

const OUT_DIR = resolve(ROOT, 'pdf-exports');
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const CSS = `
  @page { size: A4; margin: 20mm; }
  body {
    font-family: 'Helvetica Neue', 'Segoe UI', Arial, sans-serif;
    line-height: 1.6;
    color: #1a1a1a;
    max-width: 800px;
    margin: 0 auto;
    padding: 24px;
  }
  h1 { color: #2c3e50; border-bottom: 2px solid #2c3e50; padding-bottom: 8px; page-break-after: avoid; }
  h2 { color: #34495e; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 24px; page-break-after: avoid; }
  h3 { color: #34495e; margin-top: 20px; page-break-after: avoid; }
  table { border-collapse: collapse; width: 100%; margin: 16px 0; }
  th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
  th { background-color: #f5f5f5; font-weight: 600; }
  code { background-color: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
  pre { background-color: #2d3748; color: #f7fafc; padding: 12px; border-radius: 6px; overflow-x: auto; page-break-inside: avoid; }
  pre code { background: transparent; color: inherit; padding: 0; }
  blockquote { border-left: 4px solid #4299e1; padding-left: 16px; color: #4a5568; margin: 16px 0; page-break-inside: avoid; }
  ul, ol { padding-left: 24px; }
  hr { border: none; border-top: 1px solid #ddd; margin: 24px 0; }
  @media print {
    body { padding: 0; }
    a { color: inherit; text-decoration: none; }
  }
`;

let success = 0;
for (const file of FILES) {
  const src = resolve(ROOT, file);
  if (!existsSync(src)) { console.log(`✗ ${file} bulunamadı`); continue; }

  const md = readFileSync(src, 'utf-8');
  const html = marked.parse(md);
  const fullHtml = `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>${basename(file, '.md')}</title><style>${CSS}</style></head><body>${html}</body></html>`;

  const outPath = resolve(OUT_DIR, basename(file).replace('.md', '.html'));
  writeFileSync(outPath, fullHtml);
  console.log(`✓ ${basename(outPath)}`);
  success++;
}

console.log(`\nBaşarılı: ${success}/${FILES.length}`);
console.log(`HTML dizini: ${OUT_DIR}`);
console.log(`\nPDF için: HTML dosyasını Edge'de aç → Ctrl+P → 'PDF olarak kaydet'`);
