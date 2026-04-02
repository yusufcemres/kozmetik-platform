import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';

// DB connection is conditional — works without Docker for initial development
const dbModule = process.env.SKIP_DB === 'true'
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
          entities: [__dirname + '/database/entities/**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
          synchronize: false,
          logging: configService.get('NODE_ENV') === 'development',
        }),
      }),
    ];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    ...dbModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
