# Prologix Tracking GPS - Backend API

Backend NestJS para la plataforma de rastreo GPS white-label basada en GPS-Trace (Ruhavik).

## Stack Tecnológico

- **Framework**: NestJS
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT
- **ORM**: TypeORM
- **Validación**: class-validator
- **HTTP Client**: Axios (GPS-Trace API)

## Estructura del Proyecto

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/              # Autenticación y autorización
│   │   ├── users/             # Gestión de usuarios
│   │   ├── devices/           # Gestión de dispositivos GPS
│   │   ├── tracking/          # Rastreo en tiempo real
│   │   ├── reports/           # Reportes y estadísticas
│   │   └── subscriptions/     # Planes de suscripción
│   ├── integrations/
│   │   └── gps-trace/         # Integración con GPS-Trace API
│   ├── config/                # Configuración
│   ├── app.module.ts
│   └── main.ts
└── package.json
```

## Instalación

### Prerrequisitos

- Node.js >= 18
- PostgreSQL >= 14
- Token Partner de GPS-Trace

### Pasos de instalación

1. Instalar dependencias:
```bash
cd backend
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

3. Editar `.env` con tus credenciales:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_NAME=prologix_gps

JWT_SECRET=tu_secret_jwt_seguro
JWT_EXPIRES_IN=7d

GPS_TRACE_API_URL=https://api.gps-trace.com/v1
GPS_TRACE_PARTNER_TOKEN=tu_token_partner
```

4. Crear la base de datos:
```bash
createdb prologix_gps
```

5. Iniciar el servidor de desarrollo:
```bash
npm run start:dev
```

El servidor estará disponible en `http://localhost:3000`

## API Endpoints

### Autenticación

#### POST `/auth/register`
Registrar un nuevo usuario.

**Request:**
```json
{
  "email": "usuario@example.com",
  "password": "password123",
  "name": "Nombre Usuario"
}
```

**Response:**
```json
{
  "accessToken": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "name": "Nombre Usuario",
    "role": "USER",
    "subscriptionPlan": "BASIC"
  }
}
```

#### POST `/auth/login`
Iniciar sesión.

**Request:**
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    "name": "Nombre Usuario",
    "role": "USER",
    "subscriptionPlan": "BASIC"
  }
}
```

### Dispositivos GPS

Todos los endpoints requieren autenticación (JWT Bearer Token).

#### GET `/devices`
Obtener lista de dispositivos del usuario.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "device_id",
    "name": "Mi Vehículo",
    "imei": "123456789012345",
    "type": "gps",
    "status": "active"
  }
]
```

#### GET `/devices/:id`
Obtener información de un dispositivo específico.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "device_id",
  "name": "Mi Vehículo",
  "imei": "123456789012345",
  "type": "gps",
  "status": "active"
}
```

#### GET `/devices/:id/live`
Obtener ubicación actual del dispositivo.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
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

#### GET `/devices/:id/history`
Obtener historial de ubicaciones (requiere plan PLUS o superior).

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `startDate`: fecha inicio (ISO 8601)
- `endDate`: fecha fin (ISO 8601)

**Ejemplo:**
```
GET /devices/123/history?startDate=2025-12-27T00:00:00Z&endDate=2025-12-27T23:59:59Z
```

**Response:**
```json
[
  {
    "lat": 18.4861,
    "lng": -69.9312,
    "speed": 45.5,
    "timestamp": "2025-12-27T12:00:00Z",
    "altitude": 10,
    "course": 180
  }
]
```

## Roles de Usuario

- **USER**: Usuario básico
- **INSTALLER**: Instalador de GPS
- **ADMIN**: Administrador del sistema

## Planes de Suscripción

- **BASIC**: Acceso a ubicación actual
- **PLUS**: Acceso a historial
- **PRO**: Acceso a estadísticas avanzadas

El backend valida automáticamente el plan del usuario mediante el `SubscriptionGuard`.

## Seguridad

- El token Partner de GPS-Trace NUNCA se expone al frontend
- Todas las llamadas a GPS-Trace pasan por el backend
- JWT para autenticación de usuarios
- Contraseñas hasheadas con bcrypt
- Validación de datos con class-validator

## Scripts NPM

```bash
npm run start:dev    # Desarrollo con hot-reload
npm run build        # Compilar TypeScript
npm run start        # Producción
npm run start:prod   # Producción (alias)
```

## Integración GPS-Trace

El módulo `gps-trace` en `src/integrations/gps-trace/` maneja toda la comunicación con la API Partner de GPS-Trace:

- Autenticación con token Partner
- Normalización de datos
- Manejo de errores
- Timeout de 10 segundos

## Próximos Pasos

- [ ] Implementar módulo de reportes
- [ ] Implementar módulo de tracking en tiempo real
- [ ] Implementar módulo de subscripciones
- [ ] Agregar tests unitarios
- [ ] Agregar tests de integración
- [ ] Documentación con Swagger
- [ ] Rate limiting
- [ ] Logging con Winston

## Contacto

Owner: Franlys González Tejeda
Versión: 1.0
Estado: MVP en desarrollo
