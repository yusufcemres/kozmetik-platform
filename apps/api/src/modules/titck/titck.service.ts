import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

export type TitckStatus = 'not_checked' | 'verified' | 'not_found' | 'expired' | 'banned';

export interface TitckCheckResult {
  status: TitckStatus;
  notificationNo: string | null;
  bannedReason?: string;
}

@Injectable()
export class TitckService {
  private readonly logger = new Logger(TitckService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Tüm published/active ürünleri TİTCK yasaklı INCI listesi ile çapraz kontrol eder.
   * Banned bulunanları 'banned' statüye düşürür ve titck_banned_reason yazar.
   * Yasaklı bulunmayanlarda 'not_checked' korunur (web scraper hazır olunca dolar).
   */
  async rescanAll(): Promise<{ checked: number; verified: number; banned: number }> {
    const products = await this.dataSource.query(
      `SELECT product_id FROM products WHERE status IN ('published','active') AND domain_type = 'cosmetic'`,
    );
    let checked = 0;
    let banned = 0;
    for (const row of products) {
      const result = await this.checkProduct(row.product_id);
      checked++;
      if (result.status === 'banned') banned++;
    }
    this.logger.log(`TİTCK rescan: ${checked} checked, ${banned} banned flagged`);
    return { checked, verified: 0, banned };
  }

  async checkProduct(productId: number): Promise<TitckCheckResult> {
    const banned = await this.crossCheckBannedIngredients(productId);
    if (banned) {
      await this.dataSource.query(
        `UPDATE products SET titck_status = 'banned', titck_banned_reason = $2, titck_verified_at = NOW() WHERE product_id = $1`,
        [productId, banned],
      );
      return { status: 'banned', notificationNo: null, bannedReason: banned };
    }
    return { status: 'not_checked', notificationNo: null };
  }

  /**
   * Admin manuel olarak ürünün TİTCK bildirim numarasını ekler.
   * Kullanıcı kozmetikbildirim.titck.gov.tr'den çekip buraya yazar (yarı-otomatik).
   * Web scraper hazır olunca otomatize edilir.
   */
  async setNotification(productId: number, notificationNo: string, status: TitckStatus = 'verified'): Promise<TitckCheckResult> {
    await this.dataSource.query(
      `UPDATE products SET titck_status = $2, titck_notification_no = $3, titck_verified_at = NOW() WHERE product_id = $1`,
      [productId, status, notificationNo],
    );
    return { status, notificationNo };
  }

  /**
   * product_ingredients → ingredients JOIN ile titck_banned_ingredients çakışması kontrol.
   * Bir eşleşme varsa ürün otomatik draft + banned flag.
   */
  async crossCheckBannedIngredients(productId: number): Promise<string | null> {
    const rows = await this.dataSource.query(
      `
      SELECT b.inci_name, b.ban_reason
      FROM product_ingredients pi
      JOIN ingredients ing ON ing.ingredient_id = pi.ingredient_id
      JOIN titck_banned_ingredients b ON b.inci_slug = ing.ingredient_slug
      WHERE pi.product_id = $1
      LIMIT 1
      `,
      [productId],
    );
    if (rows.length === 0) return null;
    return `${rows[0].inci_name}: ${rows[0].ban_reason}`;
  }

  async getProductStatus(productId: number) {
    const rows = await this.dataSource.query(
      `SELECT titck_notification_no, titck_status, titck_verified_at, titck_banned_reason, badges
       FROM products WHERE product_id = $1`,
      [productId],
    );
    return rows[0] || null;
  }
}
