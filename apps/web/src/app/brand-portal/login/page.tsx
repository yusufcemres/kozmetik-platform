'use client';

import { useState } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function BrandLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/brand-portal/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Giriş başarısız');
      }

      const data = await res.json();
      localStorage.setItem('brand_token', data.access_token);
      localStorage.setItem('brand_account', JSON.stringify(data.account));
      window.location.href = '/brand-portal/dashboard';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-lowest">
      <div className="bg-surface p-8 rounded-2xl shadow-lg w-full max-w-md border border-outline-variant/30">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-on-surface">REVELA</h1>
          <p className="text-sm text-on-surface-variant mt-1">Marka Portalı</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              E-posta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-outline-variant rounded-lg px-3 py-2.5 bg-surface-container text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="marka@firma.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-outline-variant rounded-lg px-3 py-2.5 bg-surface-container text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link
            href="/brand-portal/register"
            className="text-sm text-primary hover:underline block"
          >
            Marka hesabı oluştur
          </Link>
          <Link
            href="/"
            className="text-xs text-on-surface-variant hover:text-on-surface block"
          >
            ← Ana siteye dön
          </Link>
        </div>
      </div>
    </div>
  );
}
