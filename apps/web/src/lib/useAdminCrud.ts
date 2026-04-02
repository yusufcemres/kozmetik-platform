'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from './api';

interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseAdminCrudOptions {
  endpoint: string;
  limit?: number;
  idField?: string;
}

export function useAdminCrud<T = any>({ endpoint, limit = 20, idField = 'id' }: UseAdminCrudOptions) {
  const [data, setData] = useState<T[]>([]);
  const [meta, setMeta] = useState<PageMeta>({ total: 0, page: 1, limit, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : '';

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set('search', search);

      const res = await api.get<{ data: T[]; meta: PageMeta } | T[]>(
        `${endpoint}?${params.toString()}`,
        { token },
      );

      // Handle both paginated and array responses
      if (Array.isArray(res)) {
        setData(res);
        setMeta({ total: res.length, page: 1, limit, totalPages: 1 });
      } else {
        setData(res.data || []);
        setMeta(res.meta || { total: 0, page: 1, limit, totalPages: 1 });
      }
    } catch (err: any) {
      setError(err.message || 'Veri yüklenemedi');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, limit, search, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const deleteItem = useCallback(async (id: number | string) => {
    if (!confirm('Bu kaydı silmek istediğinizden emin misiniz?')) return false;
    try {
      await api.delete(`${endpoint}/${id}`, { token });
      await fetchData();
      return true;
    } catch (err: any) {
      alert(err.message || 'Silme hatası');
      return false;
    }
  }, [endpoint, token, fetchData]);

  const handleSearch = (term: string) => {
    setSearch(term);
    setPage(1);
  };

  return {
    data,
    meta,
    loading,
    error,
    page,
    setPage,
    search,
    handleSearch,
    deleteItem,
    refetch: fetchData,
    token,
  };
}
