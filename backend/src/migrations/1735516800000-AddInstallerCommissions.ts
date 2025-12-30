import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInstallerCommissions1735516800000 implements MigrationInterface {
  name = 'AddInstallerCommissions1735516800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar campo installerId a users (referencia al instalador que lo agregó)
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "installer_id" uuid NULL
    `);

    // Agregar foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT "fk_users_installer"
      FOREIGN KEY ("installer_id")
      REFERENCES "users"("id")
      ON DELETE SET NULL
    `);

    // Crear tabla de comisiones
    await queryRunner.query(`
      CREATE TABLE "installer_commissions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "installer_id" uuid NOT NULL,
        "client_id" uuid NOT NULL,
        "subscription_plan" varchar(50) NOT NULL,
        "subscription_amount" decimal(10,2) NOT NULL,
        "commission_percentage" decimal(5,2) NOT NULL DEFAULT 10.00,
        "commission_amount" decimal(10,2) NOT NULL,
        "payment_status" varchar(20) NOT NULL DEFAULT 'PENDING',
        "paid_at" timestamptz NULL,
        "notes" text NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),

        CONSTRAINT "fk_commission_installer" FOREIGN KEY ("installer_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_commission_client" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Crear índices para comisiones
    await queryRunner.query(`
      CREATE INDEX "idx_commissions_installer" ON "installer_commissions"("installer_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_commissions_client" ON "installer_commissions"("client_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_commissions_status" ON "installer_commissions"("payment_status")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_commissions_created" ON "installer_commissions"("created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "installer_commissions"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "fk_users_installer"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "installer_id"`);
  }
}
