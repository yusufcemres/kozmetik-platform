import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Katman 2 — Sertifika DB lookup.
 * brand_certifications → ürünün legal-risk taglarını doldurur (cruelty-free, vegan, organic...).
 * Bu tag'ler ASLA INCI'den türetilmez — yalnızca sertifika tabloşundan.
 */
@Injectable()
export class TagCertifierService {
  constructor(private readonly dataSource: DataSource) {}

  async certifyForProduct(productId: number): Promise<string[]> {
    const rows = await this.dataSource.query(
      `
      SELECT bc.cert_code, ct.category, ct.name_tr, bc.source_url
      FROM products p
      JOIN brand_certifications bc ON bc.brand_id = p.brand_id
      JOIN certification_types ct ON ct.cert_code = bc.cert_code
      WHERE p.product_id = $1
      `,
      [productId],
    );
    const added: string[] = [];
    for (const r of rows) {
      await this.dataSource.query(
        `INSERT INTO product_tag_provenance (product_id, tag_key, tag_value, source_type, source_url, source_quote)
         VALUES ($1, 'certification', $2, 'certification_db', $3, $4)`,
        [productId, r.cert_code, r.source_url || null, `${r.name_tr} (marka sertifikası)`],
      );
      added.push(r.cert_code);
    }
    return added;
  }
}
