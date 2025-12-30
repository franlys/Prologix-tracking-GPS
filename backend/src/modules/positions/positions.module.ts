import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GpsPosition } from './entities/gps-position.entity';
import { PositionsController } from './positions.controller';
import { PositionsSyncService } from './services/positions-sync.service';
import { PositionsQueryService } from './services/positions-query.service';
import { PositionsCleanupService } from './services/positions-cleanup.service';
import { PositionsGateway } from './gateways/positions.gateway';
import { TraccarModule } from '../../integrations/traccar/traccar.module';
import { GpsTraceModule } from '../../integrations/gps-trace/gps-trace.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GpsPosition]),
    ScheduleModule.forRoot(), // Enable cron jobs
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
    TraccarModule,
    GpsTraceModule,
    UsersModule,
  ],
  controllers: [PositionsController],
  providers: [
    PositionsSyncService,
    PositionsQueryService,
    PositionsCleanupService,
    PositionsGateway,
  ],
  exports: [PositionsQueryService, PositionsSyncService, PositionsGateway],
})
export class PositionsModule {}
