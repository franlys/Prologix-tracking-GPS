import { Controller, Get, Query, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PositionsQueryService, PositionQuery } from './services/positions-query.service';
import { PositionsSyncService } from './services/positions-sync.service';
import { PositionsCleanupService } from './services/positions-cleanup.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('positions')
@UseGuards(JwtAuthGuard)
export class PositionsController {
  constructor(
    private positionsQuery: PositionsQueryService,
    private positionsSync: PositionsSyncService,
    private positionsCleanup: PositionsCleanupService,
  ) {}

  /**
   * Get latest positions for current user's devices
   * GET /positions/latest
   */
  @Get('latest')
  async getLatestPositions(@Request() req) {
    const userId = req.user.userId;
    return this.positionsQuery.getLatestPositionsForUser(userId);
  }

  /**
   * Get latest position for a specific device
   * GET /positions/device/:deviceId/latest
   */
  @Get('device/:deviceId/latest')
  async getLatestPosition(@Param('deviceId') deviceId: string) {
    return this.positionsQuery.getLatestPosition(deviceId);
  }

  /**
   * Get position history for a device
   * GET /positions/device/:deviceId/history?startDate=...&endDate=...&limit=100
   */
  @Get('device/:deviceId/history')
  async getHistory(
    @Param('deviceId') deviceId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('limit') limit: string,
    @Query('offset') offset: string,
  ) {
    const query: PositionQuery = {
      deviceId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : 1000,
      offset: offset ? parseInt(offset) : 0,
    };

    return this.positionsQuery.getHistory(query);
  }

  /**
   * Get route for a device (simplified for map display)
   * GET /positions/device/:deviceId/route?startDate=...&endDate=...
   */
  @Get('device/:deviceId/route')
  async getRoute(
    @Param('deviceId') deviceId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 86400000); // Last 24h
    const end = endDate ? new Date(endDate) : new Date();

    return this.positionsQuery.getRoute(deviceId, start, end);
  }

  /**
   * Get summary statistics for a device
   * GET /positions/device/:deviceId/summary?startDate=...&endDate=...
   */
  @Get('device/:deviceId/summary')
  async getSummary(
    @Param('deviceId') deviceId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 86400000);
    const end = endDate ? new Date(endDate) : new Date();

    return this.positionsQuery.getSummary(deviceId, start, end);
  }

  /**
   * Get sync statistics (admin only)
   * GET /positions/admin/sync-stats
   */
  @Get('admin/sync-stats')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async getSyncStats() {
    return this.positionsSync.getSyncStats();
  }

  /**
   * Manually trigger sync (admin only)
   * GET /positions/admin/sync
   */
  @Get('admin/sync')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async manualSync(@Query('userId') userId?: string) {
    const synced = await this.positionsSync.manualSync(userId);
    return {
      success: true,
      synced,
      message: `Synced ${synced} positions`,
    };
  }

  /**
   * Get cleanup statistics (admin only)
   * GET /positions/admin/cleanup-stats
   */
  @Get('admin/cleanup-stats')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async getCleanupStats() {
    return this.positionsCleanup.getCleanupStats();
  }

  /**
   * Get storage statistics (admin only)
   * GET /positions/admin/storage-stats
   */
  @Get('admin/storage-stats')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async getStorageStats() {
    return this.positionsQuery.getStorageStats();
  }
}
