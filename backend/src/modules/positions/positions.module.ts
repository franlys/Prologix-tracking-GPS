import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { GpsPosition } from './entities/gps-position.entity';
import { PositionsController } from './positions.controller';
import { PositionsSyncService } from './services/positions-sync.service';
import { PositionsQueryService } from './services/positions-query.service';
import { PositionsCleanupService } from './services/positions-cleanup.service';
import { TraccarModule } from '../../integrations/traccar/traccar.module';
import { GpsTraceModule } from '../../integrations/gps-trace/gps-trace.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GpsPosition]),
    ScheduleModule.forRoot(), // Enable cron jobs
    TraccarModule,
    GpsTraceModule,
    UsersModule,
  ],
  controllers: [PositionsController],
  providers: [
    PositionsSyncService,
    PositionsQueryService,
    PositionsCleanupService,
  ],
  exports: [PositionsQueryService, PositionsSyncService],
})
export class PositionsModule {}
