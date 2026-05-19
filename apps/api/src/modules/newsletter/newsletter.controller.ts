import { BadRequestException, Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { NewsletterService } from './newsletter.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly service: NewsletterService) {}

  @Post('subscribe')
  @Throttle({ public: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'REVELA Bülten aboneliği' })
  async subscribe(@Body() body: { email?: string; source_page?: string }) {
    if (!body?.email || typeof body.email !== 'string') {
      throw new BadRequestException('email zorunlu');
    }
    return this.service.subscribe(body.email, body.source_page);
  }

  @Get('unsubscribe/:token')
  @Throttle({ public: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Tek-tıkla abonelikten çık' })
  async unsubscribe(@Param('token') token: string) {
    return this.service.unsubscribeByToken(token);
  }

  // ── ADMIN ──────────────────────────────────────────────────────────────

  @Post('admin/send')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'content_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: bülten broadcast (Resend daily 100 batch)' })
  async adminSend(@Body() body: {
    edition?: string;
    headlineTitle?: string;
    headlineExcerpt?: string;
    headlineHref?: string;
    articles?: Array<{ title: string; excerpt: string; href: string }>;
  }) {
    if (!body?.edition || !body?.headlineTitle || !body?.headlineExcerpt || !body?.headlineHref) {
      throw new BadRequestException('edition + headlineTitle + headlineExcerpt + headlineHref zorunlu');
    }
    return this.service.sendBroadcast({
      edition: body.edition,
      headlineTitle: body.headlineTitle,
      headlineExcerpt: body.headlineExcerpt,
      headlineHref: body.headlineHref,
      articles: Array.isArray(body.articles) ? body.articles.slice(0, 10) : [],
    });
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'content_editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: abone sayısı + son broadcast' })
  async adminStats() {
    return this.service.getStats();
  }
}
