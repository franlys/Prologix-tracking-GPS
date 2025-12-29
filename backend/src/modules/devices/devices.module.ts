import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { GpsTraceModule } from '../../integrations/gps-trace/gps-trace.module';
import { TraccarModule } from '../../integrations/traccar/traccar.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [GpsTraceModule, TraccarModule, UsersModule],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
