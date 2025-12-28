const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:OHfDLpsKpmSyQwETExutAVrrSsBVoWYr@centerbeam.proxy.rlwy.net:45959/railway';

async function runMigration() {
  const client = new Client({ connectionString });

  try {
    console.log('🔌 Conectando a Railway PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado exitosamente!\n');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'backend', 'migrations', '001-add-subscriptions.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Ejecutando migración SQL...');
    await client.query(sql);
    console.log('✅ Migración completada exitosamente!\n');

    // Verificar tablas creadas
    console.log('🔍 Verificando tablas creadas...');
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('subscriptions', 'payment_history', 'referrals', 'commission_payouts')
      ORDER BY table_name
    `);

    console.log('\n📊 Tablas creadas:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    console.log('\n🎉 ¡Todo listo! La base de datos está configurada.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
