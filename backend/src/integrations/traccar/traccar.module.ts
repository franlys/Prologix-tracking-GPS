import { Module } from '@nestjs/common';
import { TraccarService } from './traccar.service';

@Module({
  providers: [TraccarService],
  exports: [TraccarService],
})
export class TraccarModule {}
