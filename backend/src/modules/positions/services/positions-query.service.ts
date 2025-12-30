import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { GpsPosition } from '../entities/gps-position.entity';

export interface PositionQuery {
  deviceId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface RoutePoint {
  lat: number;
  lng: number;
  speed: number;
  timestamp: string;
  address?: string;
}

@Injectable()
export class PositionsQueryService {
  private readonly logger = new Logger(PositionsQueryService.name);

  constructor(
    @InjectRepository(GpsPosition)
    private positionsRepo: Repository<GpsPosition>,
  ) {}

  /**
   * Get latest position for a device
   */
  async getLatestPosition(deviceId: string): Promise<GpsPosition | null> {
    return this.positionsRepo.findOne({
      where: { deviceId },
      order: { timestamp: 'DESC' },
    });
  }

  /**
   * Get latest positions for all devices of a user
   */
  async getLatestPositionsForUser(userId: string): Promise<GpsPosition[]> {
    // Subquery to get latest timestamp per device
    const subQuery = this.positionsRepo
      .createQueryBuilder('sub')
      .select('sub.deviceId', 'deviceId')
      .addSelect('MAX(sub.timestamp)', 'maxTimestamp')
      .where('sub.userId = :userId', { userId })
      .groupBy('sub.deviceId');

    // Main query to get full position data
    const positions = await this.positionsRepo
      .createQueryBuilder('pos')
      .innerJoin(
        '(' + subQuery.getQuery() + ')',
        'latest',
        'pos.deviceId = latest.deviceId AND pos.timestamp = latest.maxTimestamp'
      )
      .where('pos.userId = :userId', { userId })
      .setParameters(subQuery.getParameters())
      .orderBy('pos.timestamp', 'DESC')
      .getMany();

    return positions;
  }

  /**
   * Get position history for a device
   */
  async getHistory(query: PositionQuery): Promise<GpsPosition[]> {
    const qb = this.positionsRepo.createQueryBuilder('pos');

    if (query.deviceId) {
      qb.where('pos.deviceId = :deviceId', { deviceId: query.deviceId });
    }

    if (query.userId) {
      qb.andWhere('pos.userId = :userId', { userId: query.userId });
    }

    if (query.startDate && query.endDate) {
      qb.andWhere('pos.timestamp BETWEEN :start AND :end', {
        start: query.startDate,
        end: query.endDate,
      });
    } else if (query.startDate) {
      qb.andWhere('pos.timestamp >= :start', { start: query.startDate });
    } else if (query.endDate) {
      qb.andWhere('pos.timestamp <= :end', { end: query.endDate });
    }

    qb.orderBy('pos.timestamp', 'ASC');

    if (query.limit) {
      qb.limit(query.limit);
    }

    if (query.offset) {
      qb.offset(query.offset);
    }

    return qb.getMany();
  }

  /**
   * Get route for a device (simplified positions for map display)
   */
  async getRoute(
    deviceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<RoutePoint[]> {
    const positions = await this.positionsRepo.find({
      where: {
        deviceId,
        timestamp: Between(startDate, endDate),
      },
      select: ['latitude', 'longitude', 'speed', 'timestamp', 'address'],
      order: { timestamp: 'ASC' },
    });

    return positions.map((pos) => ({
      lat: Number(pos.latitude),
      lng: Number(pos.longitude),
      speed: Number(pos.speed) || 0,
      timestamp: pos.timestamp.toISOString(),
      address: pos.address,
    }));
  }

  /**
   * Get summary statistics for a device
   */
  async getSummary(deviceId: string, startDate: Date, endDate: Date): Promise<any> {
    const positions = await this.positionsRepo.find({
      where: {
        deviceId,
        timestamp: Between(startDate, endDate),
      },
      order: { timestamp: 'ASC' },
    });

    if (positions.length === 0) {
      return {
        deviceId,
        startDate,
        endDate,
        totalPoints: 0,
        totalDistance: 0,
        maxSpeed: 0,
        avgSpeed: 0,
        duration: 0,
        startPosition: null,
        endPosition: null,
      };
    }

    // Calculate statistics
    const totalDistance = this.calculateTotalDistance(positions);
    const speeds = positions.map((p) => Number(p.speed) || 0);
    const maxSpeed = Math.max(...speeds);
    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;

    const startPos = positions[0];
    const endPos = positions[positions.length - 1];
    const duration =
      (endPos.timestamp.getTime() - startPos.timestamp.getTime()) / 1000; // seconds

    return {
      deviceId,
      startDate,
      endDate,
      totalPoints: positions.length,
      totalDistance: parseFloat(totalDistance.toFixed(2)),
      maxSpeed: parseFloat(maxSpeed.toFixed(2)),
      avgSpeed: parseFloat(avgSpeed.toFixed(2)),
      duration: Math.round(duration),
      startPosition: {
        lat: Number(startPos.latitude),
        lng: Number(startPos.longitude),
        timestamp: startPos.timestamp.toISOString(),
      },
      endPosition: {
        lat: Number(endPos.latitude),
        lng: Number(endPos.longitude),
        timestamp: endPos.timestamp.toISOString(),
      },
    };
  }

  /**
   * Calculate total distance traveled
   */
  private calculateTotalDistance(positions: GpsPosition[]): number {
    let totalDistance = 0;

    for (let i = 1; i < positions.length; i++) {
      const prev = positions[i - 1];
      const curr = positions[i];

      const distance = this.haversineDistance(
        Number(prev.latitude),
        Number(prev.longitude),
        Number(curr.latitude),
        Number(curr.longitude)
      );

      totalDistance += distance;
    }

    return totalDistance;
  }

  /**
   * Haversine formula to calculate distance between two coordinates
   */
  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km

    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in km
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get positions count for a user (for analytics)
   */
  async getPositionsCount(userId: string, days: number = 30): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.positionsRepo.count({
      where: {
        userId,
        timestamp: Between(startDate, new Date()),
      },
    });
  }

  /**
   * Clean up old positions (called by cleanup service)
   */
  async cleanupOldPositions(retentionDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.positionsRepo
      .createQueryBuilder()
      .delete()
      .where('timestamp < :cutoffDate', { cutoffDate })
      .execute();

    const deletedCount = result.affected || 0;

    if (deletedCount > 0) {
      this.logger.log(
        `🗑️  Cleaned up ${deletedCount} positions older than ${retentionDays} days`
      );
    }

    return deletedCount;
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<any> {
    const stats = await this.positionsRepo.query(`
      SELECT
        pg_size_pretty(pg_total_relation_size('gps_positions')) as total_size,
        pg_size_pretty(pg_relation_size('gps_positions')) as table_size,
        pg_size_pretty(pg_indexes_size('gps_positions')) as indexes_size,
        COUNT(*) as row_count
      FROM gps_positions
    `);

    return stats[0];
  }
}
