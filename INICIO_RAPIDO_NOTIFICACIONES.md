# 🚀 Inicio Rápido - Sistema de Notificaciones

## ✅ Completado

El sistema de notificaciones backend está **100% completo**. Ahora puedes:
- Enviar notificaciones por Email (SendGrid)
- Enviar notificaciones por WhatsApp (Baileys)
- Configurar reglas de alertas automáticas
- Ver historial de notificaciones enviadas

---

## 📦 Pasos para Activar

### 1. Ejecutar Migración de Base de Datos

Abre **pgAdmin** o tu cliente PostgreSQL favorito y ejecuta:

```sql
-- backend/src/migrations/run-migration.sql

-- Agregar phoneNumber a users
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "phoneNumber" VARCHAR;

-- Crear tablas de notificaciones
CREATE TABLE IF NOT EXISTS "notification_rules" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL,
  "deviceId" VARCHAR,
  "type" VARCHAR NOT NULL CHECK ("type" IN ('DEVICE_OFFLINE', 'SPEED_EXCEEDED', 'GEOFENCE_ENTER', 'GEOFENCE_EXIT', 'LOW_BATTERY')),
  "channel" VARCHAR NOT NULL CHECK ("channel" IN ('EMAIL', 'WHATSAPP', 'BOTH')),
  "isActive" BOOLEAN DEFAULT true,
  "config" JSONB,
  "cooldownSeconds" INTEGER DEFAULT 300,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now(),
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "notification_logs" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL,
  "deviceId" VARCHAR,
  "deviceName" VARCHAR,
  "type" VARCHAR NOT NULL CHECK ("type" IN ('DEVICE_OFFLINE', 'SPEED_EXCEEDED', 'GEOFENCE_ENTER', 'GEOFENCE_EXIT', 'LOW_BATTERY')),
  "channel" VARCHAR NOT NULL CHECK ("channel" IN ('EMAIL', 'WHATSAPP', 'BOTH')),
  "status" VARCHAR DEFAULT 'PENDING' CHECK ("status" IN ('PENDING', 'SENT', 'FAILED')),
  "message" TEXT NOT NULL,
  "recipient" VARCHAR,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP DEFAULT now(),
  "sentAt" TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Crear índices
CREATE INDEX IF NOT EXISTS "idx_notification_rules_userId" ON "notification_rules" ("userId");
CREATE INDEX IF NOT EXISTS "idx_notification_rules_deviceId" ON "notification_rules" ("deviceId");
CREATE INDEX IF NOT EXISTS "idx_notification_logs_userId" ON "notification_logs" ("userId");
CREATE INDEX IF NOT EXISTS "idx_notification_logs_createdAt" ON "notification_logs" ("createdAt");
```

### 2. Configurar Variables de Entorno

Edita `backend/.env` y agrega:

```bash
# SendGrid (Email)
SENDGRID_API_KEY=SG.tu_api_key_aqui
SENDGRID_FROM_EMAIL=noreply@prologix.com
SENDGRID_FROM_NAME=Prologix GPS Tracking

# WhatsApp (Baileys)
WHATSAPP_SESSION_DIR=./whatsapp-session

# Activar notificaciones
NOTIFICATIONS_ENABLED=true
```

**Obtener API Key de SendGrid:**
1. Crea cuenta en https://sendgrid.com/
2. Ve a Settings → API Keys
3. Crea una nueva API Key con permisos de "Mail Send"
4. Copia la key (empieza con `SG.`)

### 3. Agregar Número de Teléfono a tu Usuario

```sql
-- Reemplaza con tu email y número de teléfono (con código de país)
UPDATE users
SET "phoneNumber" = '+525512345678'
WHERE email = 'tu@email.com';
```

### 4. Iniciar el Backend

```bash
cd backend
npm run start:dev
```

Deberías ver en la consola:

```
📧 SendGrid Email Service initialized
📱 Initializing WhatsApp service...

   ████████████████████████████
   ██                        ██
   ██  [QR CODE AQUÍ]        ██
   ██                        ██
   ████████████████████████████

   Scan this QR code with WhatsApp
```

### 5. Conectar WhatsApp

1. Abre WhatsApp en tu teléfono
2. Ve a **Configuración → Dispositivos vinculados → Vincular un dispositivo**
3. Escanea el QR que aparece en la consola
4. Espera a ver: `✅ WhatsApp connected successfully!`

---

## 🧪 Probar el Sistema

### Opción 1: Endpoint de Prueba

```bash
# Obtén tu JWT token primero (login)
TOKEN="tu_jwt_token_aqui"

# Prueba WhatsApp
curl -X POST http://localhost:3000/notifications/test \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "WHATSAPP",
    "message": "¡Prueba exitosa del sistema de notificaciones!"
  }'

# Prueba Email
curl -X POST http://localhost:3000/notifications/test \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "EMAIL",
    "message": "¡Prueba exitosa del sistema de notificaciones!"
  }'

# Prueba Ambos
curl -X POST http://localhost:3000/notifications/test \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "BOTH",
    "message": "¡Prueba exitosa del sistema de notificaciones!"
  }'
```

### Opción 2: Crear Regla de Alerta

```bash
# Crear regla de velocidad excedida
curl -X POST http://localhost:3000/notifications/rules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "863071069503320",
    "type": "SPEED_EXCEEDED",
    "channel": "WHATSAPP",
    "config": {
      "speedLimit": 100
    },
    "cooldownSeconds": 300
  }'

# Ver tus reglas
curl http://localhost:3000/notifications/rules \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📱 Tipos de Notificaciones Disponibles

### 1. Dispositivo Offline
```json
{
  "type": "DEVICE_OFFLINE",
  "channel": "EMAIL",
  "config": {
    "offlineMinutes": 15
  }
}
```
**Alerta cuando:** El dispositivo lleva más de 15 minutos sin conexión

### 2. Velocidad Excedida
```json
{
  "type": "SPEED_EXCEEDED",
  "channel": "WHATSAPP",
  "config": {
    "speedLimit": 120
  }
}
```
**Alerta cuando:** El vehículo supera los 120 km/h

### 3. Batería Baja
```json
{
  "type": "LOW_BATTERY",
  "channel": "BOTH",
  "config": {
    "batteryPercent": 20
  }
}
```
**Alerta cuando:** La batería del dispositivo cae por debajo del 20%

### 4. Geocercas (Fase 3 - Próximamente)
```json
{
  "type": "GEOFENCE_EXIT",
  "channel": "BOTH",
  "config": {
    "geofence": {
      "lat": 40.7128,
      "lng": -74.0060,
      "radiusMeters": 500
    }
  }
}
```
**Alerta cuando:** El vehículo sale de la zona delimitada

---

## 📊 Ver Historial de Notificaciones

```bash
# Últimas 50 notificaciones
curl http://localhost:3000/notifications/logs \
  -H "Authorization: Bearer $TOKEN"

# Últimas 100 notificaciones
curl "http://localhost:3000/notifications/logs?limit=100" \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "type": "SPEED_EXCEEDED",
    "channel": "WHATSAPP",
    "status": "SENT",
    "message": "El dispositivo está viajando a 135 km/h (límite: 100 km/h).",
    "recipient": "+525512345678",
    "deviceName": "Camión 001",
    "createdAt": "2025-12-28T12:00:00Z",
    "sentAt": "2025-12-28T12:00:01Z"
  }
]
```

---

## 🎯 Ejemplos de Uso Real

### Configurar Alertas para una Flota

```bash
# 1. Alerta de velocidad para todos los dispositivos
curl -X POST http://localhost:3000/notifications/rules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "SPEED_EXCEEDED",
    "channel": "WHATSAPP",
    "config": { "speedLimit": 110 },
    "cooldownSeconds": 600
  }'

# 2. Alerta de dispositivo offline para un vehículo específico
curl -X POST http://localhost:3000/notifications/rules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "863071069503320",
    "type": "DEVICE_OFFLINE",
    "channel": "EMAIL",
    "config": { "offlineMinutes": 30 },
    "cooldownSeconds": 1800
  }'

# 3. Alerta de batería baja por ambos canales
curl -X POST http://localhost:3000/notifications/rules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "LOW_BATTERY",
    "channel": "BOTH",
    "config": { "batteryPercent": 15 },
    "cooldownSeconds": 3600
  }'
```

### Desactivar/Activar Reglas

```bash
# Desactivar regla (sin eliminarla)
curl -X PATCH http://localhost:3000/notifications/rules/{rule_id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "isActive": false }'

# Reactivar regla
curl -X PATCH http://localhost:3000/notifications/rules/{rule_id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "isActive": true }'

# Cambiar límite de velocidad
curl -X PATCH http://localhost:3000/notifications/rules/{rule_id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "config": { "speedLimit": 90 } }'
```

---

## 🔧 Troubleshooting

### WhatsApp se desconecta

**Síntomas:** Backend muestra `❌ WhatsApp disconnected`

**Solución:**
```bash
# 1. Detener backend (Ctrl+C)
# 2. Eliminar sesión guardada
rm -rf backend/whatsapp-session
# 3. Reiniciar backend
npm run start:dev
# 4. Escanear nuevo QR
```

### Email no se envía

**Verificar logs del backend:**
```
❌ Failed to send email to user@example.com: [error message]
```

**Causas comunes:**
1. API Key inválida → Verificar en SendGrid dashboard
2. Email remitente no verificado → Verificar dominio en SendGrid
3. `NOTIFICATIONS_ENABLED=false` → Cambiar a `true`

### Usuario no tiene phoneNumber

**Error:**
```
⚠️  User {userId} has no phone number for WhatsApp
```

**Solución:**
```sql
UPDATE users
SET "phoneNumber" = '+525512345678'
WHERE email = 'user@example.com';
```

---

## 📚 Documentación Completa

- **Instalación:** [docs/INSTALL_NOTIFICACIONES.md](docs/INSTALL_NOTIFICACIONES.md)
- **Guía de Uso:** [docs/USAR_NOTIFICACIONES.md](docs/USAR_NOTIFICACIONES.md)
- **Resumen Fase 2:** [docs/RESUMEN_FASE2_NOTIFICACIONES.md](docs/RESUMEN_FASE2_NOTIFICACIONES.md)
- **Roadmap Completo:** [ROADMAP_COMPLETO.md](ROADMAP_COMPLETO.md)

---

## ✅ Checklist de Activación

- [ ] Ejecutar migración SQL en PostgreSQL
- [ ] Configurar variables de entorno (.env)
- [ ] Obtener API Key de SendGrid
- [ ] Agregar phoneNumber a tu usuario
- [ ] Iniciar backend (`npm run start:dev`)
- [ ] Escanear QR de WhatsApp
- [ ] Probar endpoint `/notifications/test`
- [ ] Crear primera regla de alerta
- [ ] Verificar que lleguen las notificaciones

---

## 🎉 ¡Listo!

Una vez completados estos pasos, tu sistema de notificaciones estará **100% operativo**.

**Próxima Fase:** Frontend para configurar reglas desde la app móvil (React Native).

---

**Fecha:** 28 de Diciembre de 2025
**Versión:** 2.0.0
**Estado:** ✅ Backend Completo
