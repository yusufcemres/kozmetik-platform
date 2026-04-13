import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export const metadata = {
  title: 'Blog — REVELA',
  description: 'Dermatolog incelemesinden geçmiş cilt bakımı, takviye ve içerik rehberleri.',
};

interface Post {
  post_id: number;
  slug: string;
  title: string;
  excerpt: string;
  og_image_url: string | null;
  published_at: string | null;
  reading_time_min: number | null;
  category: string | null;
  tags: string[] | null;
  author_name: string | null;
  reviewer_name: string | null;
}

export default async function BlogListPage() {
  let posts: Post[] = [];
  try {
    posts = await apiFetch<Post[]>('/blog/posts?limit=30');
  } catch {
    posts = [];
  }

  return (
    <main className="container mx-auto max-w-5xl px-4 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">REVELA Blog</h1>
        <p className="mt-2 text-neutral-600">
          Dermatolog incelemesinden geçmiş, kaynaklı cilt bakımı ve takviye rehberleri.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-neutral-500">Henüz yayınlanmış içerik yok.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.post_id}
              href={`/blog/${p.slug}`}
              className="group rounded-xl border border-neutral-200 p-5 transition hover:border-neutral-900"
            >
              {p.category && (
                <span className="text-xs uppercase tracking-wide text-neutral-500">
                  {p.category}
                </span>
              )}
              <h2 className="mt-2 text-lg font-semibold group-hover:underline">
                {p.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm text-neutral-600">{p.excerpt}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500">
                {p.reviewer_name && <span>✓ {p.reviewer_name}</span>}
                {p.reading_time_min && <span>· {p.reading_time_min} dk okuma</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
