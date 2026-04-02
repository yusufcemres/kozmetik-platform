/**
 * IMobileSyncAdapter — Faz 2.5 Mobil Profil Sync
 *
 * Web (localStorage) ↔ Mobil (AsyncStorage) ↔ Backend profil
 * senkronizasyonu.
 */

export interface SyncPayload {
  anonymous_id: string;
  skin_type: string;
  concerns: number[]; // need_id array
  sensitivities: {
    fragrance: boolean;
    alcohol: boolean;
    paraben: boolean;
    essential_oils: boolean;
  };
  age_range?: string;
  favorites?: number[]; // product_id array
  routine?: {
    morning: number[]; // product_id sırası
    evening: number[];
  };
  last_synced_at: string; // ISO date
}

export interface SyncResult {
  status: 'success' | 'conflict' | 'error';
  merged_payload?: SyncPayload;
  conflict_fields?: string[]; // hangi alanlar çakıştı
  message: string;
}

export interface IMobileSyncAdapter {
  /**
   * Local storage'dan backend'e profil push
   */
  pushToServer(payload: SyncPayload): Promise<SyncResult>;

  /**
   * Backend'den local storage'a profil pull
   */
  pullFromServer(anonymousId: string): Promise<SyncPayload | null>;

  /**
   * İki versiyon çakışınca merge (server wins, client wins, veya manual)
   */
  resolveConflict(
    serverPayload: SyncPayload,
    clientPayload: SyncPayload,
    strategy: 'server_wins' | 'client_wins' | 'latest_wins',
  ): SyncPayload;

  /**
   * QR kod / deep link ile web profilini mobile import
   */
  generateTransferToken(anonymousId: string): Promise<string>;

  /**
   * Transfer token ile profili yükle
   */
  importFromToken(token: string): Promise<SyncPayload>;
}
