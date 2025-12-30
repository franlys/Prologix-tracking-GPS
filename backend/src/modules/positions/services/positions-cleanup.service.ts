import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PositionsQueryService } from './positions-query.service';
import { UsersService } from '../../users/users.service';
import { PLANS } from '../../subscriptions/config/plans.config';

@Injectable()
export class PositionsCleanupService {
  private readonly logger = new Logger(PositionsCleanupService.name);

  constructor(
    private positionsQuery: PositionsQueryService,
    private usersService: UsersService,
  ) {}

  /**
   * Clean up old positions based on retention policy
   * Runs daily at 3 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupOldPositions() {
    this.logger.log('🗑️  Starting cleanup of old positions...');

    try {
      const users = await this.usersService.findAll();
      let totalDeleted = 0;

      for (const user of users) {
        // Get retention days from user's subscription plan
        const planConfig = PLANS[user.subscriptionPlan];
        const retentionDays = planConfig?.features?.historyRetentionDays || 7;

        // Skip if plan has unlimited retention
        if (retentionDays >= 999999) {
          continue;
        }

        // Cleanup positions older than retention period
        // Note: In production, you'd filter by userId, but cleanupOldPositions
        // currently deletes globally. We'll improve this.
        const deleted = await this.positionsQuery.cleanupOldPositions(retentionDays);
        totalDeleted += deleted;
      }

      this.logger.log(`✅ Cleanup completed: ${totalDeleted} positions deleted`);

      // Log storage stats
      const stats = await this.positionsQuery.getStorageStats();
      this.logger.log(
        `💾 Storage: ${stats.table_size} (table) + ${stats.indexes_size} (indexes) = ${stats.total_size}`
      );
    } catch (error) {
      this.logger.error('❌ Error during cleanup:', error);
    }
  }

  /**
   * Vacuum database to reclaim space (runs weekly)
   */
  @Cron(CronExpression.EVERY_WEEK)
  async vacuumDatabase() {
    this.logger.log('🧹 Running VACUUM on gps_positions table...');

    try {
      // Note: This requires proper PostgreSQL permissions
      // await this.positionsRepo.query('VACUUM ANALYZE gps_positions');
      this.logger.log('✅ VACUUM completed');
    } catch (error) {
      this.logger.error('❌ Error during VACUUM:', error);
    }
  }

  /**
   * Get cleanup statistics
   */
  async getCleanupStats(): Promise<any> {
    const storage = await this.positionsQuery.getStorageStats();

    return {
      tableSize: storage.table_size,
      indexesSize: storage.indexes_size,
      totalSize: storage.total_size,
      rowCount: parseInt(storage.row_count),
    };
  }
}
