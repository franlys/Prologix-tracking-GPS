import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserMigrationService } from './services/user-migration.service';
import { UsersModule } from '../users/users.module';
import { DevicesModule } from '../devices/devices.module';
import { TraccarModule } from '../../integrations/traccar/traccar.module';
import { GpsTraceModule } from '../../integrations/gps-trace/gps-trace.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UsersModule,
    DevicesModule,
    TraccarModule,
    GpsTraceModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, UserMigrationService],
  exports: [UserMigrationService],
})
export class AdminModule {}
