import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { UpdateUserGpsTraceDto } from './dto/update-user-gps-trace.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:userId')
  async getUserById(@Param('userId') userId: string) {
    return this.adminService.getUserById(userId);
  }

  @Patch('users/:userId/gps-trace')
  async updateUserGpsTrace(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserGpsTraceDto,
  ) {
    return this.adminService.updateUserGpsTrace(userId, dto.gpsTraceUserId);
  }

  @Get('users/:userId/devices')
  async getUserDevices(@Param('userId') userId: string) {
    return this.adminService.getUserDevices(userId);
  }
}
