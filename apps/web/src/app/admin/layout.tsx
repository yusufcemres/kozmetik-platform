'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/categories', label: 'Kategoriler', icon: '📁' },
  { href: '/admin/brands', label: 'Markalar', icon: '🏷️' },
  { href: '/admin/ingredients', label: 'İçerikler', icon: '🧪' },
  { href: '/admin/needs', label: 'İhtiyaçlar', icon: '🎯' },
  { href: '/admin/products', label: 'Ürünler', icon: '📦' },
  { href: '/admin/ingredient-need-mappings', label: 'Eşleşmeler', icon: '🔗' },
  { href: '/admin/articles', label: 'Makaleler', icon: '📝' },
  { href: '/admin/review-queue', label: 'Review Queue', icon: '👁️' },
  { href: '/admin/scoring-config', label: 'Scoring', icon: '⚙️' },
  { href: '/admin/qc', label: 'Kalite Kontrol', icon: '🔍' },
  { href: '/admin/affiliate-links', label: 'Affiliate', icon: '💰' },
  { href: '/admin/approved-wordings', label: 'İfadeler', icon: '✅' },
  { href: '/admin/evidence-levels', label: 'Kanıt Seviyeleri', icon: '🔬' },
  { href: '/admin/audit-log', label: 'Audit Log', icon: '📋' },
  { href: '/admin/corrections', label: 'Düzeltmeler', icon: '🔧' },
  { href: '/admin/batch-imports', label: 'Import', icon: '📥' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white p-4 flex flex-col">
        <Link href="/admin" className="text-xl font-bold mb-6 text-primary">
          Kozmetik Admin
        </Link>
        <nav className="space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="pt-4 border-t border-gray-700 text-xs text-gray-500">
          <Link href="/" className="hover:text-white">
            Siteye git
          </Link>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 p-8 overflow-auto">{children}</main>
    </div>
  );
}
