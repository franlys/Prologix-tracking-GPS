# 🚀 Quick Start - Prologix GPS (Fase 2)

Guía rápida para poner en marcha el backend de Prologix GPS con integración real.

## ⚡ Inicio Rápido (5 minutos)

### 1. Instalar PostgreSQL

**Windows:**
```powershell
# Descargar e instalar desde:
https://www.postgresql.org/download/windows/
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

### 2. Crear Base de Datos

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE prologix_gps;

# Salir
\q
```

### 3. Configurar Variables de Entorno

```bash
cd backend

# El archivo .env ya existe, solo actualiza la contraseña de PostgreSQL
# Editar backend/.env
```

Actualiza esta línea:
```env
DB_PASSWORD=tu_password_de_postgres
```

### 4. Iniciar el Backend

```bash
cd backend
npm run start:dev
```

Deberías ver:
```
📡 GPS-Trace Service initialized with API: https://api.gps-trace.com/v1
⚠️  GPS_TRACE_PARTNER_TOKEN is not configured. GPS features will not work.
🚀 Prologix Tracking GPS Backend running on port 3000
```

**Nota**: Es normal ver la advertencia del token. Lo configuraremos después.

### 5. Probar la API

Abre otra terminal:

```bash
# Registrar usuario
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@prologix.com",
    "password": "password123",
    "name": "Test User"
  }'
```

Si ves un JSON con `accessToken` → ✅ ¡Funciona!

---

## 📋 Checklist de Verificación

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `prologix_gps` creada
- [ ] Backend iniciado sin errores
- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Endpoint /auth/me funciona

---

## 🔧 Configuración GPS-Trace (Opcional - Para Datos Reales)

### 1. Obtener Token Partner

Contacta con GPS-Trace: https://gps-trace.com

### 2. Actualizar .env

```env
GPS_TRACE_PARTNER_TOKEN=tu_token_partner_aqui
```

### 3. Configurar Usuario GPS-Trace

```sql
-- Conectar a PostgreSQL
psql -U postgres -d prologix_gps

-- Actualizar usuario con GPS-Trace ID
UPDATE users
SET "gpsTraceUserId" = 'tu_gps_trace_user_id'
WHERE email = 'test@prologix.com';
```

### 4. Probar Dispositivos Reales

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@prologix.com",
    "password": "password123"
  }'

# Copiar el accessToken y usarlo:

# Listar dispositivos
curl -X GET http://localhost:3000/devices \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## 📚 Endpoints Disponibles

### Autenticación

| Endpoint | Método | Autenticación | Descripción |
|----------|--------|---------------|-------------|
| `/auth/register` | POST | No | Registrar usuario |
| `/auth/login` | POST | No | Iniciar sesión |
| `/auth/me` | GET | ✅ JWT | Obtener perfil |
| `/auth/refresh` | POST | ✅ JWT | Refrescar token |

### Dispositivos GPS

| Endpoint | Método | Plan | Descripción |
|----------|--------|------|-------------|
| `/devices` | GET | BASIC+ | Lista dispositivos |
| `/devices/:id` | GET | BASIC+ | Info dispositivo |
| `/devices/:id/live` | GET | BASIC+ | Posición actual |
| `/devices/:id/history` | GET | PLUS+ | Historial |

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"

**Solución**: Verifica que PostgreSQL esté corriendo:

```bash
# Windows
# Buscar "Services" > PostgreSQL

# Linux/Mac
sudo systemctl status postgresql
```

### Error: "Port 3000 already in use"

**Solución**: Cambia el puerto en `.env`:

```env
PORT=3001
```

### Error: "GPS-Trace user not configured"

**Solución**: Esto es normal si no tienes GPS-Trace configurado. Puedes:

1. Obtener token Partner de GPS-Trace
2. Configurar `gpsTraceUserId` en la base de datos
3. O continuar sin GPS-Trace (solo autenticación funcionará)

---

## 📖 Documentación Completa

- [FASE2_INTEGRATION.md](FASE2_INTEGRATION.md) - Guía completa de Fase 2
- [FASE2_COMPLETED.md](FASE2_COMPLETED.md) - Resumen de lo completado
- [backend/GPS_TRACE_SETUP.md](backend/GPS_TRACE_SETUP.md) - Setup GPS-Trace
- [backend/API_TESTING.md](backend/API_TESTING.md) - Testing de API
- [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) - Instrucciones detalladas

---

## ✅ Siguiente Paso

Una vez que el backend funcione:

### Para Frontend (Gemini):

1. Ver [FASE2_COMPLETED.md](FASE2_COMPLETED.md) - Checklist de Frontend
2. Implementar login real
3. Consumir endpoints
4. Actualizar mapa cada 10-15s

### Para obtener GPS-Trace Token:

1. Ver [backend/GPS_TRACE_SETUP.md](backend/GPS_TRACE_SETUP.md)
2. Contactar GPS-Trace
3. Configurar credenciales
4. Probar con dispositivos reales

---

## 🎯 MVP Exitoso

El MVP se considera exitoso cuando:

- ✅ Login funciona desde la app
- ✅ Usuario ve sus dispositivos
- ✅ Mapa muestra GPS en tiempo real
- ✅ Posición se actualiza automáticamente
- ✅ Plan BASIC no ve historial
- ✅ Plan PLUS sí ve historial

---

**¿Listo?** Ejecuta `npm run start:dev` en `/backend` y empieza a probar! 🚀
