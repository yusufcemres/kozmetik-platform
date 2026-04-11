import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  BrandAccount,
  BrandQuestion,
  BrandCertificate,
  BrandProductEdit,
  Brand,
  Product,
  ProductIngredient,
} from '@database/entities';
import { BrandPortalController } from './brand-portal.controller';
import { BrandPortalService } from './brand-portal.service';
import { BrandJwtStrategy } from './strategies/brand-jwt.strategy';
import { BrandPlanGuard } from './guards/brand-plan.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BrandAccount,
      BrandQuestion,
      BrandCertificate,
      BrandProductEdit,
      Brand,
      Product,
      ProductIngredient,
    ]),
    PassportModule.register({ defaultStrategy: 'brand-jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'change-me'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRY', '7d') as any,
        },
      }),
    }),
  ],
  controllers: [BrandPortalController],
  providers: [BrandPortalService, BrandJwtStrategy, BrandPlanGuard],
  exports: [BrandPortalService],
})
export class BrandPortalModule {}
