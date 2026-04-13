import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlogService } from './blog.service';
import { ReviewersService } from './reviewers.service';

@Controller('blog')
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
    return this.blog.list({
      category,
      tag,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
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
