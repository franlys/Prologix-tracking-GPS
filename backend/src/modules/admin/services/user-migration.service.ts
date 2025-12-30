import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, GpsProvider } from '../../users/entities/user.entity';
import { TraccarService } from '../../../integrations/traccar/traccar.service';
import { GpsTraceService } from '../../../integrations/gps-trace/gps-trace.service';

export interface MigrationStatus {
  userId: string;
  email: string;
  currentProvider: GpsProvider;
  migrationStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
  traccarUserId?: string;
  devicesCount?: number;
  lastError?: string;
}

export interface MigrationResult {
  success: boolean;
  userId: string;
  traccarUserId?: string;
  devicesCreated?: number;
  message: string;
  error?: string;
}

@Injectable()
export class UserMigrationService {
  private readonly logger = new Logger(UserMigrationService.name);

  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private traccarService: TraccarService,
    private gpsTraceService: GpsTraceService,
  ) {}

  /**
   * Migrate a single user from GPS-Trace to Traccar
   */
  async migrateUserToTraccar(prologixUserId: string): Promise<MigrationResult> {
    const user = await this.usersRepo.findOne({ where: { id: prologixUserId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.gpsProvider === GpsProvider.TRACCAR) {
      return {
        success: false,
        userId: user.id,
        message: 'User is already on Traccar',
      };
    }

    if (!user.gpsTraceUserId) {
      return {
        success: false,
        userId: user.id,
        message: 'User does not have GPS-Trace account',
      };
    }

    try {
      this.logger.log(`🔄 Starting migration for user ${user.email} (${user.id})`);

      // Step 1: Create Traccar user account
      const traccarUser = await this.traccarService.createUser({
        name: user.name,
        email: user.email,
        phone: user.phoneNumber || '',
        disabled: !user.isActive,
        administrator: false,
        readonly: false,
      });

      this.logger.log(`✅ Created Traccar user: ${traccarUser.id}`);

      // Step 2: Get devices from GPS-Trace
      let devicesCreated = 0;
      try {
        const gpsTraceDevices = await this.gpsTraceService.getDevices(
          user.gpsTraceUserId,
        );

        this.logger.log(`📱 Found ${gpsTraceDevices.length} devices in GPS-Trace`);

        // Step 3: Create devices in Traccar
        for (const device of gpsTraceDevices) {
          try {
            const traccarDevice = await this.traccarService.createDevice({
              name: device.name || `Device ${device.imei}`,
              uniqueId: device.imei,
              disabled: false,
              groupId: 0,
            });

            // Link device to user
            await this.traccarService.linkDeviceToUser(
              traccarDevice.id,
              traccarUser.id,
            );

            devicesCreated++;
            this.logger.log(`✅ Migrated device: ${device.imei} -> Traccar ID ${traccarDevice.id}`);
          } catch (error) {
            this.logger.warn(
              `⚠️  Failed to migrate device ${device.imei}: ${error.message}`,
            );
          }
        }
      } catch (error) {
        this.logger.warn(
          `⚠️  Could not fetch GPS-Trace devices: ${error.message}`,
        );
      }

      // Step 4: Update user to use Traccar
      user.traccarUserId = traccarUser.id.toString();
      user.gpsProvider = GpsProvider.TRACCAR;
      await this.usersRepo.save(user);

      this.logger.log(
        `🎉 Migration completed for ${user.email}: ${devicesCreated} devices migrated`,
      );

      return {
        success: true,
        userId: user.id,
        traccarUserId: traccarUser.id.toString(),
        devicesCreated,
        message: `Successfully migrated to Traccar. Created ${devicesCreated} devices.`,
      };
    } catch (error) {
      this.logger.error(
        `❌ Migration failed for ${user.email}: ${error.message}`,
        error.stack,
      );

      return {
        success: false,
        userId: user.id,
        message: 'Migration failed',
        error: error.message,
      };
    }
  }

  /**
   * Rollback user migration (switch back to GPS-Trace)
   */
  async rollbackMigration(prologixUserId: string): Promise<MigrationResult> {
    const user = await this.usersRepo.findOne({ where: { id: prologixUserId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.gpsProvider === GpsProvider.GPS_TRACE) {
      return {
        success: false,
        userId: user.id,
        message: 'User is already on GPS-Trace',
      };
    }

    if (!user.gpsTraceUserId) {
      return {
        success: false,
        userId: user.id,
        message: 'User does not have GPS-Trace account to rollback to',
      };
    }

    try {
      this.logger.log(`⏪ Rolling back migration for user ${user.email}`);

      // Switch back to GPS-Trace
      user.gpsProvider = GpsProvider.GPS_TRACE;
      await this.usersRepo.save(user);

      this.logger.log(`✅ Rollback completed for ${user.email}`);

      return {
        success: true,
        userId: user.id,
        message: 'Successfully rolled back to GPS-Trace',
      };
    } catch (error) {
      this.logger.error(`❌ Rollback failed for ${user.email}: ${error.message}`);

      return {
        success: false,
        userId: user.id,
        message: 'Rollback failed',
        error: error.message,
      };
    }
  }

  /**
   * Get migration status for all users
   */
  async getMigrationStatus(): Promise<MigrationStatus[]> {
    const users = await this.usersRepo.find();

    return users.map((user) => {
      let migrationStatus: 'pending' | 'in_progress' | 'completed' | 'failed' =
        'pending';

      if (user.gpsProvider === GpsProvider.TRACCAR && user.traccarUserId) {
        migrationStatus = 'completed';
      } else if (user.gpsProvider === GpsProvider.GPS_TRACE && !user.gpsTraceUserId) {
        migrationStatus = 'failed';
      }

      return {
        userId: user.id,
        email: user.email,
        currentProvider: user.gpsProvider,
        migrationStatus,
        traccarUserId: user.traccarUserId,
      };
    });
  }

  /**
   * Get migration statistics
   */
  async getMigrationStats(): Promise<any> {
    const users = await this.usersRepo.find();

    const stats = {
      total: users.length,
      onGpsTrace: 0,
      onTraccar: 0,
      migrationRate: 0,
      users: {
        gpsTrace: [] as string[],
        traccar: [] as string[],
      },
    };

    for (const user of users) {
      if (user.gpsProvider === GpsProvider.GPS_TRACE) {
        stats.onGpsTrace++;
        stats.users.gpsTrace.push(user.email);
      } else if (user.gpsProvider === GpsProvider.TRACCAR) {
        stats.onTraccar++;
        stats.users.traccar.push(user.email);
      }
    }

    stats.migrationRate =
      stats.total > 0 ? Math.round((stats.onTraccar / stats.total) * 100) : 0;

    return stats;
  }

  /**
   * Bulk migrate all users from GPS-Trace to Traccar
   */
  async migrateAllUsers(): Promise<{
    total: number;
    successful: number;
    failed: number;
    results: MigrationResult[];
  }> {
    const users = await this.usersRepo.find({
      where: { gpsProvider: GpsProvider.GPS_TRACE },
    });

    this.logger.log(`🚀 Starting bulk migration for ${users.length} users`);

    const results: MigrationResult[] = [];
    let successful = 0;
    let failed = 0;

    for (const user of users) {
      const result = await this.migrateUserToTraccar(user.id);
      results.push(result);

      if (result.success) {
        successful++;
      } else {
        failed++;
      }

      // Add delay between migrations to avoid rate limiting
      await this.delay(2000);
    }

    this.logger.log(
      `✅ Bulk migration completed: ${successful} successful, ${failed} failed`,
    );

    return {
      total: users.length,
      successful,
      failed,
      results,
    };
  }

  /**
   * Test Traccar connection and credentials
   */
  async testTraccarConnection(): Promise<{
    success: boolean;
    message: string;
    server?: any;
  }> {
    try {
      const server = await this.traccarService.getServer();
      return {
        success: true,
        message: 'Traccar connection successful',
        server: {
          version: server.version,
          id: server.id,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Traccar connection failed: ${error.message}`,
      };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
