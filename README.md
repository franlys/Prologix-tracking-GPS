# Prologix Tracking GPS

Plataforma de rastreo GPS white-label basada en la Partner API de GPS-Trace (Ruhavik), orientada a usuarios finales, instaladores de GPS y pequeñas flotas en República Dominicana.

**Versión**: 1.0
**Estado**: Inicio de desarrollo
**Owner**: Franlys González Tejeda

## Visión del Proyecto

Ofrecer una aplicación de rastreo GPS más simple, clara y económica que las opciones actuales, con marca propia y monetización independiente, aprovechando la infraestructura de GPS-Trace mediante su Partner API.

## Arquitectura General

```
[ GPS FÍSICO ]
      ↓
[ GPS-Trace / Ruhavik ]
      ↓ (Partner API)
[ BACKEND PROLOGIX ]
      ↓
[ APP MÓVIL iOS / ANDROID ]
```

**Principio de Seguridad**: El token Partner NUNCA llega al frontend. Todo pasa por el backend Prologix.

## Estructura del Repositorio

```
Prologix-tracking-GPS/
│
├── backend/                 # Backend NestJS
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/       # Autenticación JWT
│   │   │   ├── users/      # Gestión de usuarios
│   │   │   ├── devices/    # Gestión de dispositivos
│   │   │   ├── tracking/   # Rastreo en tiempo real
│   │   │   ├── reports/    # Reportes y estadísticas
│   │   │   └── subscriptions/  # Planes
│   │   ├── integrations/
│   │   │   └── gps-trace/  # Integración GPS-Trace
│   │   ├── config/
│   │   └── main.ts
│   └── README.md
│
├── frontend/                # App móvil (Flutter/React Native)
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── services/
│   │   ├── store/
│   │   └── navigation/
│   └── README.md
│
└── README.md               # Este archivo
```

## Backend - Stack Tecnológico

- **Framework**: NestJS
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT
- **ORM**: TypeORM
- **API Client**: Axios

## Frontend - Stack Propuesto

- **Framework**: Flutter o React Native
- **Mapas**: Google Maps SDK
- **Estado**: Provider/Redux
- **API**: REST con JWT

## Modelo de Planes

| Plan   | Acceso                    |
|--------|---------------------------|
| Básico | Ubicación actual          |
| Plus   | Historial                 |
| Pro    | Estadísticas avanzadas    |

El backend valida automáticamente el plan del usuario mediante middleware.

## Roles de Usuario

- **USER**: Usuario final básico
- **INSTALLER**: Instalador de GPS
- **ADMIN**: Administrador del sistema

## Inicio Rápido

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurar .env con credenciales
npm run start:dev
```

Más detalles en [backend/README.md](backend/README.md)

### Frontend

```bash
cd frontend
# Pendiente de implementación
```

## API Endpoints (Backend)

### Autenticación
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Inicio de sesión

### Dispositivos GPS
- `GET /devices` - Lista de dispositivos
- `GET /devices/:id` - Detalles de dispositivo
- `GET /devices/:id/live` - Ubicación en tiempo real
- `GET /devices/:id/history` - Historial (requiere plan PLUS+)

### Reportes
- `GET /reports/kilometers` - Kilómetros recorridos (pendiente)

## Criterios de Éxito del MVP

El MVP se considera exitoso cuando:

1. Se ve un GPS en tiempo real
2. Desde nuestra app móvil
3. Usando nuestro backend
4. Sin necesidad de entrar a Ruhavik

## Estado Actual

### Completado
- [x] Estructura del proyecto backend
- [x] NestJS instalado y configurado
- [x] Módulo de integración GPS-Trace
- [x] Autenticación JWT
- [x] Módulo de usuarios
- [x] Módulo de dispositivos con endpoints básicos
- [x] Sistema de roles y planes
- [x] Guards de seguridad

### Pendiente
- [ ] Frontend móvil
- [ ] Módulo de reportes
- [ ] Módulo de tracking en tiempo real
- [ ] Módulo de suscripciones
- [ ] Tests
- [ ] Documentación Swagger
- [ ] Deploy

## Reglas NO NEGOCIABLES

1. ❌ Nunca exponer API Partner en frontend
2. ❌ No llamar GPS-Trace directo desde la app
3. ✅ Backend es el único intermediario
4. ✅ Código modular y escalable
5. ✅ Seguridad primero

## Próximos Pasos

1. **Frontend (GEMINI PRO)**
   - Inicializar proyecto mobile
   - Pantalla de login
   - Pantalla de mapa con mock
   - Lista de dispositivos

2. **Backend (CLAUDE PRO)**
   - Implementar reportes
   - WebSockets para tracking en tiempo real
   - Sistema de notificaciones
   - Tests

## Tecnologías Clave

- Node.js
- NestJS
- PostgreSQL
- JWT
- TypeORM
- Axios
- Flutter/React Native (frontend)
- Google Maps SDK

## Contacto

**Owner**: Franlys González Tejeda
**Proyecto**: Prologix Tracking GPS
**Versión**: 1.0 - MVP
