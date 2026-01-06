const { Client } = require('pg');

// URL de conexión a Railway (obtenla de las variables de entorno de Railway)
// Formato: postgresql://user:password@host:port/database
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/prologix_gps';

async function cleanupDevices() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('railway.app') ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // 1. Ver dispositivos actuales
    console.log('📋 Dispositivos actuales:');
    const devicesResult = await client.query(`
      SELECT id, name, imei, "userId", "createdAt"
      FROM devices
      ORDER BY "createdAt" DESC
    `);

    console.table(devicesResult.rows);
    console.log(`Total: ${devicesResult.rows.length} dispositivos\n`);

    // 2. Contar posiciones antes de eliminar
    const positionsBeforeResult = await client.query('SELECT COUNT(*) as count FROM gps_positions');
    console.log(`📍 Posiciones GPS antes: ${positionsBeforeResult.rows[0].count}\n`);

    // 3. Eliminar datos de dispositivos de prueba
    console.log('🗑️  Eliminando datos de dispositivos de prueba...\n');

    // Eliminar posiciones GPS
    const deletePositionsResult = await client.query(`
      DELETE FROM gps_positions
      WHERE "deviceId" IN (
        SELECT id FROM devices
        WHERE name LIKE '%Test%'
           OR name LIKE '%Prueba%'
           OR name LIKE '%Demo%'
           OR name LIKE '%test%'
           OR name LIKE '%prueba%'
      )
    `);
    console.log(`✅ Eliminadas ${deletePositionsResult.rowCount} posiciones GPS`);

    // Eliminar notificaciones
    const deleteNotificationsResult = await client.query(`
      DELETE FROM notifications
      WHERE "deviceId" IN (
        SELECT id FROM devices
        WHERE name LIKE '%Test%'
           OR name LIKE '%Prueba%'
           OR name LIKE '%Demo%'
           OR name LIKE '%test%'
           OR name LIKE '%prueba%'
      )
    `);
    console.log(`✅ Eliminadas ${deleteNotificationsResult.rowCount} notificaciones`);

    // Eliminar dispositivos
    const deleteDevicesResult = await client.query(`
      DELETE FROM devices
      WHERE name LIKE '%Test%'
         OR name LIKE '%Prueba%'
         OR name LIKE '%Demo%'
         OR name LIKE '%test%'
         OR name LIKE '%prueba%'
    `);
    console.log(`✅ Eliminados ${deleteDevicesResult.rowCount} dispositivos\n`);

    // 4. Ver estado final
    const devicesAfterResult = await client.query('SELECT COUNT(*) as count FROM devices');
    const positionsAfterResult = await client.query('SELECT COUNT(*) as count FROM gps_positions');

    console.log('📊 Resumen:');
    console.log(`  Dispositivos restantes: ${devicesAfterResult.rows[0].count}`);
    console.log(`  Posiciones restantes: ${positionsAfterResult.rows[0].count}`);

    // 5. Mostrar dispositivos restantes (si hay)
    if (parseInt(devicesAfterResult.rows[0].count) > 0) {
      console.log('\n📋 Dispositivos que quedaron:');
      const remainingDevices = await client.query(`
        SELECT id, name, imei, "userId", "createdAt"
        FROM devices
        ORDER BY "createdAt" DESC
      `);
      console.table(remainingDevices.rows);
    }

    console.log('\n✅ Limpieza completada exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

// Ejecutar
if (require.main === module) {
  console.log('🚀 Iniciando limpieza de dispositivos de prueba...\n');

  cleanupDevices()
    .then(() => {
      console.log('\n✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { cleanupDevices };
