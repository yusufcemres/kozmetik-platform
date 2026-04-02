'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import AdminTable from '@/components/admin/AdminTable';
import { api } from '@/lib/api';

interface SupplementProduct {
  product_id: number;
  product_name: string;
  brand?: { brand_name: string };
  category?: { category_name: string };
  status: string;
}

export default function SupplementsPage() {
  const [data, setData] = useState<SupplementProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = (p: number) => {
    setLoading(true);
    api
      .get('/supplements', { params: { page: p, limit: 20 } })
      .then((res: any) => {
        setData(res.data || []);
        setTotal(res.meta?.total || 0);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  return (
    <div>
      <PageHeader
        title="Supplement Ürünleri"
        description="Takviye gıda ürünleri (domain_type=supplement)"
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-700">
        Supplement ürün eklemek için önce Ürünler sayfasından bir ürünü{' '}
        <code className="bg-blue-100 px-1 rounded">domain_type=supplement</code> olarak oluşturun,
        ardından bu sayfadan supplement detaylarını (form, porsiyon, besin bilgileri) ekleyin.
      </div>

      {loading ? (
        <p className="text-gray-400">Yükleniyor...</p>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">💊</p>
          <p>Henüz supplement ürün yok</p>
        </div>
      ) : (
        <AdminTable
          columns={[
            { key: 'product_id', label: 'ID' },
            { key: 'product_name', label: 'Ürün Adı' },
            { key: 'brand', label: 'Marka', render: (v: any) => v?.brand_name || '-' },
            { key: 'category', label: 'Kategori', render: (v: any) => v?.category_name || '-' },
            { key: 'status', label: 'Durum' },
          ]}
          data={data}
          page={page}
          total={total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
