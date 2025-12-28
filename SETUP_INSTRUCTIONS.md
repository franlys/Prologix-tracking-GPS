# Instrucciones de Configuración - Prologix Tracking GPS

## Lo que ya está hecho

El backend NestJS está completamente inicializado y listo para usar con:

### Módulos implementados

1. **GPS-Trace Integration** (`src/integrations/gps-trace/`)
   - Servicio completo para comunicación con GPS-Trace API
   - Normalización de datos de dispositivos, posiciones e historial
   - Manejo de errores robusto

2. **Authentication** (`src/modules/auth/`)
   - Registro e inicio de sesión con JWT
   - Guards de autenticación y autorización
   - Validación de planes de suscripción
   - Decoradores personalizados (@CurrentUser, @RequirePlan)

3. **Users** (`src/modules/users/`)
   - Entidad User con roles y planes
   - Gestión de usuarios con bcrypt
   - Integración con TypeORM

4. **Devices** (`src/modules/devices/`)
   - Endpoints para listar dispositivos
   - Ubicación en tiempo real
   - Historial de rutas (requiere plan PLUS+)

5. **Configuration** (`src/config/`)
   - Configuración de base de datos PostgreSQL
   - Configuración JWT

## Pasos para ejecutar el proyecto

### 1. Instalar PostgreSQL

Si no tienes PostgreSQL instalado:

**Windows:**
```bash
# Descargar e instalar desde:
https://www.postgresql.org/download/windows/
```

**Linux/Mac:**
```bash
# Linux
sudo apt-get install postgresql postgresql-contrib

# Mac
brew install postgresql
```

### 2. Crear la base de datos

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE prologix_gps;

# Salir
\q
```

### 3. Configurar variables de entorno

```bash
cd backend
cp .env.example .env
```

Editar el archivo `.env` con tus credenciales:

```env
# Server
PORT=3000
NODE_ENV=development

# Database - CONFIGURAR AQUÍ
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=TU_PASSWORD_DE_POSTGRES
DB_NAME=prologix_gps

# JWT - CAMBIAR EN PRODUCCIÓN
JWT_SECRET=tu_secret_jwt_muy_seguro_y_largo
JWT_EXPIRES_IN=7d

# GPS-Trace - OBTENER DE GPS-TRACE
GPS_TRACE_API_URL=https://api.gps-trace.com/v1
GPS_TRACE_PARTNER_TOKEN=TU_TOKEN_PARTNER_AQUI
```

### 4. Instalar dependencias (ya hecho)

Las dependencias ya están instaladas, pero si necesitas reinstalar:

```bash
cd backend
npm install
```

### 5. Iniciar el servidor de desarrollo

```bash
cd backend
npm run start:dev
```

Deberías ver:
```
🚀 Prologix Tracking GPS Backend running on port 3000
```

### 6. Probar la API

#### Registrar un usuario

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@prologix.com",
    "password": "password123",
    "name": "Usuario Test"
  }'
```

#### Iniciar sesión

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@prologix.com",
    "password": "password123"
  }'
```

Guarda el `accessToken` que recibes.

#### Obtener dispositivos

```bash
curl -X GET http://localhost:3000/devices \
  -H "Authorization: Bearer TU_ACCESS_TOKEN_AQUI"
```

## Obtener Token Partner de GPS-Trace

Para obtener tu token Partner de GPS-Trace:

1. Visita: https://gps-trace.com
2. Contacta con su equipo de soporte para solicitar acceso a la Partner API
3. Una vez aprobado, te proporcionarán:
   - URL de la API
   - Token Partner

## Endpoints disponibles

### Autenticación
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Iniciar sesión

### Dispositivos (requieren autenticación)
- `GET /devices` - Listar dispositivos del usuario
- `GET /devices/:id` - Obtener dispositivo específico
- `GET /devices/:id/live` - Ubicación en tiempo real
- `GET /devices/:id/history` - Historial (Plan PLUS+)

## Estructura de Base de Datos

Al iniciar el servidor, TypeORM creará automáticamente la tabla:

```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  password VARCHAR,
  name VARCHAR,
  role ENUM ('USER', 'INSTALLER', 'ADMIN'),
  subscriptionPlan ENUM ('BASIC', 'PLUS', 'PRO'),
  gpsTraceUserId VARCHAR,
  isActive BOOLEAN,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)
```

## Próximos pasos

1. **Obtener token Partner de GPS-Trace**
   - Sin este token, los endpoints de dispositivos no funcionarán

2. **Implementar frontend móvil**
   - Responsabilidad de GEMINI PRO
   - Flutter o React Native

3. **Agregar módulos pendientes**
   - Reports
   - Tracking en tiempo real
   - Subscriptions

4. **Testing**
   - Tests unitarios
   - Tests de integración

5. **Deploy**
   - Heroku, Railway, DigitalOcean, etc.

## Solución de problemas

### Error de conexión a PostgreSQL

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solución**: Verifica que PostgreSQL esté corriendo:

```bash
# Linux/Mac
sudo systemctl status postgresql

# Windows
# Buscar "Services" > PostgreSQL
```

### Error de autenticación de PostgreSQL

```
Error: password authentication failed for user "postgres"
```

**Solución**: Verifica tu contraseña en `.env` y en PostgreSQL.

### Puerto 3000 en uso

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solución**: Cambia el puerto en `.env`:
```env
PORT=3001
```

## Contacto y Soporte

**Owner**: Franlys González Tejeda
**Proyecto**: Prologix Tracking GPS
**Estado**: MVP - Fase de desarrollo inicial

Para preguntas o problemas, crear un issue en el repositorio.
