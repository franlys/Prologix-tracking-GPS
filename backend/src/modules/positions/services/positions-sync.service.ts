import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GpsPosition } from '../entities/gps-position.entity';
import { TraccarService } from '../../../integrations/traccar/traccar.service';
import { GpsTraceService } from '../../../integrations/gps-trace/gps-trace.service';
import { UsersService } from '../../users/users.service';
import { GpsProvider } from '../../users/entities/user.entity';
import { PositionsGateway } from '../gateways/positions.gateway';
import { PositionsQueryService } from './positions-query.service';

@Injectable()
export class PositionsSyncService {
  private readonly logger = new Logger(PositionsSyncService.name);
  private isRunning = false;

  constructor(
    @InjectRepository(GpsPosition)
    private positionsRepo: Repository<GpsPosition>,
    private traccarService: TraccarService,
    private gpsTraceService: GpsTraceService,
    private usersService: UsersService,
    @Inject(forwardRef(() => PositionsGateway))
    private positionsGateway: PositionsGateway,
    @Inject(forwardRef(() => PositionsQueryService))
    private positionsQuery: PositionsQueryService,
  ) {}

  /**
   * Sync positions every 1 minute
   * Runs at: 00:00, 00:01, 00:02, etc.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async syncLatestPositions() {
    if (this.isRunning) {
      this.logger.warn('Previous sync still running, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      this.logger.log('🔄 Starting position sync...');

      // Get all active users
      const users = await this.usersService.findAll();
      let totalSynced = 0;

      for (const user of users) {
        if (!user.isActive) continue;

        try {
          const synced = await this.syncUserPositions(user);
          totalSynced += synced;
        } catch (error) {
          this.logger.error(
            `Error syncing positions for user ${user.email}:`,
            error.message
          );
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `✅ Sync completed: ${totalSynced} positions in ${duration}ms`
      );
    } catch (error) {
      this.logger.error('❌ Error in position sync:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Sync positions for a specific user
   */
  private async syncUserPositions(user: any): Promise<number> {
    if (user.gpsProvider === GpsProvider.TRACCAR) {
      return this.syncTraccarPositions(user);
    } else if (user.gpsProvider === GpsProvider.GPS_TRACE) {
      return this.syncGpsTracePositions(user);
    }

    return 0;
  }

  /**
   * Sync positions from Traccar
   */
  private async syncTraccarPositions(user: any): Promise<number> {
    if (!user.traccarUserId) return 0;

    try {
      const traccarUserId = parseInt(user.traccarUserId);

      // Get all devices for this user
      const devices = await this.traccarService.getDevices(traccarUserId);

      if (devices.length === 0) return 0;

      // Get latest positions for all devices
      const deviceIds = devices.map((d) => d.id);
      const positions = await this.traccarService.getPositions(deviceIds);

      let savedCount = 0;

      for (const position of positions) {
        const saved = await this.savePosition({
          deviceId: position.deviceId.toString(),
          userId: user.id,
          latitude: position.latitude,
          longitude: position.longitude,
          altitude: position.altitude,
          speed: position.speed * 1.852, // knots to km/h
          course: position.course,
          accuracy: position.accuracy,
          timestamp: new Date(position.deviceTime),
          address: position.address,
          batteryLevel: position.attributes?.batteryLevel,
          satellites: position.attributes?.sat,
          ignition: position.attributes?.ignition,
          motion: position.attributes?.motion,
          charge: position.attributes?.charge,
          rssi: position.attributes?.rssi,
          distance: position.attributes?.distance,
          totalDistance: position.attributes?.totalDistance,
          protocol: position.protocol,
          attributes: position.attributes,
        });

        if (saved) savedCount++;
      }

      if (savedCount > 0) {
        this.logger.debug(
          `Synced ${savedCount} positions for ${user.email} (Traccar)`
        );
      }

      return savedCount;
    } catch (error) {
      this.logger.error(
        `Error syncing Traccar positions for ${user.email}:`,
        error.message
      );
      return 0;
    }
  }

  /**
   * Sync positions from GPS-Trace
   */
  private async syncGpsTracePositions(user: any): Promise<number> {
    if (!user.gpsTraceUserId) return 0;

    try {
      const devices = await this.gpsTraceService.getDevices(user.gpsTraceUserId);

      let savedCount = 0;

      for (const device of devices) {
        try {
          const position = await this.gpsTraceService.getLastPosition(device.id);

          const saved = await this.savePosition({
            deviceId: device.id,
            userId: user.id,
            latitude: position.lat,
            longitude: position.lng,
            altitude: position.altitude,
            speed: position.speed,
            course: position.course,
            accuracy: 0, // GPS-Trace doesn't provide accuracy
            timestamp: new Date(position.timestamp),
            address: position.address,
            batteryLevel: null,
            satellites: null,
            ignition: null,
            motion: null,
            charge: null,
            rssi: null,
            distance: null,
            totalDistance: null,
            protocol: 'gps-trace',
            attributes: {},
          });

          if (saved) savedCount++;
        } catch (error) {
          // Device might be offline, skip
          continue;
        }
      }

      if (savedCount > 0) {
        this.logger.debug(
          `Synced ${savedCount} positions for ${user.email} (GPS-Trace)`
        );
      }

      return savedCount;
    } catch (error) {
      this.logger.error(
        `Error syncing GPS-Trace positions for ${user.email}:`,
        error.message
      );
      return 0;
    }
  }

  /**
   * Save a position to database (avoiding duplicates)
   */
  private async savePosition(data: Partial<GpsPosition>): Promise<boolean> {
    try {
      // Check if position already exists
      const existing = await this.positionsRepo.findOne({
        where: {
          deviceId: data.deviceId,
          timestamp: data.timestamp,
        },
      });

      if (existing) {
        return false; // Already saved
      }

      // Create and save new position
      const position = this.positionsRepo.create(data);
      await this.positionsRepo.save(position);

      // ========== REAL-TIME UPDATE VIA WEBSOCKET ==========
      // Emit position update to connected clients
      try {
        this.positionsGateway.emitPositionUpdate(position.userId, {
          deviceId: position.deviceId,
          latitude: Number(position.latitude),
          longitude: Number(position.longitude),
          speed: Number(position.speed) || 0,
          course: Number(position.course) || 0,
          altitude: Number(position.altitude) || 0,
          timestamp: position.timestamp.toISOString(),
          address: position.address,
          batteryLevel: position.batteryLevel,
          satellites: position.satellites,
          ignition: position.ignition,
          motion: position.motion,
        });

        // Also emit to device-specific subscribers
        this.positionsGateway.emitDevicePosition(position.deviceId, {
          deviceId: position.deviceId,
          latitude: Number(position.latitude),
          longitude: Number(position.longitude),
          speed: Number(position.speed) || 0,
          course: Number(position.course) || 0,
          timestamp: position.timestamp.toISOString(),
        });
      } catch (wsError) {
        // Don't fail position save if WebSocket emission fails
        this.logger.warn(
          `WebSocket emission failed for device ${position.deviceId}: ${wsError.message}`,
        );
      }

      // ========== INVALIDATE REDIS CACHE ==========
      // Invalidate cache for this device and user
      try {
        await this.positionsQuery.invalidateDeviceCache(
          position.deviceId,
          position.userId,
        );
      } catch (cacheError) {
        // Don't fail position save if cache invalidation fails
        this.logger.warn(
          `Cache invalidation failed for device ${position.deviceId}: ${cacheError.message}`,
        );
      }

      return true;
    } catch (error) {
      // Likely a unique constraint violation (race condition)
      if (error.code === '23505') {
        return false;
      }

      throw error;
    }
  }

  /**
   * Manually trigger sync (for testing or admin panel)
   */
  async manualSync(userId?: string): Promise<number> {
    this.logger.log(`🔄 Manual sync triggered${userId ? ` for user ${userId}` : ''}`);

    if (userId) {
      const user = await this.usersService.findById(userId);
      return this.syncUserPositions(user);
    } else {
      this.isRunning = false; // Reset flag
      await this.syncLatestPositions();
      return 0;
    }
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<any> {
    const stats = await this.positionsRepo
      .createQueryBuilder('pos')
      .select('COUNT(*)', 'total')
      .addSelect('MIN(pos.timestamp)', 'oldestPosition')
      .addSelect('MAX(pos.timestamp)', 'newestPosition')
      .addSelect('COUNT(DISTINCT pos.deviceId)', 'uniqueDevices')
      .addSelect('COUNT(DISTINCT pos.userId)', 'uniqueUsers')
      .getRawOne();

    // Get positions per day (last 7 days)
    const perDay = await this.positionsRepo
      .createQueryBuilder('pos')
      .select('DATE(pos.timestamp)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('pos.timestamp > NOW() - INTERVAL \'7 days\'')
      .groupBy('DATE(pos.timestamp)')
      .orderBy('DATE(pos.timestamp)', 'DESC')
      .getRawMany();

    return {
      total: parseInt(stats.total),
      oldestPosition: stats.oldestPosition,
      newestPosition: stats.newestPosition,
      uniqueDevices: parseInt(stats.uniqueDevices),
      uniqueUsers: parseInt(stats.uniqueUsers),
      lastSevenDays: perDay,
      syncRunning: this.isRunning,
    };
  }
}
