import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { SmsService } from './sms.service';
import { GpsTraceModule } from '../../integrations/gps-trace/gps-trace.module';
import { TraccarModule } from '../../integrations/traccar/traccar.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [GpsTraceModule, TraccarModule, UsersModule],
  controllers: [DevicesController],
  providers: [DevicesService, SmsService],
  exports: [DevicesService, SmsService],
})
export class DevicesModule {}
