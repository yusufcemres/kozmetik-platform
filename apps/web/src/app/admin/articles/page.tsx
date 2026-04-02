'use client';

import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';

const columns = [
  { key: 'article_id', label: 'ID' },
  { key: 'title', label: 'Başlık' },
  { key: 'content_type', label: 'Tür' },
  {
    key: 'status',
    label: 'Durum',
    render: (v: string) => {
      const colors: Record<string, string> = {
        draft: 'bg-gray-100 text-gray-700',
        published: 'bg-green-100 text-green-700',
        archived: 'bg-red-100 text-red-700',
      };
      return (
        <span className={`px-2 py-1 rounded text-xs ${colors[v] || colors.draft}`}>
          {v}
        </span>
      );
    },
  },
  {
    key: 'published_at',
    label: 'Yayın Tarihi',
    render: (v: string) => v ? new Date(v).toLocaleDateString('tr-TR') : '-',
  },
];

export default function ArticlesPage() {
  return (
    <div>
      <PageHeader
        title="Makaleler"
        description="Blog ve rehber içerikleri yönetin"
        action={{ label: 'Yeni Makale', onClick: () => {} }}
      />
      <AdminTable columns={columns} data={[]} onEdit={() => {}} onDelete={() => {}} />
    </div>
  );
}
