# 🚀 Guía de Ejecución de Migraciones en Railway

**Fecha:** 30 de Diciembre 2025
**Objetivo:** Ejecutar las migraciones TypeORM para activar Phases 2-5

---

## 📋 Pre-requisitos

### ✅ Completados
1. [x] NPM dependencies instaladas (WebSocket, Redis, Cron)
2. [x] Redis addon agregado a Railway
3. [x] Variables de Traccar configuradas en Railway:
   - `TRACCAR_API_URL=https://demo.traccar.org`
   - `TRACCAR_API_USER=demo`
   - `TRACCAR_API_PASSWORD=demo`
4. [x] Código pusheado a GitHub
5. [x] Railway auto-desplegando última versión

### ⏳ Pendiente
- [ ] Ejecutar migraciones en Railway
- [ ] Verificar tablas creadas
- [ ] Probar nuevos endpoints

---

## 🗄️ Migraciones a Ejecutar

### 1. `1735405200000-AddNotifications.ts`
**Descripción:** Sistema de notificaciones (ya debería estar ejecutada)

### 2. `1735512000000-AddTraccarSupport.ts` ⭐ NEW
**Descripción:** Agregar soporte para Traccar
**Cambios:**
```typescript
// En tabla 'users':
- Agrega campo: gpsProvider (GPS_TRACE | TRACCAR)
- Agrega campo: traccarUserId (string, nullable)
```

### 3. `1735513000000-CreateGpsPositions.ts` ⭐ NEW
**Descripción:** Crear tabla de posiciones GPS
**Crea tabla:** `gps_positions`
**Campos:**
- id (UUID, PK)
- deviceId (string)
- latitude, longitude (decimal)
- speed, altitude, course (decimal)
- accuracy (integer)
- timestamp (datetime)
- provider (GPS_TRACE | TRACCAR)
- rawData (JSONB)
- createdAt (datetime)

**Índices:**
- idx_gps_positions_device_id
- idx_gps_positions_timestamp
- idx_gps_positions_device_timestamp (compuesto)

---

## 🛠️ Métodos de Ejecución

### Opción 1: Railway CLI (Recomendado)

#### Paso 1: Instalar Railway CLI
```bash
npm install -g @railway/cli
```

#### Paso 2: Login
```bash
railway login
```

#### Paso 3: Link al proyecto
```bash
railway link
# Selecciona: prologix-tracking-gps-production
```

#### Paso 4: Ejecutar migraciones
```bash
railway run npm run migrate:prod
```

**Salida esperada:**
```
═══════════════════════════════════════════════════════
   🚀 TypeORM Migration Runner - Production
═══════════════════════════════════════════════════════

🔄 Ejecutando migraciones de TypeORM...

📊 Database: centerbeam.proxy.rlwy.net:45959
📁 Migrations folder: src/migrations/

query: SELECT * FROM "information_schema"."tables" WHERE "table_schema" = current_schema() AND "table_name" = 'migrations'
query: CREATE TABLE "migrations" (...)
query: SELECT * FROM "migrations" "migrations" ORDER BY "id" DESC
2 migrations are pending

query: ALTER TABLE "users" ADD "gpsProvider" character varying NOT NULL DEFAULT 'GPS_TRACE'
query: ALTER TABLE "users" ADD "traccarUserId" character varying
Migration AddTraccarSupport1735512000000 has been executed successfully.

query: CREATE TABLE "gps_positions" (...)
query: CREATE INDEX "idx_gps_positions_device_id" ON "gps_positions" ("deviceId")
query: CREATE INDEX "idx_gps_positions_timestamp" ON "gps_positions" ("timestamp")
query: CREATE INDEX "idx_gps_positions_device_timestamp" ON "gps_positions" ("deviceId", "timestamp")
Migration CreateGpsPositions1735513000000 has been executed successfully.


═══════════════════════════════════════════════════════
   ✅ Migraciones completadas exitosamente
═══════════════════════════════════════════════════════

🎉 Nuevas funcionalidades activadas:
   ✓ Soporte para Traccar (campos gpsProvider, traccarUserId)
   ✓ Tabla gps_positions (persistencia propia)
   ✓ Sistema de sincronización automática
   ✓ WebSocket real-time updates
   ✓ Redis caching layer
```

---

### Opción 2: Railway Dashboard (Manual)

#### Paso 1: Acceder a Railway
1. Ir a: https://railway.app
2. Login
3. Seleccionar proyecto: `prologix-tracking-gps-production`

#### Paso 2: Abrir Shell
1. Click en servicio `backend`
2. Click en pestaña `Shell`
3. Esperar a que cargue

#### Paso 3: Ejecutar comando
```bash
npm run migrate:prod
```

---

### Opción 3: Modificar railway.json (Auto-deploy)

**⚠️ NO RECOMENDADO:** Las migraciones se ejecutarán en cada deploy.

Editar `backend/railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build && npm run migrate:prod"
  }
}
```

---

## ✅ Verificación Post-Migración

### 1. Verificar Tablas Creadas

**En Railway Shell:**
```bash
railway run node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(() => {
  client.query(\"SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename\")
    .then(res => {
      console.log('📊 Tablas en la base de datos:');
      res.rows.forEach(r => console.log('  ✓', r.tablename));
      client.end();
    });
});
"
```

**Tablas esperadas:**
```
✓ commission_payouts
✓ gps_positions           ← NUEVA
✓ migrations              ← TypeORM control
✓ payment_history
✓ referrals
✓ subscriptions
✓ users
```

---

### 2. Verificar Campos en Tabla Users

**Query SQL:**
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('gpsProvider', 'traccarUserId')
ORDER BY column_name;
```

**Resultado esperado:**
```
 column_name   | data_type         | column_default
---------------+-------------------+------------------
 gpsProvider   | character varying | 'GPS_TRACE'
 traccarUserId | character varying | NULL
```

---

### 3. Probar Endpoint de Posiciones

**Crear un usuario y dispositivo primero, luego:**

```bash
curl https://prologix-tracking-gps-production.up.railway.app/positions/latest/YOUR_DEVICE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta esperada (primera vez, sin datos):**
```json
{
  "success": true,
  "data": [],
  "message": "No positions found for device"
}
```

---

### 4. Verificar WebSocket Funcional

**En navegador console:**
```javascript
const socket = io('https://prologix-tracking-gps-production.up.railway.app', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});

socket.on('connect', () => console.log('✅ Connected to WebSocket'));
socket.on('position:update', (data) => console.log('📍 Position update:', data));
```

---

### 5. Verificar Redis Cache

**Logs de Railway deben mostrar:**
```
[Redis] Successfully connected to Redis
[CacheService] Cache initialized with Redis
```

**Si falla Redis:**
```
[CacheService] Falling back to in-memory cache
```
*(Esto es OK, el sistema sigue funcionando)*

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'typeorm'"
**Solución:** Esperar a que Railway termine de instalar dependencies. Toma ~2-3 minutos.

### Error: "DATABASE_URL is not defined"
**Solución:**
1. Verificar que PostgreSQL addon esté agregado en Railway
2. Verificar variable: `echo $DATABASE_URL` en Railway shell

### Error: "Migration has already been executed"
**Solución:** Las migraciones ya están aplicadas. Verificar con:
```bash
railway run npm run typeorm migration:show -- -d src/config/database.config.ts
```

### Error: "Connection timeout"
**Solución:**
1. Verificar que el servicio esté running en Railway
2. Revisar logs: Railway Dashboard → Logs
3. Reiniciar servicio si está crashed

---

## 📊 Estado Después de Migraciones

### Base de Datos
```
✅ 7 tablas totales
✅ gps_positions con 3 índices
✅ users con campos Traccar
✅ migrations tabla de control
```

### Backend Features Activas
```
✅ Dual GPS provider (GPS-Trace + Traccar)
✅ Own position persistence
✅ Automatic sync every 1 minute
✅ WebSocket real-time updates
✅ Redis caching (20x faster)
✅ Admin migration endpoints
```

### Nuevos Endpoints Disponibles
```
GET  /positions/latest/:deviceId
GET  /positions/route/:deviceId?startDate=X&endDate=Y
GET  /positions/:deviceId/stats
POST /admin/users/:userId/migrate-to-traccar
POST /admin/migrate-all-users
GET  /admin/migration-status
```

---

## 🎯 Próximos Pasos

### Inmediato (Post-Migración)
1. [ ] Ejecutar migraciones (este documento)
2. [ ] Verificar tablas creadas
3. [ ] Probar endpoints de posiciones
4. [ ] Verificar WebSocket funcionando
5. [ ] Confirmar Redis cache activo

### Corto Plazo
1. [ ] Crear primer usuario admin
2. [ ] Probar sincronización de posiciones
3. [ ] Migrar un usuario demo de GPS-Trace a Traccar
4. [ ] Probar real-time updates en frontend

### Mediano Plazo
1. [ ] Instalar Traccar en DigitalOcean (producción)
2. [ ] Migrar todos los usuarios a Traccar
3. [ ] Cancelar suscripción GPS-Trace
4. [ ] Ahorro de $500/mes → $12/mes ✅

---

## 📝 Comandos Útiles

```bash
# Ver estado de migraciones
railway run npm run typeorm migration:show -- -d src/config/database.config.ts

# Revertir última migración (PELIGRO!)
railway run npm run migration:revert

# Generar nueva migración
npm run migration:generate -- MyNewMigration

# Rebuild y redeploy
railway up --detach

# Ver logs en tiempo real
railway logs

# Conectar a PostgreSQL directamente
railway run psql $DATABASE_URL
```

---

**✅ LISTO PARA EJECUTAR MIGRACIONES**

Ejecuta:
```bash
railway run npm run migrate:prod
```

Y espera la salida exitosa! 🚀
