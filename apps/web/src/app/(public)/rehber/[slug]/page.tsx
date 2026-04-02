import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface Article {
  article_id: number;
  title: string;
  slug: string;
  content_type: string;
  summary?: string;
  body_markdown?: string;
  published_at?: string;
}

async function getArticle(slug: string): Promise<Article | null> {
  try {
    return await apiFetch<Article>(`/articles/slug/${slug}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) return { title: 'Makale bulunamadı' };

  return {
    title: article.title,
    description: article.summary || `${article.title} — Kozmetik Platform Rehber`,
    openGraph: {
      title: article.title,
      description: article.summary || '',
      type: 'article',
      publishedTime: article.published_at,
    },
  };
}

const CONTENT_TYPES: Record<string, { label: string; icon: string }> = {
  guide: { label: 'Rehber', icon: '📖' },
  ingredient_explainer: { label: 'İçerik İnceleme', icon: '🧪' },
  need_guide: { label: 'İhtiyaç Rehberi', icon: '🎯' },
  label_reading: { label: 'Etiket Okuma', icon: '🏷️' },
  comparison: { label: 'Karşılaştırma', icon: '⚖️' },
  news: { label: 'Haber', icon: '📰' },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Simple markdown-to-HTML: supports ## headings, **bold**, - lists, paragraphs
function renderMarkdown(md: string): string {
  return md
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      // Headings
      if (trimmed.startsWith('### '))
        return `<h3 class="text-lg font-bold text-gray-900 mt-6 mb-2">${trimmed.slice(4)}</h3>`;
      if (trimmed.startsWith('## '))
        return `<h2 class="text-xl font-bold text-gray-900 mt-8 mb-3">${trimmed.slice(3)}</h2>`;
      if (trimmed.startsWith('# '))
        return `<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-3">${trimmed.slice(2)}</h1>`;
      // List block
      if (trimmed.startsWith('- ')) {
        const items = trimmed
          .split('\n')
          .filter((l) => l.startsWith('- '))
          .map((l) => `<li class="ml-4">${inlineFormat(l.slice(2))}</li>`)
          .join('');
        return `<ul class="list-disc space-y-1 my-3 text-gray-700">${items}</ul>`;
      }
      // Paragraph
      return `<p class="text-gray-700 leading-relaxed my-3">${inlineFormat(trimmed.replace(/\n/g, '<br/>'))}</p>`;
    })
    .join('');
}

function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>');
}

export default async function GuideDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticle(params.slug);
  if (!article) notFound();

  const cfg = CONTENT_TYPES[article.content_type] || CONTENT_TYPES.guide;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/rehber" className="hover:text-primary transition-colors">
          Rehber
        </Link>
        <span>/</span>
        <span className="text-gray-600 truncate">{article.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{cfg.icon}</span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
            {cfg.label}
          </span>
          {article.published_at && (
            <span className="text-xs text-gray-400">
              {formatDate(article.published_at)}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{article.title}</h1>
        {article.summary && (
          <p className="text-lg text-gray-600 leading-relaxed">{article.summary}</p>
        )}
      </header>

      {/* Body */}
      {article.body_markdown ? (
        <article
          className="prose-custom"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(article.body_markdown) }}
        />
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📝</p>
          <p>Makale içeriği henüz eklenmemiş</p>
        </div>
      )}

      {/* Back link */}
      <div className="mt-12 pt-6 border-t">
        <Link
          href="/rehber"
          className="text-sm text-primary hover:underline"
        >
          &larr; Tüm rehberler
        </Link>
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description: article.summary || '',
            datePublished: article.published_at,
            publisher: {
              '@type': 'Organization',
              name: 'Kozmetik Platform',
              url: 'https://kozmetikplatform.com',
            },
          }),
        }}
      />
    </div>
  );
}
