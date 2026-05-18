import type { Request } from 'express';

/**
 * AppJwtStrategy.validate() dönen payload — req.user'da bu shape olur.
 * Cleanup: tüm AppJwtGuard kullanan controller'lar `req: any` yerine
 * `req: AppAuthRequest` kullanmalı (Madde 22 type safety).
 */
export interface AppAuthenticatedUser {
  user_id: number;
  email: string;
  display_name: string | null;
}

export type AppAuthRequest = Request & {
  user: AppAuthenticatedUser;
};

/**
 * AppJwtGuard yok ama auth opsiyonel (örn. smart-scan optional).
 * Token yoksa user undefined olur.
 */
export type AppMaybeAuthRequest = Request & {
  user?: AppAuthenticatedUser;
};
