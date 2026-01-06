require('dotenv').config();
const { Client } = require('pg');

// Construir URL desde variables de entorno
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5434;
const DB_USERNAME = process.env.DB_USERNAME || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
const DB_NAME = process.env.DB_NAME || 'prologix_gps';

const connectionString = `postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

async function cleanupDevices() {
  const client = new Client({
    connectionString,
    ssl: false // Para desarrollo local
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');
    console.log(`   Host: ${DB_HOST}:${DB_PORT}`);
    console.log(`   Database: ${DB_NAME}\n`);

    // Ver dispositivos actuales
    console.log('📋 Dispositivos actuales:');
    const devicesResult = await client.query(`
      SELECT id, name, imei, "userId", "createdAt"
      FROM devices
      ORDER BY "createdAt" DESC
    `);

    if (devicesResult.rows.length === 0) {
      console.log('   No hay dispositivos en la base de datos\n');
      return;
    }

    console.table(devicesResult.rows.map(d => ({
      name: d.name,
      imei: d.imei,
      created: new Date(d.createdAt).toLocaleString()
    })));
    console.log(`   Total: ${devicesResult.rows.length} dispositivos\n`);

    // Preguntar confirmación (en producción)
    console.log('⚠️  ¿Quieres eliminar TODOS estos dispositivos? (Esta acción no se puede deshacer)');
    console.log('   Para continuar, ejecuta el script con: node cleanup-devices-simple.js --confirm\n');

    if (!process.argv.includes('--confirm')) {
      console.log('❌ Limpieza cancelada (no se proporcionó --confirm)');
      return;
    }

    console.log('🗑️  Eliminando dispositivos y datos relacionados...\n');

    // Eliminar en orden (por foreign keys)
    const deletePositions = await client.query('DELETE FROM gps_positions');
    console.log(`   ✅ Eliminadas ${deletePositions.rowCount} posiciones GPS`);

    const deleteNotifications = await client.query('DELETE FROM notifications WHERE "deviceId" IS NOT NULL');
    console.log(`   ✅ Eliminadas ${deleteNotifications.rowCount} notificaciones`);

    const deleteAlerts = await client.query('DELETE FROM alerts');
    console.log(`   ✅ Eliminadas ${deleteAlerts.rowCount} alertas`);

    const deleteDevices = await client.query('DELETE FROM devices');
    console.log(`   ✅ Eliminados ${deleteDevices.rowCount} dispositivos\n`);

    console.log('✅ Base de datos limpia y lista para dispositivos reales!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

// Ejecutar
console.log('🚀 Script de limpieza de dispositivos de prueba\n');

cleanupDevices()
  .then(() => {
    console.log('\n✅ Completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
