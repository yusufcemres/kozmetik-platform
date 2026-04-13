import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export const metadata = {
  title: 'Tıbbi Danışma Kurulu — REVELA',
  description: 'REVELA içeriklerini inceleyen uzmanlar: dermatologlar, eczacılar, beslenme uzmanları.',
};

interface Reviewer {
  reviewer_id: number;
  name: string;
  title: string | null;
  credentials: string | null;
  specialty: string | null;
  avatar_url: string | null;
  public_slug: string;
}

export default async function ReviewersPage() {
  let reviewers: Reviewer[] = [];
  try {
    reviewers = await apiFetch<Reviewer[]>('/blog/reviewers');
  } catch {
    reviewers = [];
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">Tıbbi Danışma Kurulu</h1>
        <p className="mt-2 text-neutral-600">
          REVELA'daki blog ve içerik sayfaları aşağıdaki uzmanların editöryal incelemesinden geçer.
          Bu sayfa ürün onayı değil, bilgi doğrulama referansıdır.
        </p>
      </header>

      {reviewers.length === 0 ? (
        <p className="text-neutral-500">Henüz inceleme uzmanı eklenmemiş.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {reviewers.map((r) => (
            <Link
              key={r.reviewer_id}
              href={`/uzmanlar/${r.public_slug}`}
              className="flex gap-4 rounded-xl border border-neutral-200 p-5 hover:border-neutral-900"
            >
              {r.avatar_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.avatar_url} alt={r.name} className="h-16 w-16 rounded-full object-cover" />
              )}
              <div>
                <div className="font-semibold">{r.name}</div>
                {r.title && <div className="text-sm text-neutral-600">{r.title}</div>}
                {r.specialty && <div className="mt-1 text-xs text-neutral-500">{r.specialty}</div>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
