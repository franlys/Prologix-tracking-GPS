# API Testing Guide - Prologix GPS

Guía rápida para probar todos los endpoints del backend.

## Configuración inicial

Asegúrate de que el servidor esté corriendo:
```bash
cd backend
npm run start:dev
```

## 1. Autenticación

### Registrar nuevo usuario

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "franlys@prologix.com",
    "password": "password123",
    "name": "Franlys González"
  }'
```

**Respuesta esperada:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-aqui",
    "email": "franlys@prologix.com",
    "name": "Franlys González",
    "role": "USER",
    "subscriptionPlan": "BASIC"
  }
}
```

### Iniciar sesión

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "franlys@prologix.com",
    "password": "password123"
  }'
```

**IMPORTANTE**: Guarda el `accessToken` para los siguientes pasos.

### Obtener perfil (NUEVO - Fase 2)

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta esperada:**
```json
{
  "id": "uuid",
  "email": "franlys@prologix.com",
  "name": "Franlys González",
  "role": "USER",
  "subscriptionPlan": "BASIC",
  "gpsTraceUserId": null,
  "isActive": true,
  "createdAt": "2025-12-27T00:00:00.000Z"
}
```

### Refrescar token (NUEVO - Fase 2)

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta esperada:**
```json
{
  "accessToken": "new_jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "franlys@prologix.com",
    "name": "Franlys González",
    "role": "USER",
    "subscriptionPlan": "BASIC"
  }
}
```

## 2. Dispositivos GPS

Reemplaza `YOUR_TOKEN` con el token que recibiste al hacer login.

### Listar todos los dispositivos

```bash
curl -X GET http://localhost:3000/devices \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Obtener dispositivo específico

```bash
curl -X GET http://localhost:3000/devices/DEVICE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Obtener ubicación en tiempo real

```bash
curl -X GET http://localhost:3000/devices/DEVICE_ID/live \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Obtener historial (requiere plan PLUS)

```bash
curl -X GET "http://localhost:3000/devices/DEVICE_ID/history?startDate=2025-12-27T00:00:00Z&endDate=2025-12-27T23:59:59Z" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Nota**: Si tienes plan BASIC, esto devolverá un error 403:
```json
{
  "statusCode": 403,
  "message": "This feature requires PLUS plan or higher"
}
```

## 3. Testing con Postman

### Importar colección

1. Crear nueva colección llamada "Prologix GPS"
2. Crear variable de entorno `baseUrl` = `http://localhost:3000`
3. Crear variable de entorno `token` = (dejar vacío por ahora)

### Request 1: Register

```
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "email": "test@prologix.com",
  "password": "password123",
  "name": "Test User"
}
```

En el script de "Tests" agregar:
```javascript
if (pm.response.code === 201) {
    pm.environment.set("token", pm.response.json().accessToken);
}
```

### Request 2: Login

```
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "test@prologix.com",
  "password": "password123"
}
```

En el script de "Tests" agregar:
```javascript
if (pm.response.code === 201) {
    pm.environment.set("token", pm.response.json().accessToken);
}
```

### Request 3: Get Devices

```
GET {{baseUrl}}/devices
Authorization: Bearer {{token}}
```

### Request 4: Get Live Position

```
GET {{baseUrl}}/devices/DEVICE_ID/live
Authorization: Bearer {{token}}
```

### Request 5: Get History

```
GET {{baseUrl}}/devices/DEVICE_ID/history?startDate=2025-12-27T00:00:00Z&endDate=2025-12-27T23:59:59Z
Authorization: Bearer {{token}}
```

## 4. Testing con VS Code REST Client

Instala la extensión "REST Client" en VS Code y crea un archivo `api.http`:

```http
### Variables
@baseUrl = http://localhost:3000
@token = your_token_here

### Register
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "email": "test@prologix.com",
  "password": "password123",
  "name": "Test User"
}

### Login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "test@prologix.com",
  "password": "password123"
}

### Get Devices
GET {{baseUrl}}/devices
Authorization: Bearer {{token}}

### Get Device by ID
GET {{baseUrl}}/devices/123
Authorization: Bearer {{token}}

### Get Live Position
GET {{baseUrl}}/devices/123/live
Authorization: Bearer {{token}}

### Get History
GET {{baseUrl}}/devices/123/history?startDate=2025-12-27T00:00:00Z&endDate=2025-12-27T23:59:59Z
Authorization: Bearer {{token}}
```

## 5. Códigos de Estado

### Exitosos
- `200 OK` - Solicitud exitosa
- `201 Created` - Recurso creado exitosamente

### Errores del Cliente
- `400 Bad Request` - Datos inválidos
- `401 Unauthorized` - No autenticado (sin token o token inválido)
- `403 Forbidden` - No autorizado (plan insuficiente)
- `404 Not Found` - Recurso no encontrado
- `409 Conflict` - Email ya existe (registro)

### Errores del Servidor
- `500 Internal Server Error` - Error del servidor
- `502 Bad Gateway` - Error de GPS-Trace API

## 6. Validaciones

### Email inválido

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "password123",
    "name": "Test"
  }'
```

**Respuesta**:
```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

### Password muy corta

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "123",
    "name": "Test"
  }'
```

**Respuesta**:
```json
{
  "statusCode": 400,
  "message": ["password must be longer than or equal to 6 characters"],
  "error": "Bad Request"
}
```

## 7. Testing de Planes

### Actualizar plan de usuario (manual en DB)

```sql
-- Conectar a la base de datos
psql -U postgres -d prologix_gps

-- Actualizar plan a PLUS
UPDATE users
SET "subscriptionPlan" = 'PLUS'
WHERE email = 'test@prologix.com';

-- Actualizar plan a PRO
UPDATE users
SET "subscriptionPlan" = 'PRO'
WHERE email = 'test@prologix.com';
```

Luego prueba nuevamente el endpoint de historial.

## 8. Troubleshooting

### Token expirado

Si obtienes:
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

Haz login nuevamente para obtener un nuevo token.

### GPS-Trace API error

Si obtienes:
```json
{
  "statusCode": 500,
  "message": "Failed to fetch devices"
}
```

Verifica que el `GPS_TRACE_PARTNER_TOKEN` esté configurado correctamente en `.env`.

## Notas importantes

1. **El token Partner de GPS-Trace**: Hasta que no tengas un token real de GPS-Trace, los endpoints de dispositivos pueden fallar. Esto es esperado.

2. **Primera vez**: Al registrar el primer usuario, se creará automáticamente la tabla en PostgreSQL gracias a TypeORM con `synchronize: true`.

3. **Seguridad**: En producción, desactiva `synchronize` y usa migraciones de TypeORM.

4. **CORS**: El backend permite todas las origins (`*`) en desarrollo. Cambia esto en producción.
