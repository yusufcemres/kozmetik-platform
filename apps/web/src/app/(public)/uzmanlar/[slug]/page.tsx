import type { Metadata } from 'next';
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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const data = await apiFetch<ReviewerDetail>(`/blog/reviewers/${params.slug}`);
    const r = data.reviewer;
    const titleLine = r.title ? `${r.name}, ${r.title}` : r.name;
    const description = r.bio
      ? r.bio.slice(0, 160)
      : `${titleLine}${r.specialty ? ` — ${r.specialty}` : ''}. REVELA bilim kurulu uzmanının yazıları, INCI yorumları ve kanıt değerlendirmeleri.`;
    return {
      title: titleLine,
      description,
      openGraph: {
        title: `${titleLine} | REVELA Uzman`,
        description,
        type: 'profile',
        images: r.avatar_url ? [{ url: r.avatar_url, alt: r.name }] : undefined,
      },
      alternates: { canonical: `/uzmanlar/${params.slug}` },
    };
  } catch {
    return { title: 'Uzman', description: 'REVELA bilim kurulu uzman profili.' };
  }
}

export default async function ReviewerDetailPage({ params }: { params: { slug: string } }) {
  let data: ReviewerDetail;
  try {
    data = await apiFetch<ReviewerDetail>(`/blog/reviewers/${params.slug}`);
  } catch {
    return notFound();
  }
  const { reviewer, posts, ingredients } = data;

  // JSON-LD Person schema (Madde 14): SEO + Google Knowledge Graph için bilim kurulu uzmanı.
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: reviewer.name,
    jobTitle: reviewer.title || undefined,
    description: reviewer.bio || undefined,
    image: reviewer.avatar_url || undefined,
    knowsAbout: reviewer.specialty || undefined,
    identifier: reviewer.license_no ? { '@type': 'PropertyValue', propertyID: 'Diploma No', value: reviewer.license_no } : undefined,
    affiliation: { '@type': 'Organization', name: 'REVELA' },
  };

  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
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
