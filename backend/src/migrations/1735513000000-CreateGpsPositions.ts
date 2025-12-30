import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGpsPositions1735513000000 implements MigrationInterface {
  name = 'CreateGpsPositions1735513000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create gps_positions table
    await queryRunner.query(`
      CREATE TABLE "gps_positions" (
        "id" BIGSERIAL PRIMARY KEY,
        "device_id" VARCHAR(100) NOT NULL,
        "user_id" UUID NOT NULL,

        "latitude" DECIMAL(10, 8) NOT NULL,
        "longitude" DECIMAL(11, 8) NOT NULL,
        "altitude" DECIMAL(8, 2),
        "speed" DECIMAL(6, 2),
        "course" DECIMAL(5, 2),
        "accuracy" DECIMAL(6, 2),

        "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
        "server_time" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

        "address" TEXT,
        "battery_level" INTEGER,
        "satellites" INTEGER,
        "ignition" BOOLEAN,
        "motion" BOOLEAN,
        "charge" BOOLEAN,
        "rssi" INTEGER,

        "distance" DECIMAL(10, 2),
        "total_distance" DECIMAL(12, 2),

        "protocol" VARCHAR(50),
        "attributes" JSONB,

        CONSTRAINT "unique_position" UNIQUE ("device_id", "timestamp")
      )
    `);

    // Create indexes for performance
    await queryRunner.query(`
      CREATE INDEX "idx_positions_device_time"
      ON "gps_positions" ("device_id", "timestamp" DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_positions_user_time"
      ON "gps_positions" ("user_id", "timestamp" DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_positions_timestamp"
      ON "gps_positions" ("timestamp" DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_positions_device"
      ON "gps_positions" ("device_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_positions_user"
      ON "gps_positions" ("user_id")
    `);

    // Add foreign key constraint to users table
    await queryRunner.query(`
      ALTER TABLE "gps_positions"
      ADD CONSTRAINT "fk_positions_user"
      FOREIGN KEY ("user_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE
    `);

    console.log('✅ Migration: Created gps_positions table with indexes');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    await queryRunner.query(`
      ALTER TABLE "gps_positions"
      DROP CONSTRAINT "fk_positions_user"
    `);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "idx_positions_user"`);
    await queryRunner.query(`DROP INDEX "idx_positions_device"`);
    await queryRunner.query(`DROP INDEX "idx_positions_timestamp"`);
    await queryRunner.query(`DROP INDEX "idx_positions_user_time"`);
    await queryRunner.query(`DROP INDEX "idx_positions_device_time"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "gps_positions"`);

    console.log('✅ Migration rollback: Dropped gps_positions table');
  }
}
