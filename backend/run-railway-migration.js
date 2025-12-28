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

    // Paso 1: Crear tabla users
    console.log('📦 Creando tabla users...');
    const usersSqlPath = path.join(__dirname, 'migrations', '000-create-users-table.sql');
    const usersSql = fs.readFileSync(usersSqlPath, 'utf8');
    await client.query(usersSql);
    console.log('✅ Tabla users creada!\n');

    // Paso 2: Crear tablas de suscripciones
    console.log('📄 Creando tablas de suscripciones...');
    const subscriptionsSqlPath = path.join(__dirname, 'migrations', '001-add-subscriptions.sql');
    const subscriptionsSql = fs.readFileSync(subscriptionsSqlPath, 'utf8');
    await client.query(subscriptionsSql);
    console.log('✅ Tablas de suscripciones creadas!\n');

    // Paso 3: Verificar todas las tablas
    console.log('🔍 Verificando tablas creadas...');
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'subscriptions', 'payment_history', 'referrals', 'commission_payouts')
      ORDER BY table_name
    `);

    console.log('\n📊 Tablas creadas:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    console.log('\n🎉 ¡Todo listo! La base de datos de Railway está completamente configurada.');
    console.log('\n📋 Siguiente paso: Verifica el deployment del backend en Railway.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.detail) console.error('Detalle:', error.detail);
    if (error.hint) console.error('Sugerencia:', error.hint);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
