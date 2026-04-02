'use client';

import { useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';
import { useAdminCrud } from '@/lib/useAdminCrud';

const columns = [
  { key: 'product_ingredient_id', label: 'ID' },
  { key: 'ingredient_display_name', label: 'Görünen İsim' },
  { key: 'listed_as_raw', label: 'Ham INCI' },
  {
    key: 'match_status',
    label: 'Eşleşme',
    render: (v: string) => {
      const colors: Record<string, string> = {
        auto_matched: 'bg-green-100 text-green-700',
        suggested: 'bg-yellow-100 text-yellow-700',
        review_needed: 'bg-red-100 text-red-700',
        manual_matched: 'bg-blue-100 text-blue-700',
      };
      return (
        <span className={`px-2 py-1 rounded text-xs ${colors[v] || 'bg-gray-100 text-gray-700'}`}>
          {v?.replace(/_/g, ' ') || '-'}
        </span>
      );
    },
  },
  {
    key: 'match_confidence',
    label: 'Güven',
    render: (v: number) => v ? `%${Math.round(v * 100)}` : '-',
  },
];

export default function ReviewQueuePage() {
  const [filter, setFilter] = useState<'suggested' | 'review_needed'>('review_needed');

  // This would filter by match_status on the API side
  const crud = useAdminCrud({
    endpoint: `/admin/review-queue?status=${filter}`,
    idField: 'product_ingredient_id',
  });

  return (
    <div>
      <PageHeader
        title="Review Queue"
        description="Otomatik eşleşmeyen veya düşük güvenli ingredient eşleşmeleri"
      />
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter('suggested')}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            filter === 'suggested' ? 'bg-yellow-200 text-yellow-900' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-150'
          }`}
        >
          Suggestion
        </button>
        <button
          onClick={() => setFilter('review_needed')}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            filter === 'review_needed' ? 'bg-red-200 text-red-900' : 'bg-red-100 text-red-800 hover:bg-red-150'
          }`}
        >
          Review Needed
        </button>
      </div>
      <AdminTable
        columns={columns}
        data={crud.data}
        loading={crud.loading}
        meta={crud.meta}
        page={crud.page}
        onPageChange={crud.setPage}
        onEdit={() => {}}
      />
    </div>
  );
}
