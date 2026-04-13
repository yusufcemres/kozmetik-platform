import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { initSentry } from './sentry';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

// Initialize Sentry before app creation
initSentry();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const configService = app.get(ConfigService);
  const isProduction = configService.get('NODE_ENV') === 'production';

  // Security: Helmet
  app.use(helmet());

  // Response compression (gzip/deflate)
  app.use(compression({ threshold: 1024 }));

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  const allowedOrigins = isProduction
    ? [
        configService.get('WEB_URL', 'https://kozmetik-platform.vercel.app'),
        configService.get('MOBILE_URL', ''),
        configService.get('VERCEL_URL', ''),
      ].filter(Boolean)
    : [
        `http://localhost:${configService.get('WEB_PORT', 3000)}`,
        'http://localhost:3000',
      ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  });

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger — Faz L: public at /api/docs (B2B onboarding için)
  const swaggerPublic = configService.get('SWAGGER_PUBLIC', 'true') === 'true';
  if (!isProduction || swaggerPublic) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('REVELA Platform API')
      .setDescription('Kozmetik + Takviye + Bebek karar destek platformu API — B2B entegrasyonlar için public dokümantasyon')
      .setVersion('2.0')
      .addBearerAuth()
      .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'api-key')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const port = configService.get('PORT', configService.get('API_PORT', 3001));
  await app.listen(port, '0.0.0.0');

  const logger = new Logger('Bootstrap');
  logger.log(`API running on http://localhost:${port}`);
  if (!isProduction) {
    logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
  }
}

bootstrap();
