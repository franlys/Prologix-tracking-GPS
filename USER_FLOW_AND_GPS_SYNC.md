# 🔄 Flujo de Usuarios y Sincronización GPS - Prologix GPS Tracking

**Fecha:** 28 de Diciembre 2025

---

## 📱 Flujo Completo de Usuarios

### 1. Usuario Nuevo (Registro)

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO NUEVO                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Usuario abre la app                                      │
│     ├─> Ve pantalla de login con brújula animada           │
│     └─> Click en "Crear Nueva Cuenta"                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Formulario de Registro                                   │
│     ├─> Nombre completo (requerido)                        │
│     ├─> Email (requerido)                                  │
│     ├─> Teléfono (opcional)                                │
│     ├─> Contraseña (mínimo 6 caracteres)                   │
│     └─> Confirmar contraseña                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. POST /auth/register                                      │
│     Backend crea:                                           │
│     ├─> Usuario en tabla `users`                           │
│     ├─> Suscripción FREE en tabla `subscriptions`          │
│     │   ├─ plan: FREE                                       │
│     │   ├─ status: TRIALING                                 │
│     │   ├─ maxDevices: 1                                    │
│     │   ├─ maxGeofences: 1                                  │
│     │   └─ trialEndsAt: +7 días                            │
│     └─> Código de referido en tabla `referrals`           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Auto-login                                               │
│     ├─> POST /auth/login automático                        │
│     ├─> Guarda accessToken                                 │
│     └─> Redirige a /(tabs)/map                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Primera vez en la app                                    │
│     ├─> Mapa vacío (no hay dispositivos)                   │
│     ├─> Banner: "Contacta a tu instalador"                 │
│     └─> Mensaje: esperando sincronización GPS              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Sincronización GPS - Opción A (Recomendada)

### Flujo Instalador → Usuario

```
┌─────────────────────────────────────────────────────────────┐
│              INSTALADOR/ADMIN                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Instalador recibe GPS físico                             │
│     └─> Configura GPS en GPS-Trace                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Instalador ingresa al Panel Admin                        │
│     URL: /admin (solo usuarios con role: ADMIN)            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Busca al usuario cliente                                 │
│     GET /admin/users                                        │
│     └─> Lista de todos los usuarios                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Vincula cuenta GPS-Trace al usuario                      │
│     PATCH /admin/users/:userId/gps-trace                    │
│     Body: {                                                 │
│       "gpsTraceUserId": "12345"                            │
│     }                                                       │
│                                                             │
│     Backend guarda en tabla `users`:                        │
│     └─> users.gpsTraceUserId = "12345"                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              USUARIO CLIENTE                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Usuario recarga la app                                   │
│     GET /devices                                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Backend consulta GPS-Trace                               │
│     ├─> Lee user.gpsTraceUserId                            │
│     ├─> GET GPS-Trace API /objects                         │
│     ├─> Filtra dispositivos del usuario                    │
│     └─> Devuelve lista de GPS al frontend                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  7. Usuario ve sus dispositivos GPS                          │
│     ├─> Mapa con marcadores                                │
│     ├─> Lista de dispositivos                              │
│     └─> Rastreo en tiempo real                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Sincronización GPS - Opción B (Auto-registro)

### Si quieres que usuarios registren sus propios GPS

```
┌─────────────────────────────────────────────────────────────┐
│  1. Usuario en la app                                        │
│     └─> Click en "Agregar Dispositivo GPS"                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Formulario de vinculación                                │
│     ├─> ID de cuenta GPS-Trace                             │
│     ├─> Token de autenticación (opcional)                  │
│     └─> O credenciales GPS-Trace                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. POST /devices/link                                       │
│     Backend:                                                │
│     ├─> Valida credenciales con GPS-Trace                  │
│     ├─> Guarda gpsTraceUserId en users                     │
│     └─> Devuelve lista de dispositivos                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Endpoints Involucrados

### Autenticación
```typescript
POST /auth/register
Body: {
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "secret123",
  "phoneNumber": "+1 (809) 123-4567" // opcional
}

Response: {
  "user": { id, email, name, role, subscriptionPlan },
  "accessToken": "jwt-token..."
}
```

```typescript
POST /auth/login
Body: {
  "email": "juan@example.com",
  "password": "secret123"
}

Response: {
  "user": { id, email, name, role },
  "accessToken": "jwt-token..."
}
```

### Dispositivos GPS
```typescript
GET /devices
Headers: { Authorization: "Bearer jwt-token" }

Backend Flow:
1. Extrae userId del JWT
2. Lee user.gpsTraceUserId de la DB
3. Si gpsTraceUserId existe:
   └─> Consulta GPS-Trace API con ese userId
4. Devuelve dispositivos

Response: [
  {
    "id": "gps-123",
    "name": "Toyota Corolla 2024",
    "imei": "123456789",
    "online": true,
    "lastPosition": {
      "lat": 18.4861,
      "lng": -69.9312,
      "timestamp": "2025-12-28T12:00:00Z",
      "speed": 45
    }
  }
]
```

### Admin (solo para ADMIN/INSTALLER)
```typescript
GET /admin/users
Headers: { Authorization: "Bearer admin-jwt-token" }

Response: [
  {
    "id": "user-uuid",
    "email": "cliente@example.com",
    "name": "Cliente Nombre",
    "gpsTraceUserId": null, // No vinculado aún
    "subscriptionPlan": "FREE"
  }
]
```

```typescript
PATCH /admin/users/:userId/gps-trace
Headers: { Authorization: "Bearer admin-jwt-token" }
Body: {
  "gpsTraceUserId": "12345"
}

Response: {
  "success": true,
  "user": {
    "id": "user-uuid",
    "gpsTraceUserId": "12345"
  }
}
```

---

## 🔐 Roles de Usuario

### 1. USER (Cliente Final)
- Puede ver sus propios dispositivos
- No puede vincular GPS (lo hace el instalador)
- Puede upgrade su plan
- Puede ver dashboard y estadísticas

### 2. INSTALLER
- Puede crear usuarios clientes
- Puede vincular GPS a usuarios
- Acceso a panel admin limitado

### 3. ADMIN
- Acceso completo al panel admin
- Puede ver todos los usuarios
- Puede modificar planes
- Puede vincular/desvincular GPS

---

## 💡 Mejoras Recomendadas

### 1. Panel Admin en el Frontend
Crear pantalla para ADMIN/INSTALLER:

```
frontend/app/(admin)/
  ├── users.tsx          # Lista de usuarios
  ├── users/[id].tsx     # Detalle de usuario
  └── link-gps.tsx       # Vincular GPS a usuario
```

### 2. Onboarding para Usuario Nuevo
Mostrar después del registro:

```
1. Bienvenida
2. Explicar que el instalador vinculará los GPS
3. Checklist:
   ├─ ✓ Cuenta creada
   ├─ ⏳ Esperando GPS del instalador
   └─ ⏳ Comienza a rastrear
```

### 3. Notificación de GPS Vinculado
Cuando admin vincula GPS:
- Enviar email al usuario
- Enviar notificación push
- Mostrar banner en la app

### 4. QR Code para Vinculación Rápida
Instalador escanea QR del cliente para vincular:

```
Usuario muestra QR → Instalador escanea → Vincula automáticamente
```

---

## 🚀 Flujo Completo Simplificado

```
1. CLIENTE se registra en la app
   └─> Obtiene plan FREE (1 GPS, trial 7 días)

2. CLIENTE contacta INSTALADOR
   └─> "Quiero rastreo GPS para mi vehículo"

3. INSTALADOR instala GPS físico
   ├─> Configura GPS en GPS-Trace
   └─> Obtiene ID de cuenta GPS-Trace: "12345"

4. INSTALADOR entra a Panel Admin Prologix
   ├─> Busca email del cliente
   └─> Vincula: users.gpsTraceUserId = "12345"

5. CLIENTE recarga la app
   └─> Ya puede ver sus dispositivos GPS

6. CLIENTE usa la app
   ├─> Ve ubicación en tiempo real
   ├─> Configura alertas
   └─> Si necesita más GPS → Upgrade plan
```

---

## 📝 Pendiente de Implementar

### Frontend
- [ ] Pantalla de admin para vincular GPS
- [ ] Onboarding para nuevos usuarios
- [ ] Banner "Esperando GPS del instalador"
- [ ] Botón "Ya tengo GPS-Trace, vincular ahora"

### Backend
Ya implementado ✅:
- [x] POST /auth/register
- [x] POST /auth/login
- [x] GET /devices (con soporte gpsTraceUserId)
- [x] PATCH /admin/users/:userId/gps-trace

---

**Resumen:** El flujo actual es que el INSTALADOR vincula el GPS al cliente desde el panel admin. El cliente solo necesita registrarse y esperar que el instalador haga la vinculación.
