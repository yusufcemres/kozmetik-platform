import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppUser, MagicLinkToken } from '@database/entities';
import { UserAuthService } from './user-auth.service';
import { UserAuthController } from './user-auth.controller';
import { AppJwtStrategy } from './app-jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppUser, MagicLinkToken]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        secret: c.get<string>('JWT_SECRET', 'change-me'),
      }),
    }),
  ],
  controllers: [UserAuthController],
  providers: [UserAuthService, AppJwtStrategy],
  exports: [UserAuthService],
})
export class UserAuthModule {}
