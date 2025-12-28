# Configuración GPS-Trace Partner API

Guía para configurar la integración con GPS-Trace Partner API.

## 1. Obtener Credenciales Partner

### Opción A: Contactar GPS-Trace Directamente

1. Visita: https://gps-trace.com
2. Busca la sección "For Partners" o "Partner API"
3. Completa el formulario de solicitud de Partner API
4. Espera aprobación (puede tomar 1-3 días laborables)
5. Recibirás por email:
   - Partner Token
   - URL de la API
   - Documentación de endpoints

### Opción B: GPS-Trace Alternative (Ruhavik)

GPS-Trace también opera bajo la marca Ruhavik:

1. Visita: https://ruhavik.com
2. Crea una cuenta de desarrollador
3. Solicita acceso a Partner API
4. Documenta las credenciales recibidas

## 2. Configurar Backend Prologix

### Actualizar .env

Una vez recibas tus credenciales:

```env
# GPS-Trace Partner API
GPS_TRACE_API_URL=https://api.gps-trace.com/v1
GPS_TRACE_PARTNER_TOKEN=tu_token_partner_real_aqui
```

### Verificar Conexión

Inicia el servidor:

```bash
cd backend
npm run start:dev
```

Deberías ver:
```
📡 GPS-Trace Service initialized with API: https://api.gps-trace.com/v1
🚀 Prologix Tracking GPS Backend running on port 3000
```

Si el token no está configurado, verás:
```
⚠️  GPS_TRACE_PARTNER_TOKEN is not configured. GPS features will not work.
```

## 3. Estructura de Usuarios

### Relación Prologix ↔ GPS-Trace

Cada usuario en Prologix debe tener su ID correspondiente en GPS-Trace:

```
Usuario Prologix          GPS-Trace
┌──────────────────┐     ┌──────────────────┐
│ id: uuid-123     │     │ user_id: abc-456 │
│ email: user@...  │ ──→ │ email: user@...  │
│ gpsTraceUserId:  │     │ devices: [...]   │
│   "abc-456"      │     └──────────────────┘
└──────────────────┘
```

### Configurar gpsTraceUserId

#### Opción 1: Manualmente (Desarrollo/Testing)

```sql
-- Conectar a PostgreSQL
psql -U postgres -d prologix_gps

-- Ver usuarios sin GPS-Trace ID
SELECT id, email, name, "gpsTraceUserId"
FROM users
WHERE "gpsTraceUserId" IS NULL;

-- Actualizar usuario específico
UPDATE users
SET "gpsTraceUserId" = 'id_usuario_en_gps_trace'
WHERE email = 'usuario@example.com';

-- Verificar
SELECT id, email, "gpsTraceUserId" FROM users;
```

#### Opción 2: Automáticamente (Producción - Futuro)

Crear endpoint para registrar usuario en GPS-Trace automáticamente:

```typescript
// POST /auth/register
async register(registerDto: RegisterDto) {
  // 1. Crear usuario en Prologix
  const user = await this.usersService.create(email, password, name);

  // 2. Crear usuario en GPS-Trace vía Partner API
  const gpsTraceUser = await this.gpsTraceService.createUser({
    email: user.email,
    name: user.name,
  });

  // 3. Guardar GPS-Trace ID en Prologix
  await this.usersService.update(user.id, {
    gpsTraceUserId: gpsTraceUser.id,
  });

  // 4. Retornar JWT
  return { accessToken, user };
}
```

## 4. Testing con Datos Reales

### Paso 1: Registrar usuario en Prologix

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

### Paso 2: Obtener usuario GPS-Trace ID

Opción A: Si ya tienes cuenta en GPS-Trace
- Inicia sesión en https://gps-trace.com
- Ve a tu perfil
- Copia tu User ID

Opción B: Consultar documentación Partner API
- Usar endpoint de crear usuario
- Guardar el ID retornado

### Paso 3: Vincular IDs

```sql
UPDATE users
SET "gpsTraceUserId" = 'tu_gps_trace_user_id'
WHERE email = 'test@prologix.com';
```

### Paso 4: Probar endpoints

```bash
# Obtener perfil
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer {token}"

# Listar dispositivos
curl -X GET http://localhost:3000/devices \
  -H "Authorization: Bearer {token}"

# Ubicación en tiempo real
curl -X GET http://localhost:3000/devices/{device_id}/live \
  -H "Authorization: Bearer {token}"
```

## 5. Documentación GPS-Trace API

### Endpoints Comunes (Partner API)

**Autenticación**
```
Authorization: Bearer {partner_token}
```

**Listar dispositivos de usuario**
```
GET /devices?user_id={gpsTraceUserId}
```

**Ubicación actual**
```
GET /devices/{device_id}/position
```

**Historial**
```
GET /devices/{device_id}/history?start={iso_date}&end={iso_date}
```

**Crear usuario (si disponible)**
```
POST /users
{
  "email": "user@example.com",
  "name": "User Name",
  "password": "optional"
}
```

### Respuestas Esperadas

**Device Object**
```json
{
  "id": "device_123",
  "name": "Mi Vehículo",
  "imei": "123456789012345",
  "type": "gps",
  "status": "active"
}
```

**Position Object**
```json
{
  "lat": 18.4861,
  "lng": -69.9312,
  "speed": 45.5,
  "course": 180,
  "altitude": 10,
  "timestamp": "2025-12-27T12:00:00Z",
  "address": "Santo Domingo, República Dominicana"
}
```

## 6. Manejo de Errores

### Error: Token no configurado

```
⚠️  GPS_TRACE_PARTNER_TOKEN is not configured. GPS features will not work.
```

**Solución**: Actualizar `.env` con token válido y reiniciar servidor.

### Error: 401 Unauthorized

```json
{
  "message": "GPS-Trace authentication failed",
  "error": "Invalid Partner Token. Please check GPS_TRACE_PARTNER_TOKEN configuration."
}
```

**Solución**: Verificar que el token sea correcto y esté activo.

### Error: 404 GPS-Trace user not configured

```json
{
  "statusCode": 404,
  "message": "GPS-Trace user not configured. Please contact support."
}
```

**Solución**: Configurar `gpsTraceUserId` en la base de datos para ese usuario.

### Error: 503 Service Unavailable

```json
{
  "message": "Cannot connect to GPS-Trace API",
  "error": "Connection refused. Please check GPS-Trace API configuration."
}
```

**Solución**: Verificar URL de API y conexión a internet.

## 7. Checklist Pre-Producción

- [ ] Token Partner obtenido y válido
- [ ] URL de API correcta en `.env`
- [ ] Sistema de vinculación de usuarios implementado
- [ ] Testing con dispositivos reales
- [ ] Manejo de errores probado
- [ ] Rate limiting configurado (si aplica)
- [ ] Logs de errores monitoreados
- [ ] Documentación para usuarios finales

## 8. Soporte

### GPS-Trace Support
- Email: support@gps-trace.com
- Docs: https://gps-trace.com/docs
- Forum: https://forum.gps-trace.com

### Prologix Support
- Owner: Franlys González Tejeda
- Ver documentación interna
- Crear tickets en sistema de soporte

## 9. Seguridad

### ✅ NUNCA hacer

- ❌ Exponer Partner Token al frontend
- ❌ Incluir token en repositorio Git
- ❌ Compartir token con terceros no autorizados
- ❌ Usar mismo token para dev y producción (si es posible)

### ✅ SIEMPRE hacer

- ✅ Usar variables de entorno
- ✅ Token diferente por ambiente (dev/staging/prod)
- ✅ Rotar tokens periódicamente
- ✅ Monitorear uso de API
- ✅ Implementar rate limiting
- ✅ Logs de acceso a GPS-Trace API

## 10. Próximos Pasos

1. **Obtener Token Partner** (más importante)
2. **Testing con dispositivos reales**
3. **Implementar creación automática de usuarios**
4. **Configurar webhooks** (si GPS-Trace lo soporta)
5. **Optimizar caché de posiciones**
6. **Implementar sistema de alertas**

---

**Última actualización**: 27 de Diciembre, 2025
**Estado**: Guía completada - Pendiente obtención de token
