'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from './api';
import { useToast } from '@/components/admin/Toast';

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
  const { toast } = useToast();

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
      toast('Kayıt silindi', 'success');
      await fetchData();
      return true;
    } catch (err: any) {
      toast(err.message || 'Silme hatası', 'error');
      return false;
    }
  }, [endpoint, token, fetchData, toast]);

  const createItem = useCallback(async (body: Record<string, any>) => {
    try {
      await api.post(endpoint, body, { token });
      toast('Kayıt oluşturuldu', 'success');
      await fetchData();
      return true;
    } catch (err: any) {
      toast(err.message || 'Oluşturma hatası', 'error');
      return false;
    }
  }, [endpoint, token, fetchData, toast]);

  const updateItem = useCallback(async (id: number | string, body: Record<string, any>) => {
    try {
      await api.put(`${endpoint}/${id}`, body, { token });
      toast('Kayıt güncellendi', 'success');
      await fetchData();
      return true;
    } catch (err: any) {
      toast(err.message || 'Güncelleme hatası', 'error');
      return false;
    }
  }, [endpoint, token, fetchData, toast]);

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
    createItem,
    updateItem,
    deleteItem,
    refetch: fetchData,
    token,
  };
}
