'use client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          <a href="/admin" className="block px-3 py-2 rounded hover:bg-gray-800">
            Dashboard
          </a>
          <a href="/admin/categories" className="block px-3 py-2 rounded hover:bg-gray-800">
            Kategoriler
          </a>
          <a href="/admin/brands" className="block px-3 py-2 rounded hover:bg-gray-800">
            Markalar
          </a>
          <a href="/admin/ingredients" className="block px-3 py-2 rounded hover:bg-gray-800">
            İçerikler
          </a>
          <a href="/admin/needs" className="block px-3 py-2 rounded hover:bg-gray-800">
            İhtiyaçlar
          </a>
          <a href="/admin/products" className="block px-3 py-2 rounded hover:bg-gray-800">
            Ürünler
          </a>
          <a href="/admin/articles" className="block px-3 py-2 rounded hover:bg-gray-800">
            Makaleler
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  );
}
