'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from './api';

const TOKEN_KEY = 'revela_user_token';
const USER_KEY = 'revela_user';

export type AppUser = {
  user_id: number;
  email: string;
  display_name: string | null;
};

export function getUserToken(): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setUserToken(token: string) {
  try { localStorage.setItem(TOKEN_KEY, token); } catch {}
}

export function clearUserToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {}
}

export function getCachedUser(): AppUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setCachedUser(user: AppUser) {
  try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch {}
}

export async function requestMagicLink(email: string): Promise<{ sent: boolean; devToken?: string }> {
  return api.post('/user-auth/request', { email });
}

export async function verifyMagicLink(token: string): Promise<{ token: string; user: AppUser }> {
  return api.get(`/user-auth/verify?token=${encodeURIComponent(token)}`);
}

export function useUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getUserToken();
    if (!token) {
      setLoading(false);
      return;
    }
    const cached = getCachedUser();
    if (cached) setUser(cached);

    api.get<AppUser>('/user-auth/me', { token })
      .then((u) => {
        setUser(u);
        setCachedUser(u);
      })
      .catch(() => {
        clearUserToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = useCallback(() => {
    clearUserToken();
    setUser(null);
  }, []);

  return { user, loading, logout, isAuthenticated: !!user };
}
