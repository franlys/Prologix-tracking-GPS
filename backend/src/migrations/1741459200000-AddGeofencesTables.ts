import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGeofencesTables1741459200000 implements MigrationInterface {
  name = 'AddGeofencesTables1741459200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create geofence_type enum
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."geofence_type_enum" AS ENUM('CIRCLE', 'POLYGON');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create geofences table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "geofences" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "name" character varying NOT NULL,
        "description" character varying,
        "type" "public"."geofence_type_enum" NOT NULL DEFAULT 'CIRCLE',
        "latitude" numeric(10,7) NOT NULL,
        "longitude" numeric(10,7) NOT NULL,
        "radiusMeters" integer NOT NULL DEFAULT 100,
        "polygon" jsonb,
        "alertOnEnter" boolean NOT NULL DEFAULT true,
        "alertOnExit" boolean NOT NULL DEFAULT true,
        "isActive" boolean NOT NULL DEFAULT true,
        "color" character varying NOT NULL DEFAULT '#3B82F6',
        "deviceId" character varying,
        "traccarGeofenceId" integer,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_geofences" PRIMARY KEY ("id")
      )
    `);

    // Create geofence_states table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "geofence_states" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "geofenceId" uuid NOT NULL,
        "deviceId" character varying NOT NULL,
        "isInside" boolean NOT NULL DEFAULT false,
        "lastEnteredAt" TIMESTAMP,
        "lastExitedAt" TIMESTAMP,
        "lastLatitude" numeric(10,7),
        "lastLongitude" numeric(10,7),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_geofence_states" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_geofence_device" UNIQUE ("geofenceId", "deviceId")
      )
    `);

    // Add foreign key from geofences to users
    await queryRunner.query(`
      ALTER TABLE "geofences"
      ADD CONSTRAINT "FK_geofences_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Add foreign key from geofence_states to geofences
    await queryRunner.query(`
      ALTER TABLE "geofence_states"
      ADD CONSTRAINT "FK_geofence_states_geofence"
      FOREIGN KEY ("geofenceId") REFERENCES "geofences"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_geofences_userId_isActive"
      ON "geofences" ("userId", "isActive")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_geofence_states_deviceId_geofenceId"
      ON "geofence_states" ("deviceId", "geofenceId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_geofence_states_deviceId_geofenceId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_geofences_userId_isActive"`);

    // Drop foreign keys
    await queryRunner.query(`ALTER TABLE "geofence_states" DROP CONSTRAINT IF EXISTS "FK_geofence_states_geofence"`);
    await queryRunner.query(`ALTER TABLE "geofences" DROP CONSTRAINT IF EXISTS "FK_geofences_user"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "geofence_states"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "geofences"`);

    // Drop enum
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."geofence_type_enum"`);
  }
}
