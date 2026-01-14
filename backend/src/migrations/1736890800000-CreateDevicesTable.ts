import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateDevicesTable1736890800000 implements MigrationInterface {
  name = 'CreateDevicesTable1736890800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear enum para status
    await queryRunner.query(`
      CREATE TYPE "device_status_enum" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING')
    `);

    // Crear enum para tipo de dispositivo
    await queryRunner.query(`
      CREATE TYPE "device_type_enum" AS ENUM ('COBAN_303', 'COBAN_GPS103', 'GT06', 'TK103', 'OTHER')
    `);

    // Crear tabla de dispositivos
    await queryRunner.createTable(
      new Table({
        name: 'devices',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'imei',
            type: 'varchar',
            length: '15',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'simNumber',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'simCarrier',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'simExpirationDate',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'deviceType',
            type: 'device_type_enum',
            default: "'OTHER'",
          },
          {
            name: 'status',
            type: 'device_status_enum',
            default: "'PENDING'",
          },
          {
            name: 'traccarDeviceId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'owner_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'installer_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'vehicleDescription',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          {
            name: 'vehiclePlate',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'installedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Agregar foreign keys
    await queryRunner.createForeignKey(
      'devices',
      new TableForeignKey({
        columnNames: ['owner_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'devices',
      new TableForeignKey({
        columnNames: ['installer_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    // Crear índices para búsquedas comunes
    await queryRunner.createIndex(
      'devices',
      new TableIndex({
        name: 'IDX_DEVICE_IMEI',
        columnNames: ['imei'],
      }),
    );

    await queryRunner.createIndex(
      'devices',
      new TableIndex({
        name: 'IDX_DEVICE_OWNER',
        columnNames: ['owner_id'],
      }),
    );

    await queryRunner.createIndex(
      'devices',
      new TableIndex({
        name: 'IDX_DEVICE_INSTALLER',
        columnNames: ['installer_id'],
      }),
    );

    await queryRunner.createIndex(
      'devices',
      new TableIndex({
        name: 'IDX_DEVICE_STATUS',
        columnNames: ['status'],
      }),
    );

    console.log('✅ Tabla devices creada exitosamente');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.dropIndex('devices', 'IDX_DEVICE_IMEI');
    await queryRunner.dropIndex('devices', 'IDX_DEVICE_OWNER');
    await queryRunner.dropIndex('devices', 'IDX_DEVICE_INSTALLER');
    await queryRunner.dropIndex('devices', 'IDX_DEVICE_STATUS');

    // Eliminar tabla
    await queryRunner.dropTable('devices');

    // Eliminar enums
    await queryRunner.query('DROP TYPE IF EXISTS "device_status_enum"');
    await queryRunner.query('DROP TYPE IF EXISTS "device_type_enum"');

    console.log('✅ Tabla devices eliminada');
  }
}
