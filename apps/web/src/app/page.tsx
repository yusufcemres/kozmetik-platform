export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-primary-600 mb-4">
        Kozmetik Platform
      </h1>
      <p className="text-lg text-gray-600 text-center max-w-xl">
        Kozmetik ürünlerin içeriklerini anla, ihtiyacına uygun ürünleri keşfet.
      </p>
      <div className="mt-8">
        <input
          type="text"
          placeholder="Ürün, içerik veya ihtiyaç ara..."
          className="w-96 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
        />
      </div>
    </main>
  );
}
