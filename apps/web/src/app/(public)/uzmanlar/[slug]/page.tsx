import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ReviewerDetail {
  reviewer: {
    reviewer_id: number;
    name: string;
    title: string | null;
    credentials: string | null;
    specialty: string | null;
    bio: string | null;
    avatar_url: string | null;
    license_no: string | null;
  };
  posts: Array<{ slug: string; title: string; excerpt: string | null; published_at: string | null }>;
  ingredients: Array<{ ingredient_id: number; inci_name: string; inci_slug: string }>;
}

export default async function ReviewerDetailPage({ params }: { params: { slug: string } }) {
  let data: ReviewerDetail;
  try {
    data = await apiFetch<ReviewerDetail>(`/blog/reviewers/${params.slug}`);
  } catch {
    return notFound();
  }
  const { reviewer, posts, ingredients } = data;

  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <section className="flex gap-6">
        {reviewer.avatar_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={reviewer.avatar_url} alt={reviewer.name} className="h-24 w-24 rounded-full object-cover" />
        )}
        <div>
          <h1 className="text-2xl font-bold">{reviewer.name}</h1>
          {reviewer.title && <div className="text-neutral-600">{reviewer.title}</div>}
          {reviewer.credentials && <div className="mt-1 text-sm text-neutral-500">{reviewer.credentials}</div>}
          {reviewer.license_no && (
            <div className="mt-1 text-xs text-neutral-500">Diploma No: {reviewer.license_no}</div>
          )}
        </div>
      </section>

      {reviewer.bio && <p className="mt-6 text-neutral-700">{reviewer.bio}</p>}

      {posts.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">İncelenen Blog Makaleleri</h2>
          <ul className="mt-4 space-y-3">
            {posts.map((p) => (
              <li key={p.slug} className="border-b border-neutral-200 pb-3">
                <Link href={`/blog/${p.slug}`} className="font-medium hover:underline">
                  {p.title}
                </Link>
                {p.excerpt && <p className="mt-1 text-sm text-neutral-600">{p.excerpt}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {ingredients.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">İncelenen İçerik Sayfaları</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {ingredients.map((i) => (
              <li key={i.ingredient_id}>
                <Link
                  href={`/icerikler/${i.inci_slug}`}
                  className="rounded-full border border-neutral-300 px-3 py-1 text-sm hover:border-neutral-900"
                >
                  {i.inci_name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
