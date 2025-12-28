# 📧 Guía de Uso del Sistema de Notificaciones

## 📋 Descripción General

El sistema de notificaciones permite enviar alertas automáticas por **Email** (SendGrid) y **WhatsApp** (Baileys) cuando ocurren eventos importantes con los dispositivos GPS.

---

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```bash
# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@prologix.com
SENDGRID_FROM_NAME=Prologix GPS Tracking

# WhatsApp (Baileys)
WHATSAPP_SESSION_DIR=./whatsapp-session

# Activar notificaciones
NOTIFICATIONS_ENABLED=true
```

### 2. Ejecutar Migración de Base de Datos

```bash
cd backend

# Opción 1: Conectarse a PostgreSQL directamente
psql -U postgres -d prologix_gps -f src/migrations/1735405200000-AddNotifications.ts

# Opción 2: Usar TypeORM CLI (si está configurado)
npm run typeorm migration:run

# Opción 3: Ejecutar el SQL manualmente
# El archivo de migración contiene las queries necesarias
```

### 3. Iniciar el Backend

```bash
npm run start:dev
```

Al iniciar, deberías ver en la consola:

```
📧 SendGrid Email Service initialized
📱 Initializing WhatsApp service...
   Scan this QR code with WhatsApp:
   [QR CODE APARECERÁ AQUÍ]
```

### 4. Autenticar WhatsApp

1. Abre WhatsApp en tu teléfono
2. Ve a **Configuración → Dispositivos vinculados**
3. Escanea el QR que aparece en la consola del backend
4. Verás: `✅ WhatsApp connected successfully!`

---

## 📡 API Endpoints

### Crear Regla de Notificación

```http
POST /notifications/rules
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "deviceId": "863071069503320",  // Opcional: para todos los dispositivos si se omite
  "type": "SPEED_EXCEEDED",
  "channel": "BOTH",               // EMAIL | WHATSAPP | BOTH
  "isActive": true,
  "config": {
    "speedLimit": 120              // km/h
  },
  "cooldownSeconds": 300           // 5 minutos entre notificaciones
}
```

**Tipos de notificaciones disponibles:**

- `DEVICE_OFFLINE` - Dispositivo sin conexión
- `SPEED_EXCEEDED` - Velocidad excedida
- `GEOFENCE_ENTER` - Entrada a geocerca (Fase 3)
- `GEOFENCE_EXIT` - Salida de geocerca (Fase 3)
- `LOW_BATTERY` - Batería baja

**Configuración por tipo:**

```json
// DEVICE_OFFLINE
{
  "config": {
    "offlineMinutes": 10  // Minutos sin conexión antes de alertar
  }
}

// SPEED_EXCEEDED
{
  "config": {
    "speedLimit": 120     // km/h
  }
}

// LOW_BATTERY
{
  "config": {
    "batteryPercent": 20  // Porcentaje mínimo
  }
}

// GEOFENCE (Fase 3)
{
  "config": {
    "geofence": {
      "lat": 40.7128,
      "lng": -74.0060,
      "radiusMeters": 500
    }
  }
}
```

### Listar Reglas del Usuario

```http
GET /notifications/rules
Authorization: Bearer YOUR_JWT_TOKEN
```

**Respuesta:**

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "deviceId": "863071069503320",
    "type": "SPEED_EXCEEDED",
    "channel": "BOTH",
    "isActive": true,
    "config": {
      "speedLimit": 120
    },
    "cooldownSeconds": 300,
    "createdAt": "2025-12-28T12:00:00Z",
    "updatedAt": "2025-12-28T12:00:00Z"
  }
]
```

### Actualizar Regla

```http
PATCH /notifications/rules/:ruleId
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "isActive": false,
  "config": {
    "speedLimit": 100
  }
}
```

### Eliminar Regla

```http
DELETE /notifications/rules/:ruleId
Authorization: Bearer YOUR_JWT_TOKEN
```

### Ver Historial de Notificaciones

```http
GET /notifications/logs?limit=50
Authorization: Bearer YOUR_JWT_TOKEN
```

**Respuesta:**

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "deviceId": "863071069503320",
    "deviceName": "Camión 001",
    "type": "SPEED_EXCEEDED",
    "channel": "EMAIL",
    "status": "SENT",
    "message": "El dispositivo está viajando a 135 km/h (límite: 120 km/h).",
    "recipient": "user@example.com",
    "errorMessage": null,
    "createdAt": "2025-12-28T12:30:00Z",
    "sentAt": "2025-12-28T12:30:01Z"
  }
]
```

### Probar Notificaciones

```http
POST /notifications/test
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "channel": "WHATSAPP",
  "message": "Esta es una prueba del sistema de notificaciones"
}
```

---

## 💻 Ejemplos con cURL

### Crear regla de velocidad excedida

```bash
curl -X POST http://localhost:3000/notifications/rules \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "863071069503320",
    "type": "SPEED_EXCEEDED",
    "channel": "BOTH",
    "config": {
      "speedLimit": 120
    },
    "cooldownSeconds": 300
  }'
```

### Crear regla de dispositivo offline

```bash
curl -X POST http://localhost:3000/notifications/rules \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "DEVICE_OFFLINE",
    "channel": "EMAIL",
    "config": {
      "offlineMinutes": 15
    }
  }'
```

### Listar todas las reglas

```bash
curl http://localhost:3000/notifications/rules \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Ver últimas 100 notificaciones enviadas

```bash
curl "http://localhost:3000/notifications/logs?limit=100" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔧 Agregar Número de Teléfono a Usuario

Necesitas agregar el número de teléfono del usuario para WhatsApp:

```bash
# Opción 1: Directamente en la base de datos
psql -U postgres -d prologix_gps
UPDATE users SET "phoneNumber" = '+1234567890' WHERE email = 'user@example.com';

# Opción 2: Crear endpoint en UsersController (recomendado)
PATCH /users/profile
{
  "phoneNumber": "+1234567890"
}
```

**Formato del número de teléfono:**
- Con código de país: `+52XXXXXXXXXX`
- Sin espacios ni guiones
- Ejemplo: `+525512345678`

---

## 🎯 Cómo Funciona

### 1. Creación de Reglas

El usuario crea reglas que definen:
- Qué tipo de evento monitorear
- Por qué canal enviar (Email, WhatsApp, o Ambos)
- Configuración específica (límites, umbrales)
- Cooldown para evitar spam

### 2. Monitoreo en Tiempo Real

El sistema monitorea constantemente los dispositivos y verifica:
- Si el dispositivo está offline
- Si la velocidad excede el límite
- Si la batería está baja
- Si entra/sale de geocercas (Fase 3)

### 3. Envío de Notificaciones

Cuando se detecta un evento:
1. Busca reglas activas del usuario para ese tipo de evento
2. Verifica el cooldown (no spam)
3. Envía por el canal configurado (Email, WhatsApp, o ambos)
4. Guarda un log en la base de datos

### 4. Cooldown Anti-Spam

Si una regla tiene `cooldownSeconds: 300`:
- Solo enviará 1 notificación cada 5 minutos
- Aunque el evento siga ocurriendo
- Evita saturar al usuario

---

## 📊 Ejemplo de Flujo Completo

### Escenario: Alerta de Velocidad Excedida

1. **Usuario crea regla:**
   ```json
   {
     "deviceId": "863071069503320",
     "type": "SPEED_EXCEEDED",
     "channel": "BOTH",
     "config": { "speedLimit": 100 },
     "cooldownSeconds": 600
   }
   ```

2. **Sistema monitorea dispositivo:**
   - Cada 10 segundos recibe datos del GPS
   - Detecta velocidad de 135 km/h

3. **Se dispara la alerta:**
   - ✅ Verifica que la regla está activa
   - ✅ Verifica que no se envió notificación en los últimos 10 minutos
   - 📧 Envía email a: `user@example.com`
   - 📱 Envía WhatsApp a: `+525512345678`

4. **Se guarda el log:**
   ```json
   {
     "type": "SPEED_EXCEEDED",
     "channel": "EMAIL",
     "status": "SENT",
     "message": "Velocidad excedida: 135 km/h",
     "sentAt": "2025-12-28T12:00:00Z"
   }
   ```

5. **Cooldown activo:**
   - Durante los próximos 10 minutos
   - Aunque el vehículo siga a 135 km/h
   - NO se enviarán más notificaciones

---

## 🛠️ Troubleshooting

### Email no se envía

```bash
# Verificar en logs del backend:
❌ Failed to send email to user@example.com: {error}

# Revisar:
1. SENDGRID_API_KEY es correcto
2. SENDGRID_FROM_EMAIL está verificado en SendGrid
3. NOTIFICATIONS_ENABLED=true
```

### WhatsApp no conecta

```bash
# Si no aparece QR:
1. Eliminar carpeta whatsapp-session
2. Reiniciar backend
3. Escanear nuevo QR

# Si se desconecta constantemente:
1. Verificar conexión a internet
2. No cerrar WhatsApp en el teléfono
3. Mantener backend activo
```

### Usuario no tiene phoneNumber

```bash
# Error en logs:
⚠️  User {userId} has no phone number for WhatsApp

# Solución:
UPDATE users SET "phoneNumber" = '+525512345678' WHERE id = 'user-uuid';
```

---

## 🔮 Próximas Funcionalidades (Fase 3)

- [ ] Notificaciones de geocercas (entrada/salida)
- [ ] Notificaciones push nativas (Firebase)
- [ ] Programación de reportes automáticos
- [ ] Panel de configuración en frontend
- [ ] Templates personalizables
- [ ] Grupos de notificaciones
- [ ] Escalado de alertas

---

## 📝 Notas Importantes

1. **Cooldown:** El sistema previene spam automáticamente
2. **WhatsApp Session:** Se guarda en disco, persiste entre reinicios
3. **SendGrid:** Requiere verificación del dominio remitente
4. **Límites:** SendGrid free tier: 100 emails/día
5. **Seguridad:** Tokens JWT requeridos para todas las operaciones

---

**Última actualización:** 28 de Diciembre de 2025
**Versión:** 1.0.0
