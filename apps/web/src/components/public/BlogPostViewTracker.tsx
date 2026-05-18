'use client';

import { useEffect } from 'react';
import { GAEvents } from '@/lib/analytics';

/**
 * Blog detay sayfasında mount edilen client tracker — sunucu render
 * korunur, sadece bu mini component client-side GA4 event atar.
 *
 * Kullanım: blog/[slug]/page.tsx içinde sunucudan slug + title ver,
 * <BlogPostViewTracker slug={post.slug} title={post.title} /> mount et.
 */
export function BlogPostViewTracker({ slug, title }: { slug: string; title?: string }) {
  useEffect(() => {
    GAEvents.blogPostView(slug, title);
  }, [slug, title]);
  return null;
}
