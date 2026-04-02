export default function GuideDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <p className="text-sm text-gray-400 mb-4">Rehber / {params.slug}</p>
      <article className="prose prose-lg max-w-none">
        <h1>{params.slug}</h1>
        <p className="text-gray-400">Makale içeriği yüklenecek...</p>
      </article>
    </div>
  );
}
