import { Module } from '@nestjs/common';
import { GpsTraceService } from './gps-trace.service';

@Module({
  providers: [GpsTraceService],
  exports: [GpsTraceService],
})
export class GpsTraceModule {}
