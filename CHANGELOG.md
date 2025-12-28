# Changelog - Prologix Tracking GPS

Todos los cambios notables del proyecto están documentados aquí.

---

## [Fase 2] - 2025-12-27

### ✨ Nuevas Funcionalidades

#### Autenticación
- `GET /auth/me` - Endpoint para obtener perfil completo del usuario autenticado
- `POST /auth/refresh` - Endpoint para refrescar JWT token sin necesidad de re-login

#### Servicios
- Validación automática de `gpsTraceUserId` en todos los endpoints de dispositivos
- Mensajes de error específicos cuando usuario no tiene GPS-Trace configurado

### 🔧 Mejoras

#### GPS-Trace Service
- Timeout aumentado de 10s a 15s para mejor manejo de APIs lentas
- Logs informativos al inicializar el servicio
- Manejo mejorado de errores con contexto y timestamps
- Errores específicos para conexión fallida (ECONNREFUSED)
- Errores específicos para autenticación fallida (401)

#### Seguridad
- Validación de usuario activo en refresh token
- Verificación de `gpsTraceUserId` antes de llamar GPS-Trace API
- Mejor aislamiento de datos por usuario

### 📚 Documentación

#### Nuevos Archivos
- `FASE2_COMPLETED.md` - Resumen completo de Fase 2
- `FASE2_INTEGRATION.md` - Guía de integración Fase 2
- `backend/GPS_TRACE_SETUP.md` - Guía de configuración GPS-Trace
- `QUICK_START.md` - Inicio rápido en 5 minutos
- `FRANLYS_LEER_PRIMERO.md` - Punto de entrada principal
- `CHANGELOG.md` - Este archivo

#### Actualizados
- `backend/API_TESTING.md` - Agregados nuevos endpoints
- `PROJECT_STATUS.md` - Estado actualizado a Fase 2
- `README.md` - Mantenido actualizado

### 🐛 Correcciones
- Tipo TypeScript en `jwt.config.ts` corregido con type assertion
- Imports de `UsersModule` agregados a `DevicesModule`

### 🔄 Cambios en API

#### Endpoints Modificados

**`GET /devices`**
- Ahora valida `gpsTraceUserId` del usuario autenticado
- Retorna 404 si usuario no tiene GPS-Trace configurado

**`GET /devices/:id`**
- Ahora requiere usuario autenticado en parámetros
- Valida `gpsTraceUserId` antes de consultar GPS-Trace

**`GET /devices/:id/live`**
- Ahora requiere usuario autenticado en parámetros
- Valida `gpsTraceUserId` antes de consultar GPS-Trace

**`GET /devices/:id/history`**
- Ahora requiere usuario autenticado en parámetros
- Valida `gpsTraceUserId` antes de consultar GPS-Trace
- Mantiene validación de plan PLUS+

---

## [Fase 1] - 2025-12-27

### ✨ Lanzamiento Inicial

#### Infraestructura
- Proyecto NestJS inicializado
- TypeScript configurado
- PostgreSQL con TypeORM
- Estructura modular implementada

#### Autenticación
- `POST /auth/register` - Registro de usuarios
- `POST /auth/login` - Inicio de sesión con JWT
- Sistema de roles (USER, INSTALLER, ADMIN)
- Sistema de planes (BASIC, PLUS, PRO)
- Bcrypt para contraseñas
- Guards de autenticación JWT
- Guards de autorización por plan
- Decoradores `@CurrentUser` y `@RequirePlan`

#### GPS-Trace Integration
- Servicio completo de integración
- Autenticación con Partner Token
- Normalización de datos de dispositivos
- Normalización de posiciones
- Normalización de historial
- Manejo básico de errores

#### Endpoints Dispositivos
- `GET /devices` - Listar dispositivos
- `GET /devices/:id` - Obtener dispositivo por ID
- `GET /devices/:id/live` - Ubicación en tiempo real
- `GET /devices/:id/history` - Historial de rutas (PLUS+)

#### Base de Datos
- Entidad User con campos completos
- Enums para roles y planes
- Timestamps automáticos
- Campo `gpsTraceUserId` para vinculación

#### Configuración
- Variables de entorno con `.env`
- Configuración de base de datos
- Configuración de JWT
- Scripts NPM para desarrollo y producción

#### Documentación
- README principal del proyecto
- README del backend
- Instrucciones de configuración
- Guía de testing de API
- Estado del proyecto

---

## Versionado

Este proyecto sigue el esquema de fases para MVP:

- **Fase 1**: Backend base con autenticación y GPS-Trace integration
- **Fase 2**: Ajustes para integración real y mejoras de seguridad
- **Fase 3**: (Pendiente) Monetización y pagos

---

## Próximas Fases

### Fase 3 - Monetización (Planeada)
- [ ] Integración con Stripe
- [ ] Pricing en RD$ (Pesos Dominicanos)
- [ ] Paywall UI en frontend
- [ ] Sistema de suscripciones
- [ ] In-App Purchase (iOS/Android)
- [ ] Webhooks de pago
- [ ] Panel de administración de suscripciones

### Fase 4 - Características Avanzadas (Futura)
- [ ] WebSockets para tracking en tiempo real
- [ ] Sistema de notificaciones
- [ ] Geofencing
- [ ] Alertas de velocidad
- [ ] Reportes avanzados (plan PRO)
- [ ] Dashboard de estadísticas
- [ ] Exportación de datos
- [ ] API pública para integradores

### Fase 5 - Optimización (Futura)
- [ ] Caché de posiciones con Redis
- [ ] Rate limiting
- [ ] Logging estructurado con Winston
- [ ] Monitoreo con Sentry
- [ ] CI/CD pipeline
- [ ] Tests automatizados (unit + integration)
- [ ] Documentación con Swagger
- [ ] Performance optimization

---

## Notas de Migración

### Fase 1 → Fase 2

**⚠️ Breaking Changes:**
- Ninguno. Fase 2 es completamente compatible con Fase 1.

**Cambios de Comportamiento:**
- Endpoints de dispositivos ahora validan `gpsTraceUserId`
- Error 404 si usuario no tiene GPS-Trace configurado (antes era error 500)
- Timeout de GPS-Trace aumentado a 15s (antes 10s)

**Migración de Datos:**
- No se requiere migración de base de datos
- Usuarios existentes funcionarán normalmente
- Para usar dispositivos, configurar `gpsTraceUserId` por usuario:
  ```sql
  UPDATE users SET "gpsTraceUserId" = 'id_aqui' WHERE email = 'user@example.com';
  ```

---

## Créditos

- **Owner**: Franlys González Tejeda
- **Backend (Fase 1 y 2)**: Claude
- **Frontend (Pendiente)**: Gemini
- **Arquitectura**: Colaborativa

---

## Licencia

Pendiente de definición.

---

_Última actualización: 27 de Diciembre, 2025_
