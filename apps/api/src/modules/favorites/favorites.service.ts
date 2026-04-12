import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFavorite, Product } from '@database/entities';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(UserFavorite)
    private readonly favRepo: Repository<UserFavorite>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async list(userId: number) {
    const favs = await this.favRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
    if (favs.length === 0) return [];

    const productIds = favs.map((f) => f.product_id);
    const products = await this.productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.brand', 'brand')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.images', 'images')
      .where('p.product_id IN (:...ids)', { ids: productIds })
      .getMany();

    const productMap = new Map(products.map((p) => [p.product_id, p]));
    return favs
      .map((f) => {
        const p = productMap.get(f.product_id);
        if (!p) return null;
        return {
          favorite_id: f.favorite_id,
          created_at: f.created_at,
          product_id: p.product_id,
          product_name: p.product_name,
          product_slug: p.product_slug,
          brand: p.brand ? { brand_name: p.brand.brand_name } : null,
          category: p.category
            ? { category_name: p.category.category_name, category_slug: p.category.category_slug }
            : null,
          image_url: p.images?.[0]?.image_url || null,
        };
      })
      .filter(Boolean);
  }

  async add(userId: number, productId: number) {
    const product = await this.productRepo.findOne({ where: { product_id: productId } });
    if (!product) throw new NotFoundException('Ürün bulunamadı');

    const existing = await this.favRepo.findOne({
      where: { user_id: userId, product_id: productId },
    });
    if (existing) return { added: false, favorite_id: existing.favorite_id };

    const fav = this.favRepo.create({ user_id: userId, product_id: productId });
    const saved = await this.favRepo.save(fav);
    return { added: true, favorite_id: saved.favorite_id };
  }

  async remove(userId: number, productId: number) {
    const result = await this.favRepo.delete({ user_id: userId, product_id: productId });
    return { removed: (result.affected || 0) > 0 };
  }

  async toggle(userId: number, productId: number) {
    const existing = await this.favRepo.findOne({
      where: { user_id: userId, product_id: productId },
    });
    if (existing) {
      await this.favRepo.delete({ favorite_id: existing.favorite_id });
      return { favorited: false };
    }
    const product = await this.productRepo.findOne({ where: { product_id: productId } });
    if (!product) throw new NotFoundException('Ürün bulunamadı');
    await this.favRepo.save(this.favRepo.create({ user_id: userId, product_id: productId }));
    return { favorited: true };
  }

  async bulkAdd(userId: number, productIds: number[]) {
    if (!productIds.length) return { added: 0 };
    const existing = await this.favRepo.find({
      where: { user_id: userId },
      select: ['product_id'],
    });
    const existingSet = new Set(existing.map((e) => e.product_id));
    const newIds = productIds.filter((id) => !existingSet.has(id));
    if (!newIds.length) return { added: 0 };

    const valid = await this.productRepo
      .createQueryBuilder('p')
      .select('p.product_id')
      .where('p.product_id IN (:...ids)', { ids: newIds })
      .getMany();

    const rows = valid.map((p) => this.favRepo.create({ user_id: userId, product_id: p.product_id }));
    await this.favRepo.save(rows);
    return { added: rows.length };
  }

  async removeAllForUser(userId: number) {
    await this.favRepo.delete({ user_id: userId });
  }
}
