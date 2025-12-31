import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { UserMigrationService } from './services/user-migration.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { UpdateUserGpsTraceDto } from './dto/update-user-gps-trace.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private adminService: AdminService,
    private migrationService: UserMigrationService,
  ) {}

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

  @Patch('users/:userId/role')
  async updateUserRole(
    @Param('userId') userId: string,
    @Body() body: { role: UserRole },
  ) {
    return this.adminService.updateUserRole(userId, body.role);
  }

  @Get('users/:userId/devices')
  async getUserDevices(@Param('userId') userId: string) {
    return this.adminService.getUserDevices(userId);
  }

  // ============================================
  // MIGRATION ENDPOINTS
  // ============================================

  @Get('migration/status')
  async getMigrationStatus() {
    return this.migrationService.getMigrationStatus();
  }

  @Get('migration/stats')
  async getMigrationStats() {
    return this.migrationService.getMigrationStats();
  }

  @Get('migration/test-traccar')
  async testTraccarConnection() {
    return this.migrationService.testTraccarConnection();
  }

  @Post('migration/user/:userId')
  async migrateUser(@Param('userId') userId: string) {
    return this.migrationService.migrateUserToTraccar(userId);
  }

  @Post('migration/user/:userId/rollback')
  async rollbackUserMigration(@Param('userId') userId: string) {
    return this.migrationService.rollbackMigration(userId);
  }

  @Post('migration/all')
  async migrateAllUsers() {
    return this.migrationService.migrateAllUsers();
  }
}
