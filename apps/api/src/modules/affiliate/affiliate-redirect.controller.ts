import {
  Controller, Get, Param, ParseIntPipe, Req, Res,
  NotFoundException, Logger,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { AffiliateLink, AffiliateClick } from '@database/entities';
import { ConfigService } from '@nestjs/config';
import { TrendyolProvider } from './providers/trendyol.provider';
import { HepsiburadaProvider } from './providers/hepsiburada.provider';
import { AmazonTrProvider } from './providers/amazon.provider';
import { BaseAffiliateProvider } from './providers/base-provider';

@ApiTags('Affiliate Redirect')
@Controller('r')
export class AffiliateRedirectController {
  private readonly logger = new Logger(AffiliateRedirectController.name);
  private readonly providers: Map<string, BaseAffiliateProvider>;

  constructor(
    @InjectRepository(AffiliateLink)
    private readonly linkRepo: Repository<AffiliateLink>,
    @InjectRepository(AffiliateClick)
    private readonly clickRepo: Repository<AffiliateClick>,
    private readonly configService: ConfigService,
  ) {
    this.providers = new Map<string, BaseAffiliateProvider>([
      ['trendyol', new TrendyolProvider()],
      ['hepsiburada', new HepsiburadaProvider()],
      ['amazon_tr', new AmazonTrProvider()],
    ]);
  }

  @Get(':linkId')
  @ApiOperation({ summary: 'Affiliate redirect — click kaydet + tracking param ekle + 302' })
  async redirect(
    @Param('linkId', ParseIntPipe) linkId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const link = await this.linkRepo.findOne({
      where: { affiliate_link_id: linkId, is_active: true },
    });

    if (!link) {
      throw new NotFoundException('Link bulunamadı');
    }

    // Record click (fire-and-forget)
    const ip = (req.headers['x-forwarded-for'] as string || req.ip || '').split(',')[0].trim();
    const ipHash = ip ? createHash('sha256').update(ip).digest('hex').slice(0, 16) : undefined;

    this.clickRepo.save(
      this.clickRepo.create({
        affiliate_link_id: linkId,
        source_page: 'redirect',
        ip_hash: ipHash,
        user_agent: req.headers['user-agent'],
      }),
    ).catch((err) => this.logger.error('Click save failed', err));

    // Build tracking URL
    let targetUrl = link.affiliate_url;
    const provider = this.providers.get(link.platform);

    if (provider) {
      const trackingId = this.getTrackingId(link.platform);
      if (trackingId) {
        targetUrl = provider.generateTrackingUrl({
          baseUrl: link.affiliate_url,
          trackingId,
        });
      }
    }

    // 302 redirect
    res.redirect(302, targetUrl);
  }

  private getTrackingId(platform: string): string | undefined {
    switch (platform) {
      case 'trendyol':
        return this.configService.get('TRENDYOL_AFFILIATE_ID');
      case 'hepsiburada':
        return this.configService.get('HEPSIBURADA_AFFILIATE_ID');
      case 'amazon_tr':
        return this.configService.get('AMAZON_ASSOCIATE_TAG');
      default:
        return undefined;
    }
  }
}
