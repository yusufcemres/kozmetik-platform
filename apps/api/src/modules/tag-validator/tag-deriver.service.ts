import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Katman 1 — INCI deterministik çıkarım.
 *
 * products.ingredients_inci JSONB'den ingredients tablosuna JOIN yapar,
 * ingredients.is_paraben / is_silicone / ... bayraklarına bakar,
 * ürün tag'lerini türetir ve product_tag_provenance'a kaynak olarak yazar.
 */
@Injectable()
export class TagDeriverService {
  constructor(private readonly dataSource: DataSource) {}

  async deriveForProduct(productId: number): Promise<string[]> {
    const rows = await this.dataSource.query(
      `
      SELECT
        bool_or(i.is_paraben) AS has_paraben,
        bool_or(i.is_silicone) AS has_silicone,
        bool_or(i.is_sulfate) AS has_sulfate,
        bool_or(i.is_peg) AS has_peg,
        bool_or(i.is_mineral_oil) AS has_mineral_oil,
        bool_or(i.is_animal_derived) AS has_animal,
        bool_or(i.is_eu26_allergen) AS has_allergen26,
        bool_or(i.is_alcohol_drying) AS has_drying_alcohol,
        MAX(i.comedogenic_score) AS max_comedogenic
      FROM product_ingredients pi
      JOIN ingredients i ON i.ingredient_id = pi.ingredient_id
      WHERE pi.product_id = $1
      `,
      [productId],
    );
    const r = rows[0] || {};

    const tags: Array<{ key: string; value: string }> = [];
    if (r.has_paraben === false) tags.push({ key: 'free_of', value: 'paraben' });
    if (r.has_silicone === false) tags.push({ key: 'free_of', value: 'silicone' });
    if (r.has_sulfate === false) tags.push({ key: 'free_of', value: 'sulfate' });
    if (r.has_peg === false) tags.push({ key: 'free_of', value: 'peg' });
    if (r.has_mineral_oil === false) tags.push({ key: 'free_of', value: 'mineral_oil' });
    if (r.has_drying_alcohol === false) tags.push({ key: 'free_of', value: 'drying_alcohol' });
    if (r.has_allergen26 === false) tags.push({ key: 'free_of', value: 'eu26_allergen' });
    if (r.max_comedogenic != null) tags.push({ key: 'comedogenic_score', value: String(r.max_comedogenic) });

    for (const t of tags) {
      await this.dataSource.query(
        `INSERT INTO product_tag_provenance (product_id, tag_key, tag_value, source_type, source_quote)
         VALUES ($1, $2, $3, 'inci_deterministic', 'INCI-based derivation')`,
        [productId, t.key, t.value],
      );
    }
    return tags.map((t) => `${t.key}:${t.value}`);
  }
}
