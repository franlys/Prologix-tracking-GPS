import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModule } from '../users/users.module';
import { DevicesModule } from '../devices/devices.module';

@Module({
  imports: [UsersModule, DevicesModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
