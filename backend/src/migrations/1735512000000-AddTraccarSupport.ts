import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTraccarSupport1735512000000 implements MigrationInterface {
  name = 'AddTraccarSupport1735512000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create GPS Provider enum type
    await queryRunner.query(`
      CREATE TYPE "public"."users_gpsprovider_enum" AS ENUM('GPS_TRACE', 'TRACCAR')
    `);

    // Add GPS provider column (default to GPS_TRACE for existing users)
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD "gpsProvider" "public"."users_gpsprovider_enum" NOT NULL DEFAULT 'GPS_TRACE'
    `);

    // Add Traccar user ID column
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD "traccarUserId" character varying
    `);

    console.log('✅ Migration: Added Traccar support to users table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove Traccar columns
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "traccarUserId"
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "gpsProvider"
    `);

    // Drop enum type
    await queryRunner.query(`
      DROP TYPE "public"."users_gpsprovider_enum"
    `);

    console.log('✅ Migration rollback: Removed Traccar support from users table');
  }
}
