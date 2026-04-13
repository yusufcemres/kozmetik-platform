import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Faz N MVP — Türkçe query normalize + keyword intersection + en iyi shortcut.
 */
@Injectable()
export class ShortcutMatcherService {
  constructor(private readonly dataSource: DataSource) {}

  private normalize(s: string): string {
    return s
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async match(query: string) {
    const norm = this.normalize(query);
    const tokens = norm.split(' ').filter((t) => t.length > 2);
    if (tokens.length === 0) return null;

    const shortcuts = await this.dataSource.query(
      `SELECT shortcut_id, intent_key, keywords, title, description, caution,
              product_ids, ingredient_ids, blog_post_ids
       FROM ai_search_shortcuts WHERE is_active = true`,
    );

    let best: { score: number; row: any } | null = null;
    for (const row of shortcuts) {
      const kws: string[] = (row.keywords || []).map((k: string) => this.normalize(k));
      let score = 0;
      for (const kw of kws) {
        if (norm.includes(kw)) score += kw.split(' ').length * 2;
        else if (kw.split(' ').some((w) => tokens.includes(w))) score += 1;
      }
      if (score > 0 && (!best || score > best.score)) best = { score, row };
    }
    if (!best) return null;

    await this.dataSource.query(
      `UPDATE ai_search_shortcuts SET usage_count = usage_count + 1 WHERE shortcut_id = $1`,
      [best.row.shortcut_id],
    );
    return best.row;
  }

  async logQuery(query: string, matchedId: number | null, userId: number | null, sessionId: string | null, ip: string | null) {
    await this.dataSource.query(
      `INSERT INTO ai_search_logs (query, matched_shortcut_id, user_id, session_id, ip)
       VALUES ($1, $2, $3, $4, $5)`,
      [query, matchedId, userId, sessionId, ip],
    );
  }
}
