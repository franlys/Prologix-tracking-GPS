import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import dataSource from './config/database.config';

const logger = new Logger('Bootstrap');

async function runMigrations() {
  try {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
    const pending = await dataSource.showMigrations();
    if (pending) {
      logger.log('🔄 Running pending migrations...');
      await dataSource.runMigrations();
      logger.log('✅ Migrations completed');
    } else {
      logger.log('✅ No pending migrations');
    }
    await dataSource.destroy();
  } catch (error) {
    logger.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

async function bootstrap() {
  await runMigrations();

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Health check endpoint for Railway zero-downtime deploys
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Prologix Tracking GPS Backend running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
}


bootstrap();
