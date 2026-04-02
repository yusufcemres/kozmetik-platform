import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { AdminUser } from '@database/entities';

export interface JwtPayload {
  sub: number;
  email: string;
  role_key: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(AdminUser)
    private readonly adminUserRepo: Repository<AdminUser>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'change-me'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.adminUserRepo.findOne({
      where: { admin_user_id: payload.sub, is_active: true },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('Geçersiz token veya hesap deaktif');
    }

    return {
      admin_user_id: user.admin_user_id,
      email: user.email,
      full_name: user.full_name,
      role_key: user.role.role_key,
      permissions: user.role.permissions || [],
    };
  }
}
