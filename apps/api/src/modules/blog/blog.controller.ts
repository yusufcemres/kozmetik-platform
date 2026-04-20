import { Controller, Get, Param, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { BlogService } from './blog.service';
import { ReviewersService } from './reviewers.service';

@Controller('blog')
@Throttle({ public: { ttl: 60_000, limit: 60 } })
export class BlogController {
  constructor(
    private readonly blog: BlogService,
    private readonly reviewers: ReviewersService,
  ) {}

  @Get('posts')
  list(
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const lim = limit ? Math.min(Math.max(Number(limit) || 20, 1), 100) : undefined;
    const off = offset ? Math.max(Number(offset) || 0, 0) : undefined;
    return this.blog.list({ category, tag, limit: lim, offset: off });
  }

  @Get('posts/:slug')
  get(@Param('slug') slug: string) {
    return this.blog.getBySlug(slug);
  }

  @Get('sitemap')
  sitemap() {
    return this.blog.slugs();
  }

  @Get('reviewers')
  reviewersList() {
    return this.reviewers.list();
  }

  @Get('reviewers/:slug')
  reviewerBySlug(@Param('slug') slug: string) {
    return this.reviewers.getBySlug(slug);
  }
}
