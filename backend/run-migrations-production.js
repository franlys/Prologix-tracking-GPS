#!/usr/bin/env node

/**
 * Script para ejecutar migraciones TypeORM en Railway
 *
 * Uso:
 *   node run-migrations-production.js
 *
 * Requiere:
 *   - DATABASE_URL configurado en Railway
 *   - Build completado (dist/ folder)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════');
console.log('   🚀 TypeORM Migration Runner - Production');
console.log('═══════════════════════════════════════════════════════\n');

// Verificar que estamos en producción o que DATABASE_URL está definido
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL no está configurado');
  console.error('\n💡 Este script debe ejecutarse en Railway o con DATABASE_URL definido\n');
  process.exit(1);
}

// Verificar que exista la carpeta dist (build compilado)
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.log('📦 Build no encontrado. Compilando TypeScript...\n');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('\n✅ Build completado\n');
  } catch (error) {
    console.error('\n❌ Error en build:', error.message);
    process.exit(1);
  }
}

// Ejecutar migraciones
try {
  console.log('🔄 Ejecutando migraciones de TypeORM...\n');
  console.log('📊 Database:', process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'Railway PostgreSQL');
  console.log('📁 Migrations folder: src/migrations/\n');

  execSync('npm run migration:run', {
    stdio: 'inherit',
    env: process.env
  });

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('   ✅ Migraciones completadas exitosamente');
  console.log('═══════════════════════════════════════════════════════');
  console.log('\n🎉 Nuevas funcionalidades activadas:');
  console.log('   ✓ Soporte para Traccar (campos gpsProvider, traccarUserId)');
  console.log('   ✓ Tabla gps_positions (persistencia propia)');
  console.log('   ✓ Sistema de sincronización automática');
  console.log('   ✓ WebSocket real-time updates');
  console.log('   ✓ Redis caching layer');
  console.log('\n📝 Logs de verificación:');

  // Mostrar tablas creadas
  console.log('   Ejecuta: SELECT tablename FROM pg_tables WHERE schemaname = \'public\';');
  console.log('   Para verificar que gps_positions existe\n');

  process.exit(0);

} catch (error) {
  console.error('\n');
  console.error('═══════════════════════════════════════════════════════');
  console.error('   ❌ Error al ejecutar migraciones');
  console.error('═══════════════════════════════════════════════════════');
  console.error('\nDetalles:', error.message);

  console.error('\n💡 Troubleshooting:');
  console.error('   1. Verifica que DATABASE_URL esté configurado en Railway');
  console.error('   2. Asegúrate de que las migraciones existan en src/migrations/');
  console.error('   3. Revisa los logs de Railway para más detalles');
  console.error('   4. Intenta: railway run npm run migration:run\n');

  process.exit(1);
}
