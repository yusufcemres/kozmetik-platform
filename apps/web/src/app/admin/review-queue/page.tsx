'use client';

import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';

const columns = [
  { key: 'product_ingredient_id', label: 'ID' },
  { key: 'ingredient_display_name', label: 'Görünen İsim' },
  { key: 'listed_as_raw', label: 'Ham INCI' },
  { key: 'match_status', label: 'Eşleşme Durumu' },
  {
    key: 'match_confidence',
    label: 'Güven',
    render: (v: number) => v ? `%${Math.round(v * 100)}` : '-',
  },
];

export default function ReviewQueuePage() {
  return (
    <div>
      <PageHeader
        title="Review Queue"
        description="Otomatik eşleşmeyen veya düşük güvenli ingredient eşleşmeleri"
      />
      <div className="mb-4 flex gap-2">
        <button className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
          Suggestion ({0})
        </button>
        <button className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm">
          Review ({0})
        </button>
      </div>
      <AdminTable columns={columns} data={[]} onEdit={() => {}} />
    </div>
  );
}
