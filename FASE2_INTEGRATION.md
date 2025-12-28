# FASE 2 - INTEGRACIÓN REAL CON GPS-TRACE

**Estado**: Backend completado ✅
**Fecha**: 27 de Diciembre, 2025

## Objetivos de Fase 2

- ✅ Backend configurado para datos reales de GPS-Trace
- ✅ Sistema de autenticación robusto con refresh token
- ✅ Endpoints ajustados para usar usuario autenticado
- ✅ Validación de planes de suscripción
- ✅ Endpoint `/me` para perfil completo del usuario
- ⏳ Frontend conectado (pendiente - Gemini)

## Cambios Implementados (Backend)

### 1. Endpoint GET /auth/me

Nuevo endpoint para obtener el perfil completo del usuario autenticado.

**Request:**
```bash
GET /auth/me
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Usuario",
  "role": "USER",
  "subscriptionPlan": "BASIC",
  "gpsTraceUserId": "gps_trace_user_id",
  "isActive": true,
  "createdAt": "2025-12-27T00:00:00.000Z"
}
```

### 2. Endpoint POST /auth/refresh

Nuevo endpoint para refrescar el JWT cuando esté próximo a expirar.

**Request:**
```bash
POST /auth/refresh
Authorization: Bearer {old_token}
```

**Response:**
```json
{
  "accessToken": "new_jwt_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Usuario",
    "role": "USER",
    "subscriptionPlan": "BASIC"
  }
}
```

### 3. Mejoras en DevicesService

Ahora todos los métodos:
- ✅ Validan que el usuario tenga `gpsTraceUserId` configurado
- ✅ Usan el usuario autenticado automáticamente
- ✅ Devuelven error 404 si GPS-Trace user no está configurado

**Antes:**
```typescript
async getDevices(userId: string)
```

**Ahora:**
```typescript
async getDevices(prologixUserId: string) {
  const user = await this.usersService.findById(prologixUserId);

  if (!user.gpsTraceUserId) {
    throw new NotFoundException('GPS-Trace user not configured');
  }

  return this.gpsTraceService.getDevices(user.gpsTraceUserId);
}
```

### 4. Mejoras en GPS-Trace Service

- ✅ Timeout aumentado a 15 segundos
- ✅ Mejores mensajes de error con contexto
- ✅ Manejo específico de errores de conexión y autenticación
- ✅ Logs informativos al iniciar el servicio

**Mensajes de error mejorados:**

```typescript
// Error de conexión
{
  "message": "Cannot connect to GPS-Trace API",
  "error": "Connection refused. Please check GPS-Trace API configuration."
}

// Error de autenticación
{
  "message": "GPS-Trace authentication failed",
  "error": "Invalid Partner Token. Please check GPS_TRACE_PARTNER_TOKEN configuration."
}
```

## Configuración GPS-Trace

### Variables de Entorno

Actualiza tu archivo `.env`:

```env
# GPS-Trace Partner API
GPS_TRACE_API_URL=https://api.gps-trace.com/v1
GPS_TRACE_PARTNER_TOKEN=tu_token_partner_aqui
```

### Cómo obtener el Token Partner

1. Contacta con GPS-Trace: https://gps-trace.com
2. Solicita acceso a Partner API
3. Documenta los pasos que te proporcionan
4. Actualiza el `.env` con tu token

### Configurar gpsTraceUserId por usuario

Cada usuario en Prologix debe tener su `gpsTraceUserId` configurado. Esto se puede hacer:

**Opción 1: Manualmente en la base de datos**
```sql
UPDATE users
SET "gpsTraceUserId" = 'user_id_from_gps_trace'
WHERE email = 'usuario@example.com';
```

**Opción 2: Automáticamente durante el registro** (futuro)
- Cuando un usuario se registra, crear automáticamente un usuario en GPS-Trace
- Guardar el ID retornado en `gpsTraceUserId`

## Testing de Integración Real

### 1. Verificar configuración

```bash
cd backend
npm run start:dev
```

Deberías ver:
```
📡 GPS-Trace Service initialized with API: https://api.gps-trace.com/v1
🚀 Prologix Tracking GPS Backend running on port 3000
```

### 2. Registrar usuario

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@prologix.com",
    "password": "password123",
    "name": "Test User"
  }'
```

Guarda el `accessToken`.

### 3. Obtener perfil

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer {token}"
```

### 4. Configurar GPS-Trace User ID

```sql
-- Conectar a PostgreSQL
psql -U postgres -d prologix_gps

-- Actualizar usuario con GPS-Trace ID
UPDATE users
SET "gpsTraceUserId" = 'TU_GPS_TRACE_USER_ID'
WHERE email = 'test@prologix.com';
```

### 5. Probar dispositivos

```bash
# Listar dispositivos
curl -X GET http://localhost:3000/devices \
  -H "Authorization: Bearer {token}"

# Ubicación en tiempo real
curl -X GET http://localhost:3000/devices/{device_id}/live \
  -H "Authorization: Bearer {token}"
```

### 6. Probar refresh token

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Authorization: Bearer {token}"
```

## API Endpoints Actualizados

### Autenticación

| Método | Endpoint | Autenticación | Descripción |
|--------|----------|---------------|-------------|
| POST | `/auth/register` | No | Registro de usuario |
| POST | `/auth/login` | No | Inicio de sesión |
| GET | `/auth/me` | ✅ JWT | Obtener perfil completo |
| POST | `/auth/refresh` | ✅ JWT | Refrescar token |

### Dispositivos GPS

| Método | Endpoint | Plan Requerido | Descripción |
|--------|----------|----------------|-------------|
| GET | `/devices` | BASIC+ | Lista de dispositivos del usuario |
| GET | `/devices/:id` | BASIC+ | Dispositivo específico |
| GET | `/devices/:id/live` | BASIC+ | Ubicación en tiempo real |
| GET | `/devices/:id/history` | PLUS+ | Historial de rutas |

## Validación de Planes

El sistema valida automáticamente el plan del usuario:

```typescript
// Plan BASIC
✅ Ubicación actual (/devices/:id/live)
❌ Historial (/devices/:id/history) → 403 Forbidden

// Plan PLUS
✅ Ubicación actual
✅ Historial

// Plan PRO
✅ Ubicación actual
✅ Historial
✅ Estadísticas (futuro)
```

## Manejo de Errores

### Token Expirado (401)
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Solución Frontend**: Llamar a `POST /auth/refresh`

### Plan Insuficiente (403)
```json
{
  "statusCode": 403,
  "message": "This feature requires PLUS plan or higher"
}
```

**Solución Frontend**: Mostrar paywall o mensaje de upgrade

### GPS-Trace User No Configurado (404)
```json
{
  "statusCode": 404,
  "message": "GPS-Trace user not configured. Please contact support."
}
```

**Solución Frontend**: Mostrar mensaje al usuario para contactar soporte

### GPS-Trace API Error (500/503)
```json
{
  "statusCode": 503,
  "message": "Cannot connect to GPS-Trace API",
  "error": "Connection refused. Please check GPS-Trace API configuration."
}
```

**Solución Frontend**: Mostrar mensaje de error temporal

## Checklist para Frontend (Gemini)

### Autenticación
- [ ] Implementar login real con POST `/auth/login`
- [ ] Guardar JWT en SecureStore/AsyncStorage
- [ ] Implementar auto-refresh del token
- [ ] Manejar token expirado (401)
- [ ] Implementar logout

### Perfil de Usuario
- [ ] Obtener perfil con GET `/auth/me`
- [ ] Mostrar plan actual del usuario
- [ ] Mostrar información de cuenta

### Dispositivos
- [ ] Listar dispositivos con GET `/devices`
- [ ] Mostrar lista en UI
- [ ] Implementar pull-to-refresh

### Mapa en Tiempo Real
- [ ] Obtener ubicación con GET `/devices/:id/live`
- [ ] Actualizar marker cada 10-15 segundos
- [ ] Mostrar velocidad, curso, altitud
- [ ] Centrar mapa en ubicación

### Historial (Plan PLUS)
- [ ] Validar plan antes de mostrar
- [ ] Obtener historial con GET `/devices/:id/history`
- [ ] Dibujar polyline en mapa
- [ ] Mostrar paywall si plan es BASIC

### Manejo de Errores
- [ ] Interceptor de HTTP para errores
- [ ] Refresh automático de token
- [ ] Mostrar mensajes de error user-friendly
- [ ] Validación de plan en UI

## Siguiente Fase: Monetización

Una vez que el frontend esté conectado y funcionando:

### FASE 3 - Implementar Pagos
- [ ] Integración con Stripe
- [ ] Planes en RD$ (Pesos Dominicanos)
- [ ] Paywall UI
- [ ] Sistema de suscripciones
- [ ] In-App Purchase (iOS/Android)

### Pricing Propuesto (RD$)

| Plan | Precio Mensual | Características |
|------|----------------|-----------------|
| Básico | RD$ 299 | Ubicación actual |
| Plus | RD$ 599 | Ubicación + Historial |
| Pro | RD$ 999 | Todo + Estadísticas |

## Recursos

- [GPS-Trace API Docs](https://gps-trace.com)
- [NestJS Docs](https://docs.nestjs.com)
- [JWT Best Practices](https://jwt.io)

## Contacto

**Owner**: Franlys González Tejeda
**Proyecto**: Prologix Tracking GPS
**Fase Actual**: 2 - Integración Real
**Estado Backend**: ✅ Completo
**Estado Frontend**: ⏳ Pendiente (Gemini)
