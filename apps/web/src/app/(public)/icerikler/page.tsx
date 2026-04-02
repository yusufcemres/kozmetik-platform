export default function IngredientsListPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">İçerik Maddeleri</h1>
      <p className="text-gray-500 mb-8">
        A&apos;dan Z&apos;ye kozmetik içerik maddeleri ansiklopedisi
      </p>

      {/* Alphabet filter */}
      <div className="flex flex-wrap gap-1 mb-8">
        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => (
          <button
            key={letter}
            className="w-8 h-8 rounded text-sm font-medium border hover:bg-primary hover:text-white transition-colors"
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 text-center text-gray-400">
          <p className="text-4xl mb-2">🧪</p>
          <p className="text-sm">İçerik maddeleri veritabanı kurulunca listelenecek</p>
        </div>
      </div>
    </div>
  );
}
