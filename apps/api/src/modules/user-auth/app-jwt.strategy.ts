import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserAuthService } from './user-auth.service';

export interface AppJwtPayload {
  sub: number;
  email: string;
  kind: 'app';
}

@Injectable()
export class AppJwtStrategy extends PassportStrategy(Strategy, 'app-jwt') {
  constructor(
    configService: ConfigService,
    private readonly userAuth: UserAuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'change-me'),
    });
  }

  async validate(payload: AppJwtPayload) {
    if (payload.kind !== 'app') {
      throw new UnauthorizedException('Yanlış token tipi');
    }
    const user = await this.userAuth.getUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Geçersiz kullanıcı');
    }
    return {
      user_id: user.user_id,
      email: user.email,
      display_name: user.display_name,
    };
  }
}
