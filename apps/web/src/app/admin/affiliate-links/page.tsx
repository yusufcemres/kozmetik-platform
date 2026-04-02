'use client';

import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';

const columns = [
  { key: 'affiliate_link_id', label: 'ID' },
  { key: 'product_id', label: 'Ürün ID' },
  {
    key: 'platform',
    label: 'Platform',
    render: (v: string) => {
      const colors: Record<string, string> = {
        trendyol: 'bg-orange-100 text-orange-700',
        hepsiburada: 'bg-blue-100 text-blue-700',
        amazon_tr: 'bg-yellow-100 text-yellow-700',
        gratis: 'bg-pink-100 text-pink-700',
        dermoeczanem: 'bg-green-100 text-green-700',
      };
      return (
        <span className={`px-2 py-1 rounded text-xs ${colors[v] || 'bg-gray-100 text-gray-700'}`}>
          {v}
        </span>
      );
    },
  },
  {
    key: 'price_snapshot',
    label: 'Fiyat',
    render: (v: number) => v ? `₺${v.toFixed(2)}` : '-',
  },
  {
    key: 'is_active',
    label: 'Durum',
    render: (v: boolean) => v ? '✅' : '❌',
  },
];

export default function AffiliateLinksPage() {
  return (
    <div>
      <PageHeader
        title="Affiliate Linkleri"
        description="Ürün satın alma linklerini toplu yönetin"
        action={{ label: 'Yeni Link', onClick: () => {} }}
      />
      <AdminTable columns={columns} data={[]} onEdit={() => {}} onDelete={() => {}} />
    </div>
  );
}
