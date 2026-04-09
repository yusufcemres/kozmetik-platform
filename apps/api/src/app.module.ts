import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HealthController } from './health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { IngredientsModule } from './modules/ingredients/ingredients.module';
import { NeedsModule } from './modules/needs/needs.module';
import { ProductsModule } from './modules/products/products.module';
import { IngestionModule } from './modules/ingestion/ingestion.module';
import { MappingsModule } from './modules/mappings/mappings.module';
import { MethodologyModule } from './modules/methodology/methodology.module';
import { ScoringModule } from './modules/scoring/scoring.module';
import { SearchModule } from './modules/search/search.module';
import { ContentModule } from './modules/content/content.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { SystemModule } from './modules/system/system.module';
import { SupplementsModule } from './modules/supplements/supplements.module';
import { InteractionsModule } from './modules/interactions/interactions.module';
import { AffiliateModule } from './modules/affiliate/affiliate.module';
import { B2bModule } from './modules/b2b/b2b.module';
import { PriceAlertsModule } from './modules/price-alerts/price-alerts.module';
import { RedisCacheModule } from './common/cache/cache.module';

// DB connection is conditional — works without Docker for initial development
const skipDb = process.env.SKIP_DB === 'true';

const dbModule = skipDb
  ? []
  : [
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          type: 'postgres' as const,
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USER', 'kozmetik'),
          password: configService.get<string>('DB_PASS', 'kozmetik_dev'),
          database: configService.get<string>('DB_NAME', 'kozmetik_platform'),
          autoLoadEntities: true,
          synchronize: configService.get('DB_SYNC', 'false') === 'true',
          logging: configService.get('NODE_ENV') === 'development',
          ssl: configService.get('DB_SSL', 'false') === 'true'
            ? { rejectUnauthorized: false }
            : false,
        }),
      }),
    ];

// Auth and other DB-dependent modules
const featureModules = skipDb
  ? []
  : [
      AuthModule, CategoriesModule, BrandsModule, IngredientsModule, NeedsModule,
      ProductsModule, IngestionModule, MappingsModule, MethodologyModule,
      ScoringModule, SearchModule, ContentModule, ProfilesModule, SystemModule,
      SupplementsModule, InteractionsModule, AffiliateModule, B2bModule, PriceAlertsModule,
    ];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    // Global rate limiting: 60 req/min per IP for public endpoints
    ThrottlerModule.forRoot([{
      name: 'public',
      ttl: 60000,
      limit: 60,
    }]),
    RedisCacheModule,
    ...dbModule,
    ...featureModules,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
