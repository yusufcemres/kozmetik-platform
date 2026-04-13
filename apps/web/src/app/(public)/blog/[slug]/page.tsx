import { notFound } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PostDetail {
  post: {
    post_id: number;
    slug: string;
    title: string;
    excerpt: string;
    content_mdx: string;
    published_at: string | null;
    updated_at: string | null;
    og_image_url: string | null;
    reading_time_min: number | null;
    category: string | null;
    author_name: string | null;
    author_credentials: string | null;
    author_bio: string | null;
    author_slug: string | null;
    reviewer_name: string | null;
    reviewer_credentials: string | null;
    reviewer_title: string | null;
    reviewer_slug: string | null;
  };
  products: Array<{ product_id: number; product_name: string; slug: string; image_url: string | null }>;
  ingredients: Array<{ ingredient_id: number; inci_name: string; inci_slug: string }>;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const data = await apiFetch<PostDetail>(`/blog/posts/${params.slug}`);
    return {
      title: `${data.post.title} — REVELA`,
      description: data.post.excerpt,
      openGraph: {
        title: data.post.title,
        description: data.post.excerpt,
        images: data.post.og_image_url ? [data.post.og_image_url] : [],
      },
    };
  } catch {
    return { title: 'Blog — REVELA' };
  }
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  let data: PostDetail;
  try {
    data = await apiFetch<PostDetail>(`/blog/posts/${params.slug}`);
  } catch {
    return notFound();
  }
  const { post, products, ingredients } = data;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: post.author_name
      ? { '@type': 'Person', name: post.author_name, jobTitle: post.author_credentials }
      : undefined,
    reviewedBy: post.reviewer_name
      ? { '@type': 'Person', name: post.reviewer_name, jobTitle: post.reviewer_title }
      : undefined,
  };

  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-6 text-sm text-neutral-500">
        <Link href="/blog" className="hover:underline">Blog</Link>
        {post.category && <> / <span>{post.category}</span></>}
      </nav>

      <h1 className="text-3xl font-bold leading-tight">{post.title}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-neutral-600">
        {post.author_name && (
          <span>✍ {post.author_name}{post.author_credentials ? `, ${post.author_credentials}` : ''}</span>
        )}
        {post.reviewer_name && (
          <Link href={`/uzmanlar/${post.reviewer_slug}`} className="hover:underline">
            ✓ Tıbbi inceleme: {post.reviewer_name}
          </Link>
        )}
        {post.reading_time_min && <span>· {post.reading_time_min} dk okuma</span>}
      </div>

      <article className="prose prose-neutral mt-8 max-w-none whitespace-pre-wrap">
        {post.content_mdx}
      </article>

      {ingredients.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Bağlantılı İçerikler</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
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

      {products.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">İlgili Ürünler</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {products.map((p) => (
              <Link
                key={p.product_id}
                href={`/urunler/${p.slug}`}
                className="rounded-xl border border-neutral-200 p-4 hover:border-neutral-900"
              >
                {p.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt={p.product_name} className="mb-3 h-24 w-24 object-contain" />
                )}
                <div className="font-medium">{p.product_name}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
