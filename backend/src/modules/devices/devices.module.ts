import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesController } from './devices.controller';
import { DeviceManagementController } from './device-management.controller';
import { DevicesService } from './devices.service';
import { DeviceManagementService } from './device-management.service';
import { SmsService } from './sms.service';
import { Device } from './entities/device.entity';
import { GpsTraceModule } from '../../integrations/gps-trace/gps-trace.module';
import { TraccarModule } from '../../integrations/traccar/traccar.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Device]),
    GpsTraceModule,
    TraccarModule,
    UsersModule,
  ],
  controllers: [DevicesController, DeviceManagementController],
  providers: [DevicesService, DeviceManagementService, SmsService],
  exports: [DevicesService, DeviceManagementService, SmsService],
})
export class DevicesModule {}
