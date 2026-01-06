import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { databaseConfig } from './config/database.config';
import { cacheConfig } from './config/cache.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DevicesModule } from './modules/devices/devices.module';
import { AdminModule } from './modules/admin/admin.module';
import { InstallersModule } from './modules/installers/installers.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PositionsModule } from './modules/positions/positions.module';
import { GpsTraceModule } from './integrations/gps-trace/gps-trace.module';
import { CommonModule } from './common/common.module';
import { LegalModule } from './modules/legal/legal.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(databaseConfig()),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: cacheConfig,
    }),
    CommonModule,
    AuthModule,
    UsersModule,
    DevicesModule,
    AdminModule,
    InstallersModule,
    NotificationsModule,
    SubscriptionsModule,
    PositionsModule,
    GpsTraceModule,
    LegalModule,
  ],
})
export class AppModule {}
