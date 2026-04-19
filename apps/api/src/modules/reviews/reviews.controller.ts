import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/create-review.dto';
import { AppJwtGuard } from '../user-auth/app-jwt.guard';

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}

  // ── Public: per-product listing + aggregate (JSON-LD source) ───────────────
  @Get('products/:productId/reviews')
  @Throttle({ public: { limit: 60, ttl: 60_000 } })
  @ApiOperation({ summary: 'Ürün yorum listesi + agregat rating (JSON-LD kaynak)' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async list(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const lim = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const off = Math.max(Number(offset) || 0, 0);
    return this.service.listForProduct(productId, lim, off);
  }

  // ── Public: just the aggregate (for SSR JSON-LD without review body overhead)
  @Get('products/:productId/reviews/aggregate')
  @Throttle({ public: { limit: 120, ttl: 60_000 } })
  @ApiOperation({ summary: 'Agregat rating (ratingValue + reviewCount)' })
  async aggregate(@Param('productId', ParseIntPipe) productId: number) {
    return this.service.aggregateForProduct(productId);
  }

  // ── Authenticated: create/update/delete own review ─────────────────────────
  @Post('products/:productId/reviews')
  @UseGuards(AppJwtGuard)
  @ApiBearerAuth()
  @Throttle({ public: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Ürün için yorum gönder (bir kullanıcı → bir yorum)' })
  async create(
    @Req() req: any,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateReviewDto,
  ) {
    return this.service.create(req.user.user_id, productId, dto);
  }

  @Patch('reviews/:reviewId')
  @UseGuards(AppJwtGuard)
  @ApiBearerAuth()
  @Throttle({ public: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Kendi yorumunu güncelle' })
  async update(
    @Req() req: any,
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.service.update(req.user.user_id, reviewId, dto);
  }

  @Delete('reviews/:reviewId')
  @UseGuards(AppJwtGuard)
  @ApiBearerAuth()
  @Throttle({ public: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Kendi yorumunu sil' })
  async remove(@Req() req: any, @Param('reviewId', ParseIntPipe) reviewId: number) {
    return this.service.remove(req.user.user_id, reviewId);
  }

  @Get('me/reviews')
  @UseGuards(AppJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kendi yorumlarım' })
  async mine(@Req() req: any) {
    return this.service.myReviews(req.user.user_id);
  }
}
