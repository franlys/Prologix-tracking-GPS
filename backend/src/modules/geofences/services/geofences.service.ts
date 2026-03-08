import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Geofence, GeofenceType } from '../entities/geofence.entity';
import { GeofenceState } from '../entities/geofence-state.entity';
import { CreateGeofenceDto } from '../dto/create-geofence.dto';
import { UpdateGeofenceDto } from '../dto/update-geofence.dto';

export interface GeofenceCheckResult {
  geofenceId: string;
  geofenceName: string;
  isInside: boolean;
  wasInside: boolean;
  entered: boolean;
  exited: boolean;
  distance: number; // Distance from center in meters
}

@Injectable()
export class GeofencesService {
  private readonly logger = new Logger(GeofencesService.name);

  constructor(
    @InjectRepository(Geofence)
    private geofencesRepo: Repository<Geofence>,
    @InjectRepository(GeofenceState)
    private geofenceStatesRepo: Repository<GeofenceState>,
  ) {}

  // ==================== CRUD ====================

  async create(userId: string, dto: CreateGeofenceDto): Promise<Geofence> {
    const geofence = this.geofencesRepo.create({
      ...dto,
      userId,
    });

    const saved = await this.geofencesRepo.save(geofence);
    this.logger.log(`✅ Created geofence: ${saved.name} for user ${userId}`);
    return saved;
  }

  async findAllByUser(userId: string): Promise<Geofence[]> {
    return this.geofencesRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Geofence> {
    const geofence = await this.geofencesRepo.findOne({
      where: { id, userId },
    });

    if (!geofence) {
      throw new NotFoundException('Geofence not found');
    }

    return geofence;
  }

  async update(id: string, userId: string, dto: UpdateGeofenceDto): Promise<Geofence> {
    const geofence = await this.findOne(id, userId);
    Object.assign(geofence, dto);
    const updated = await this.geofencesRepo.save(geofence);
    this.logger.log(`✅ Updated geofence: ${id}`);
    return updated;
  }

  async delete(id: string, userId: string): Promise<void> {
    const geofence = await this.findOne(id, userId);
    await this.geofencesRepo.remove(geofence);
    this.logger.log(`✅ Deleted geofence: ${id}`);
  }

  // ==================== GEOFENCE CHECKING ====================

  /**
   * Check if a point is inside a geofence
   */
  isPointInGeofence(
    lat: number,
    lng: number,
    geofence: Geofence,
  ): { isInside: boolean; distance: number } {
    if (geofence.type === GeofenceType.CIRCLE) {
      const distance = this.calculateDistance(
        lat,
        lng,
        Number(geofence.latitude),
        Number(geofence.longitude),
      );
      return {
        isInside: distance <= geofence.radiusMeters,
        distance,
      };
    } else if (geofence.type === GeofenceType.POLYGON && geofence.polygon) {
      const isInside = this.isPointInPolygon(lat, lng, geofence.polygon);
      // For polygon, distance is 0 if inside, otherwise distance to nearest edge
      return {
        isInside,
        distance: isInside ? 0 : this.distanceToPolygon(lat, lng, geofence.polygon),
      };
    }

    return { isInside: false, distance: Infinity };
  }

  /**
   * Calculate distance between two points using Haversine formula
   * Returns distance in meters
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Check if point is inside polygon using ray casting algorithm
   */
  private isPointInPolygon(
    lat: number,
    lng: number,
    polygon: { lat: number; lng: number }[],
  ): boolean {
    let inside = false;
    const n = polygon.length;

    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = polygon[i].lat;
      const yi = polygon[i].lng;
      const xj = polygon[j].lat;
      const yj = polygon[j].lng;

      const intersect =
        yi > lng !== yj > lng &&
        lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;

      if (intersect) {
        inside = !inside;
      }
    }

    return inside;
  }

  /**
   * Calculate minimum distance from point to polygon edges
   */
  private distanceToPolygon(
    lat: number,
    lng: number,
    polygon: { lat: number; lng: number }[],
  ): number {
    let minDistance = Infinity;
    const n = polygon.length;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const distance = this.calculateDistance(
        lat,
        lng,
        polygon[i].lat,
        polygon[i].lng,
      );
      minDistance = Math.min(minDistance, distance);
    }

    return minDistance;
  }

  // ==================== STATE MANAGEMENT ====================

  /**
   * Check device position against all applicable geofences and detect enter/exit events
   */
  async checkDeviceGeofences(
    userId: string,
    deviceId: string,
    lat: number,
    lng: number,
  ): Promise<GeofenceCheckResult[]> {
    // Get all active geofences for this user
    const geofences = await this.geofencesRepo.find({
      where: [
        { userId, isActive: true, deviceId: null }, // Geofences for all devices
        { userId, isActive: true, deviceId }, // Geofences for this specific device
      ],
    });

    const results: GeofenceCheckResult[] = [];

    for (const geofence of geofences) {
      // Get or create state for this geofence-device pair
      let state = await this.geofenceStatesRepo.findOne({
        where: { geofenceId: geofence.id, deviceId },
      });

      const wasInside = state?.isInside ?? false;
      const { isInside, distance } = this.isPointInGeofence(lat, lng, geofence);

      const entered = !wasInside && isInside;
      const exited = wasInside && !isInside;

      // Update state if changed
      if (entered || exited || !state) {
        if (!state) {
          state = this.geofenceStatesRepo.create({
            geofenceId: geofence.id,
            deviceId,
            isInside,
            lastLatitude: lat,
            lastLongitude: lng,
          });
        } else {
          state.isInside = isInside;
          state.lastLatitude = lat;
          state.lastLongitude = lng;
        }

        if (entered) {
          state.lastEnteredAt = new Date();
          this.logger.log(`📍 Device ${deviceId} ENTERED geofence "${geofence.name}"`);
        }
        if (exited) {
          state.lastExitedAt = new Date();
          this.logger.log(`📍 Device ${deviceId} EXITED geofence "${geofence.name}"`);
        }

        await this.geofenceStatesRepo.save(state);
      }

      // Only include in results if there was a state change
      if (entered || exited) {
        results.push({
          geofenceId: geofence.id,
          geofenceName: geofence.name,
          isInside,
          wasInside,
          entered,
          exited,
          distance,
        });
      }
    }

    return results;
  }

  /**
   * Get current state of a device relative to all geofences
   */
  async getDeviceGeofenceStates(
    userId: string,
    deviceId: string,
  ): Promise<{ geofence: Geofence; state: GeofenceState | null }[]> {
    const geofences = await this.geofencesRepo.find({
      where: [
        { userId, isActive: true, deviceId: null },
        { userId, isActive: true, deviceId },
      ],
    });

    const result = [];

    for (const geofence of geofences) {
      const state = await this.geofenceStatesRepo.findOne({
        where: { geofenceId: geofence.id, deviceId },
      });
      result.push({ geofence, state });
    }

    return result;
  }

  /**
   * Get count of geofences for a user (for subscription limits)
   */
  async countUserGeofences(userId: string): Promise<number> {
    return this.geofencesRepo.count({ where: { userId } });
  }
}
