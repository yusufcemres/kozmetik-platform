import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { BrandAccount } from '@database/entities';

export interface BrandJwtPayload {
  sub: number;        // account_id
  brand_id: number;
  email: string;
  plan: string;
  type: 'brand';      // Distinguishes from admin JWT
}

@Injectable()
export class BrandJwtStrategy extends PassportStrategy(Strategy, 'brand-jwt') {
  constructor(
    configService: ConfigService,
    @InjectRepository(BrandAccount)
    private readonly brandAccountRepo: Repository<BrandAccount>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'change-me'),
    });
  }

  async validate(payload: BrandJwtPayload) {
    if (payload.type !== 'brand') {
      throw new UnauthorizedException('Geçersiz token tipi');
    }

    const account = await this.brandAccountRepo.findOne({
      where: { account_id: payload.sub, is_active: true },
      relations: ['brand'],
    });

    if (!account) {
      throw new UnauthorizedException('Geçersiz token veya hesap deaktif');
    }

    return {
      account_id: account.account_id,
      brand_id: account.brand_id,
      email: account.email,
      plan: account.plan,
      representative_name: account.representative_name,
      brand_name: account.brand?.brand_name,
      verification_status: account.verification_status,
    };
  }
}
