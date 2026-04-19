import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductReview } from '@database/entities';
import { CreateReviewDto, UpdateReviewDto } from './dto/create-review.dto';

// AggregateRating gets recomputed on every write path and cached on the
// Product row via top_review_avg / top_review_count (optional optimization
// later). For now we compute on-demand — review traffic is low enough that
// the extra COUNT/AVG on a partially-indexed table is cheap.
export type AggregateRating = {
  product_id: number;
  rating_value: number | null;
  review_count: number;
  rating_distribution: Record<'1' | '2' | '3' | '4' | '5', number>;
};

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ProductReview)
    private readonly reviewRepo: Repository<ProductReview>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async listForProduct(productId: number, limit = 20, offset = 0) {
    const items = await this.reviewRepo
      .createQueryBuilder('r')
      .leftJoin('app_users', 'u', 'u.user_id = r.user_id')
      .select([
        'r.review_id AS review_id',
        'r.rating AS rating',
        'r.title AS title',
        'r.body AS body',
        'r.helpful_count AS helpful_count',
        'r.verified_purchase AS verified_purchase',
        'r.created_at AS created_at',
        'u.display_name AS user_display_name',
      ])
      .where('r.product_id = :pid AND r.status = :st', { pid: productId, st: 'visible' })
      .orderBy('r.created_at', 'DESC')
      .limit(limit)
      .offset(offset)
      .getRawMany();

    const { rating_value, review_count, rating_distribution } =
      await this.aggregateForProduct(productId);

    return {
      items,
      limit,
      offset,
      aggregate: { rating_value, review_count, rating_distribution },
    };
  }

  async aggregateForProduct(productId: number): Promise<AggregateRating> {
    const row = await this.reviewRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)::float', 'avg')
      .addSelect('COUNT(*)::int', 'cnt')
      .where('r.product_id = :pid AND r.status = :st', { pid: productId, st: 'visible' })
      .getRawOne<{ avg: number | null; cnt: number }>();

    const distRows = await this.reviewRepo
      .createQueryBuilder('r')
      .select('r.rating', 'rating')
      .addSelect('COUNT(*)::int', 'cnt')
      .where('r.product_id = :pid AND r.status = :st', { pid: productId, st: 'visible' })
      .groupBy('r.rating')
      .getRawMany<{ rating: number; cnt: number }>();

    const dist: AggregateRating['rating_distribution'] = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    for (const d of distRows) {
      const k = String(d.rating) as keyof AggregateRating['rating_distribution'];
      if (k in dist) dist[k] = d.cnt;
    }

    return {
      product_id: productId,
      rating_value: row?.avg != null ? Number(row.avg.toFixed(2)) : null,
      review_count: row?.cnt ?? 0,
      rating_distribution: dist,
    };
  }

  async create(userId: number, productId: number, dto: CreateReviewDto) {
    const product = await this.productRepo.findOne({ where: { product_id: productId } });
    if (!product) throw new NotFoundException('Ürün bulunamadı');

    const existing = await this.reviewRepo.findOne({
      where: { user_id: userId, product_id: productId },
    });
    if (existing) {
      throw new BadRequestException('Bu ürün için zaten bir yorumunuz var. Güncelleme için PATCH kullan.');
    }

    const review = this.reviewRepo.create({
      product_id: productId,
      user_id: userId,
      rating: dto.rating,
      title: dto.title ?? null,
      body: dto.body ?? null,
      status: 'visible',
    });
    const saved = await this.reviewRepo.save(review);
    return { review_id: saved.review_id };
  }

  async update(userId: number, reviewId: number, dto: UpdateReviewDto) {
    const review = await this.reviewRepo.findOne({ where: { review_id: reviewId } });
    if (!review) throw new NotFoundException('Yorum bulunamadı');
    if (review.user_id !== userId) throw new BadRequestException('Bu yorumu güncelleyemezsiniz');

    if (dto.rating !== undefined) review.rating = dto.rating;
    if (dto.title !== undefined) review.title = dto.title;
    if (dto.body !== undefined) review.body = dto.body;

    await this.reviewRepo.save(review);
    return { updated: true };
  }

  async remove(userId: number, reviewId: number) {
    const review = await this.reviewRepo.findOne({ where: { review_id: reviewId } });
    if (!review) throw new NotFoundException('Yorum bulunamadı');
    if (review.user_id !== userId) throw new BadRequestException('Bu yorumu silemezsiniz');

    await this.reviewRepo.delete({ review_id: reviewId });
    return { removed: true };
  }

  async myReviews(userId: number) {
    return this.reviewRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }
}
