# 🔐 API de Administración - Prologix GPS Tracking

Esta documentación describe los endpoints de administración para gestionar usuarios y sus dispositivos GPS.

## 🎯 Autenticación

Todos los endpoints requieren:
1. Token JWT válido en el header `Authorization: Bearer <token>`
2. El usuario debe tener rol `ADMIN`

---

## 📋 Endpoints Disponibles

### 1. Obtener Todos los Usuarios

**Endpoint:** `GET /admin/users`

**Descripción:** Retorna la lista de todos los usuarios registrados en Prologix.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": "uuid-123",
    "email": "juan.perez@example.com",
    "name": "Juan Pérez",
    "role": "USER",
    "subscriptionPlan": "BASIC",
    "gpsTraceUserId": "gps-user-12345",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": "uuid-456",
    "email": "maria.lopez@example.com",
    "name": "María López",
    "role": "USER",
    "subscriptionPlan": "PLUS",
    "gpsTraceUserId": null,
    "isActive": true,
    "createdAt": "2024-01-16T14:20:00.000Z"
  }
]
```

**Ejemplo con cURL:**
```bash
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 2. Obtener Usuario por ID

**Endpoint:** `GET /admin/users/:userId`

**Descripción:** Retorna la información detallada de un usuario específico.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Respuesta Exitosa (200):**
```json
{
  "id": "uuid-123",
  "email": "juan.perez@example.com",
  "name": "Juan Pérez",
  "role": "USER",
  "subscriptionPlan": "BASIC",
  "gpsTraceUserId": "gps-user-12345",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-20T15:45:00.000Z"
}
```

**Ejemplo con cURL:**
```bash
curl -X GET http://localhost:3000/admin/users/uuid-123 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. Vincular Usuario con GPS-Trace

**Endpoint:** `PATCH /admin/users/:userId/gps-trace`

**Descripción:** Vincula un usuario de Prologix con su cuenta de GPS-Trace.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "gpsTraceUserId": "gps-user-12345"
}
```

**Respuesta Exitosa (200):**
```json
{
  "message": "GPS-Trace User ID updated successfully",
  "userId": "uuid-123",
  "gpsTraceUserId": "gps-user-12345"
}
```

**Ejemplo con cURL:**
```bash
curl -X PATCH http://localhost:3000/admin/users/uuid-123/gps-trace \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"gpsTraceUserId": "gps-user-12345"}'
```

**Ejemplo con JavaScript/Fetch:**
```javascript
const response = await fetch('http://localhost:3000/admin/users/uuid-123/gps-trace', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    gpsTraceUserId: 'gps-user-12345'
  })
});

const result = await response.json();
console.log(result);
```

---

### 4. Ver Dispositivos de un Usuario

**Endpoint:** `GET /admin/users/:userId/devices`

**Descripción:** Retorna todos los dispositivos GPS asignados a un usuario.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Respuesta Exitosa (200) - Usuario con dispositivos:**
```json
{
  "userId": "uuid-123",
  "gpsTraceUserId": "gps-user-12345",
  "deviceCount": 2,
  "devices": [
    {
      "id": "device-001",
      "name": "Camioneta Toyota",
      "imei": "123456789012345",
      "type": "gps",
      "status": "online",
      "lastPosition": {
        "lat": "18.4861",
        "lng": "-69.9312",
        "speed": 45,
        "timestamp": "2024-01-20T16:30:00.000Z"
      },
      "online": true
    },
    {
      "id": "device-002",
      "name": "Motocicleta Honda",
      "imei": "123456789012346",
      "type": "gps",
      "status": "offline",
      "lastPosition": {
        "lat": "18.4900",
        "lng": "-69.9400",
        "speed": 0,
        "timestamp": "2024-01-20T10:15:00.000Z"
      },
      "online": false
    }
  ]
}
```

**Respuesta Exitosa (200) - Usuario sin GPS-Trace:**
```json
{
  "userId": "uuid-456",
  "gpsTraceUserId": null,
  "devices": [],
  "message": "User does not have a GPS-Trace account linked"
}
```

**Ejemplo con cURL:**
```bash
curl -X GET http://localhost:3000/admin/users/uuid-123/devices \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## ❌ Códigos de Error

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
**Causa:** Token JWT inválido o no proporcionado.

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```
**Causa:** El usuario autenticado no tiene rol de ADMIN.

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User not found"
}
```
**Causa:** El ID de usuario no existe en la base de datos.

---

## 🔄 Flujo Completo de Trabajo

### Escenario: Nuevo Cliente con Dispositivo GPS

1. **El cliente se registra en la app Prologix**
   - Email: cliente@example.com
   - Se crea usuario con ID: `uuid-789`

2. **Admin crea cuenta en GPS-Trace**
   - Portal GPS-Trace → Add User
   - Asigna dispositivo GPS al usuario
   - GPS-Trace genera ID: `gps-user-999`

3. **Admin vincula las cuentas:**
   ```bash
   curl -X PATCH http://localhost:3000/admin/users/uuid-789/gps-trace \
     -H "Authorization: Bearer <admin_token>" \
     -H "Content-Type: application/json" \
     -d '{"gpsTraceUserId": "gps-user-999"}'
   ```

4. **Admin verifica los dispositivos:**
   ```bash
   curl -X GET http://localhost:3000/admin/users/uuid-789/devices \
     -H "Authorization: Bearer <admin_token>"
   ```

5. **El cliente ve sus dispositivos**
   - El usuario cierra sesión y vuelve a iniciar
   - Ahora puede ver su dispositivo GPS en la app

---

## 🛡️ Seguridad

### Mejores Prácticas:

1. ✅ **Nunca compartir el token de admin** con usuarios regulares
2. ✅ **Rotar tokens regularmente** (cada 24 horas recomendado)
3. ✅ **Usar HTTPS** en producción
4. ✅ **Registrar todas las acciones** de admin en logs
5. ✅ **Limitar acceso** a la API de admin solo desde IPs confiables

### Obtener Token de Admin:

```bash
# Login como admin
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@prologix.com",
    "password": "admin_password"
  }'

# Respuesta:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-admin",
    "email": "admin@prologix.com",
    "role": "ADMIN"
  }
}
```

---

## 📝 Notas Importantes

1. Los cambios en `gpsTraceUserId` **requieren que el usuario cierre sesión** y vuelva a iniciar para que se reflejen.

2. Si un usuario tiene `gpsTraceUserId = null`, **no verá dispositivos** en la app.

3. Los dispositivos se obtienen **en tiempo real** desde GPS-Trace, no se almacenan en Prologix.

4. La API de GPS-Trace tiene límites de rate (consultar documentación GPS-Trace).

5. Para entorno de desarrollo, los usuarios sin `gpsTraceUserId` ven **dispositivos de demostración**.

---

## 🧪 Testing con Postman

Importa esta colección:

```json
{
  "info": {
    "name": "Prologix Admin API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [{
      "key": "token",
      "value": "{{admin_token}}",
      "type": "string"
    }]
  },
  "item": [
    {
      "name": "Get All Users",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/admin/users"
      }
    },
    {
      "name": "Update GPS-Trace User ID",
      "request": {
        "method": "PATCH",
        "url": "{{base_url}}/admin/users/{{user_id}}/gps-trace",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"gpsTraceUserId\": \"gps-user-12345\"\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        }
      }
    }
  ]
}
```

Variables de entorno:
- `base_url`: `http://localhost:3000`
- `admin_token`: Tu token JWT de admin
- `user_id`: UUID del usuario

---

## 📞 Soporte

Para reportar bugs o solicitar nuevas funcionalidades en la API de admin:
- Email: dev@prologix.com
- GitHub Issues: https://github.com/prologix/gps-tracking/issues
