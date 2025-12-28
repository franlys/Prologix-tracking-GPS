import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddNotifications1735405200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add phoneNumber column to users table
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "phoneNumber" VARCHAR;
    `);

    // Create notification_rules table
    await queryRunner.createTable(
      new Table({
        name: 'notification_rules',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'deviceId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: [
              'DEVICE_OFFLINE',
              'SPEED_EXCEEDED',
              'GEOFENCE_ENTER',
              'GEOFENCE_EXIT',
              'LOW_BATTERY',
            ],
          },
          {
            name: 'channel',
            type: 'enum',
            enum: ['EMAIL', 'WHATSAPP', 'BOTH'],
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'config',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'cooldownSeconds',
            type: 'integer',
            default: 300,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Create foreign key for userId
    await queryRunner.createForeignKey(
      'notification_rules',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create notification_logs table
    await queryRunner.createTable(
      new Table({
        name: 'notification_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'deviceId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'deviceName',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: [
              'DEVICE_OFFLINE',
              'SPEED_EXCEEDED',
              'GEOFENCE_ENTER',
              'GEOFENCE_EXIT',
              'LOW_BATTERY',
            ],
          },
          {
            name: 'channel',
            type: 'enum',
            enum: ['EMAIL', 'WHATSAPP', 'BOTH'],
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'SENT', 'FAILED'],
            default: "'PENDING'",
          },
          {
            name: 'message',
            type: 'text',
          },
          {
            name: 'recipient',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'errorMessage',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'sentAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create foreign key for userId
    await queryRunner.createForeignKey(
      'notification_logs',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_notification_rules_userId" ON "notification_rules" ("userId");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_notification_rules_deviceId" ON "notification_rules" ("deviceId");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_notification_logs_userId" ON "notification_logs" ("userId");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_notification_logs_createdAt" ON "notification_logs" ("createdAt");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_notification_logs_createdAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_notification_logs_userId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_notification_rules_deviceId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_notification_rules_userId"`);

    // Drop tables
    await queryRunner.dropTable('notification_logs');
    await queryRunner.dropTable('notification_rules');

    // Remove phoneNumber column from users
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "phoneNumber";
    `);
  }
}
