'use client';

import { useState } from 'react';

export default function SearchPage() {
  const [query, setQuery] = useState('');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ürün, içerik maddesi veya cilt ihtiyacı ara..."
          className="w-full border-2 border-gray-200 rounded-xl px-6 py-4 text-lg focus:outline-none focus:border-primary"
          autoFocus
        />
      </div>

      {!query && (
        <div className="text-center text-gray-400 py-16">
          <p className="text-5xl mb-4">🔍</p>
          <p>Aramak istediğiniz terimi yazın</p>
          <p className="text-sm mt-2">
            Örn: &quot;niacinamide&quot;, &quot;sivilce&quot;, &quot;La Roche-Posay&quot;
          </p>
        </div>
      )}

      {query && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            &quot;{query}&quot; için sonuçlar yükleniyor...
          </p>
        </div>
      )}
    </div>
  );
}
