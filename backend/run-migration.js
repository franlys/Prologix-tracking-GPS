const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const client = new Client({
    host: 'localhost',
    port: 5434,
    user: 'postgres',
    password: 'Progreso070901',
    database: 'prologix_gps',
  });

  try {
    console.log('🔌 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conexión exitosa\n');

    const migrationPath = path.join(__dirname, 'migrations', '001-add-subscriptions.sql');
    console.log('📄 Leyendo archivo de migración...');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('✅ Archivo leído\n');

    console.log('🚀 Ejecutando migración...');
    await client.query(migrationSQL);
    console.log('✅ Migración ejecutada exitosamente\n');

    console.log('🔍 Verificando tablas creadas...');
    const result = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename IN ('subscriptions', 'payment_history', 'referrals', 'commission_payouts')
      ORDER BY tablename;
    `);

    console.log('\n📊 Tablas creadas:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.tablename}`);
    });

    if (result.rows.length === 4) {
      console.log('\n🎉 ¡Migración completada exitosamente!');
      console.log('✅ Todas las tablas fueron creadas correctamente\n');
    } else {
      console.log('\n⚠️  Advertencia: Se esperaban 4 tablas pero se encontraron', result.rows.length);
    }

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
    if (error.code) {
      console.error('Código de error:', error.code);
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Conexión cerrada');
  }
}

runMigration();
