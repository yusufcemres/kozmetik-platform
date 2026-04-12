'use client';

import { api } from './api';
import { getUserToken } from './user-auth';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

export function isPushSupported(): boolean {
  return typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window;
}

export async function getPushPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

export async function subscribeToPush(): Promise<{ success: boolean; message: string }> {
  if (!isPushSupported()) {
    return { success: false, message: 'Bu tarayıcı push bildirim desteklemiyor' };
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { success: false, message: 'Bildirim izni verilmedi' };
  }

  const { public_key } = await api.get<{ public_key: string | null }>('/notifications/public-key');
  if (!public_key) {
    return { success: false, message: 'Sunucuda VAPID yapılandırılmamış' };
  }

  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(public_key),
    });
  }

  const payload = sub.toJSON() as { endpoint?: string; keys?: { p256dh: string; auth: string } };
  const token = getUserToken();
  await api.post('/notifications/subscribe', {
    endpoint: payload.endpoint,
    keys: payload.keys,
    user_agent: navigator.userAgent,
  }, { token: token ?? undefined });

  return { success: true, message: 'Bildirimler açıldı' };
}

export async function unsubscribeFromPush(): Promise<{ success: boolean }> {
  if (!isPushSupported()) return { success: false };
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    await api.delete('/notifications/unsubscribe', {
      body: JSON.stringify({ endpoint: sub.endpoint }),
      headers: { 'Content-Type': 'application/json' },
    } as any);
    await sub.unsubscribe();
  }
  return { success: true };
}

export async function isSubscribedToPush(): Promise<boolean> {
  if (!isPushSupported()) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
  } catch {
    return false;
  }
}
