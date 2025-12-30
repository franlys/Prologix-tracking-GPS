# 📋 Sistema de Instaladores y Comisiones

**Fecha:** 30 de Diciembre 2025
**Versión:** 1.0

---

## 🎯 Resumen del Sistema

Este documento explica cómo funciona el sistema de instaladores y comisiones del 10% en Prologix GPS Tracking.

### Conceptos Clave

1. **Instalador**: Persona que instala físicamente los dispositivos GPS en los vehículos de los clientes
2. **Comisión**: 10% del monto de la primera suscripción que elija cada cliente
3. **Vinculación**: Relación entre un cliente y el instalador que le instaló el GPS

---

## 👥 Roles del Sistema

### 1. ADMIN
- Acceso total al sistema
- Puede crear instaladores
- Puede ver todas las comisiones
- Puede marcar comisiones como pagadas
- Puede vincular clientes a instaladores

### 2. INSTALLER
- Puede ver sus propios clientes
- Puede ver sus propias comisiones
- Puede vincular nuevos clientes a sí mismo
- No puede ver datos de otros instaladores

### 3. USER (Cliente)
- Usuario final que usa la app para rastrear sus vehículos
- Está vinculado a un instalador (el que le instaló el GPS)
- Su primera suscripción genera comisión para su instalador

---

## 💰 Sistema de Comisiones

### Regla Principal
**SOLO se paga comisión por la PRIMERA suscripción del cliente**

### Ejemplo Práctico

**Instalador 1** tiene 2 clientes:
- **Cliente X1**: Elige suscripción anual de $250
  - Comisión = $250 × 10% = **$25.00**
- **Cliente X2**: Elige suscripción mensual de $400
  - Comisión = $400 × 10% = **$40.00**

**Total comisión Instalador 1 = $65.00**

**Instalador 2** aún no tiene clientes:
- Total comisión = **$0.00**

### ¿Qué pasa si el cliente cambia de plan?

**NO se genera nueva comisión.** Solo la primera suscripción cuenta.

Ejemplo:
1. Cliente elige plan BASIC ($250) → Instalador gana $25
2. Cliente upgrade a plan PRO ($400) → Instalador NO gana nada adicional
3. Cliente renueva el plan PRO → Instalador NO gana nada adicional

---

## 🔧 Flujo de Trabajo

### Paso 1: Crear Instalador

**Desde Admin Panel:**

```bash
POST /auth/register
{
  "email": "instalador1@ejemplo.com",
  "password": "Segura123!",
  "name": "Juan Instalador",
  "phoneNumber": "+18091234567"
}
```

**Luego promover a INSTALLER:**

```bash
POST /admin-setup/promote
{
  "email": "instalador1@ejemplo.com",
  "password": "Segura123!"
}

# Después cambiar manualmente el role a INSTALLER en base de datos
```

### Paso 2: Cliente se Registra

El cliente descarga la app y se registra:

```bash
POST /auth/register
{
  "email": "cliente@ejemplo.com",
  "password": "Password123!",
  "name": "María Cliente",
  "phoneNumber": "+18099876543"
}
```

En este momento el cliente es USER pero NO está vinculado a ningún instalador.

### Paso 3: Instalador Instala el GPS

El instalador físicamente instala el dispositivo GPS en el vehículo del cliente.

### Paso 4: Vincular Cliente al Instalador

**Opción A - El instalador mismo lo hace:**

```bash
POST /installers/link-client
Authorization: Bearer <token-del-instalador>
{
  "clientId": "uuid-del-cliente",
  "installerId": "uuid-del-instalador" // Opcional, se auto-detecta si es instalador
}
```

**Opción B - Admin lo hace:**

```bash
POST /installers/link-client
Authorization: Bearer <token-admin>
{
  "clientId": "uuid-del-cliente",
  "installerId": "uuid-del-instalador"
}
```

### Paso 5: Cliente Elige Suscripción

Cuando el cliente elige su PRIMERA suscripción:

```bash
POST /subscriptions/subscribe
Authorization: Bearer <token-del-cliente>
{
  "plan": "PRO",
  "amount": 400.00
}
```

**El backend automáticamente:**
1. Verifica si el cliente tiene instalador vinculado
2. Verifica si ya existe una comisión para este cliente
3. Si NO existe, crea la comisión del 10%

```bash
# Esto se ejecuta automáticamente en el backend
POST /installers/commissions/create
{
  "installerId": "uuid-instalador",
  "clientId": "uuid-cliente",
  "subscriptionPlan": "PRO",
  "subscriptionAmount": 400.00
}
```

### Paso 6: Admin Paga la Comisión

Cuando el admin paga al instalador:

```bash
PATCH /installers/commissions/{commissionId}/mark-paid
Authorization: Bearer <token-admin>
{
  "notes": "Pagado vía transferencia bancaria el 30/12/2025"
}
```

---

## 📊 Endpoints del Sistema

### Para Instaladores

```bash
# Ver mis estadísticas
GET /installers/me/stats
Authorization: Bearer <token-instalador>

# Ver mis clientes
GET /installers/me/clients
Authorization: Bearer <token-instalador>

# Ver mis comisiones
GET /installers/me/commissions
Authorization: Bearer <token-instalador>

# Vincular nuevo cliente
POST /installers/link-client
Authorization: Bearer <token-instalador>
{
  "clientId": "uuid-del-cliente"
}
```

### Para Admin

```bash
# Ver todos los instaladores
GET /installers
Authorization: Bearer <token-admin>

# Ver clientes de un instalador
GET /installers/{installerId}/clients
Authorization: Bearer <token-admin>

# Ver estadísticas de un instalador
GET /installers/{installerId}/stats
Authorization: Bearer <token-admin>

# Ver resumen de todas las comisiones
GET /installers/commissions/summary
Authorization: Bearer <token-admin>

# Marcar comisión como pagada
PATCH /installers/commissions/{commissionId}/mark-paid
Authorization: Bearer <token-admin>
{
  "notes": "Notas del pago"
}
```

---

## 🗄️ Estructura de Base de Datos

### Tabla: users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  password VARCHAR,
  name VARCHAR,
  role VARCHAR, -- 'USER', 'INSTALLER', 'ADMIN'
  subscription_plan VARCHAR,
  installer_id UUID, -- Referencia al instalador que lo agregó
  phone_number VARCHAR,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (installer_id) REFERENCES users(id)
);
```

### Tabla: installer_commissions

```sql
CREATE TABLE installer_commissions (
  id UUID PRIMARY KEY,
  installer_id UUID NOT NULL,
  client_id UUID NOT NULL,
  subscription_plan VARCHAR NOT NULL,
  subscription_amount DECIMAL(10,2) NOT NULL,
  commission_percentage DECIMAL(5,2) DEFAULT 10.00,
  commission_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'CANCELLED'
  paid_at TIMESTAMP NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (installer_id) REFERENCES users(id),
  FOREIGN KEY (client_id) REFERENCES users(id)
);
```

---

## 🔐 Crear tu Primer Admin

Como no tienes acceso a la consola SQL de Railway, usa este endpoint temporal:

### Opción 1: Promover usuario existente

Si ya tienes un usuario creado (ej: admin@prologix.com):

```bash
curl -X POST https://prologix-tracking-gps-production.up.railway.app/admin-setup/promote \
-H "Content-Type: application/json" \
-d '{
  "email": "admin@prologix.com",
  "password": "Test123!"
}'
```

### Opción 2: Crear nuevo admin

```bash
curl -X POST https://prologix-tracking-gps-production.up.railway.app/admin-setup/create \
-H "Content-Type: application/json" \
-d '{
  "email": "franlysgonzaleztejeda@gmail.com",
  "password": "TuContraseñaSegura123!",
  "name": "Franlys Gonzalez"
}'
```

---

## 📱 Ejemplo de Flujo Completo

### Día 1: Setup Inicial

```bash
# 1. Crear usuario admin
curl -X POST https://tu-backend.up.railway.app/admin-setup/create \
-H "Content-Type: application/json" \
-d '{
  "email": "admin@prologix.com",
  "password": "Admin123!",
  "name": "Admin Prologix"
}'

# 2. Crear instalador
curl -X POST https://tu-backend.up.railway.app/auth/register \
-H "Content-Type: application/json" \
-d '{
  "email": "instalador1@prologix.com",
  "password": "Instalador123!",
  "name": "Juan Instalador"
}'

# 3. Promover a INSTALLER (desde admin)
# Necesitarás actualizar el role en base de datos o crear endpoint
```

### Día 2: Cliente Nuevo

```bash
# 1. Cliente se registra
curl -X POST https://tu-backend.up.railway.app/auth/register \
-H "Content-Type: application/json" \
-d '{
  "email": "cliente1@ejemplo.com",
  "password": "Cliente123!",
  "name": "María López"
}'

# 2. Instalador instala GPS físicamente (en persona)

# 3. Instalador vincula cliente
curl -X POST https://tu-backend.up.railway.app/installers/link-client \
-H "Authorization: Bearer <token-instalador>" \
-H "Content-Type: application/json" \
-d '{
  "clientId": "uuid-cliente"
}'
```

### Día 3: Primera Suscripción

```bash
# Cliente elige plan PRO de $400
# Backend automáticamente crea comisión de $40 para el instalador
```

### Fin de Mes: Pago de Comisiones

```bash
# Admin revisa comisiones pendientes
curl https://tu-backend.up.railway.app/installers/commissions/summary \
-H "Authorization: Bearer <token-admin>"

# Admin marca como pagada
curl -X PATCH https://tu-backend.up.railway.app/installers/commissions/{id}/mark-paid \
-H "Authorization: Bearer <token-admin>" \
-H "Content-Type: application/json" \
-d '{
  "notes": "Pagado vía transferencia el 31/12/2025"
}'
```

---

## ⚠️ Reglas Importantes

1. **Un cliente solo puede tener UN instalador**
   - Una vez vinculado, no se puede cambiar
   - Si necesitas cambiar, admin debe hacerlo manualmente en BD

2. **Solo la PRIMERA suscripción genera comisión**
   - Renovaciones NO generan comisión
   - Upgrades/downgrades NO generan comisión adicional

3. **Comisión se calcula al momento de la primera suscripción**
   - No importa cuánto dure la suscripción
   - Se paga una sola vez

4. **Instalador debe estar activo**
   - `isActive = true` en la base de datos

5. **Cliente debe estar vinculado ANTES de primera suscripción**
   - Si cliente subscribe sin instalador, NO se genera comisión
   - No se puede generar comisión retroactivamente

---

## 📊 Reportes Disponibles

### Para Instalador

- Total de clientes vinculados
- Total de comisiones generadas
- Total ganado (comisiones pagadas)
- Total pendiente (comisiones sin pagar)
- Lista de todas sus comisiones

### Para Admin

- Lista de todos los instaladores
- Resumen global de comisiones
- Comisiones pendientes de pago
- Comisiones pagadas
- Total a pagar este mes

---

## 🚀 Próximos Pasos

1. ✅ Crear tu usuario admin usando `/admin-setup/create`
2. ⏳ Ejecutar migración para agregar campos de instaladores
3. ⏳ Crear tus primeros instaladores
4. ⏳ Integrar creación automática de comisiones en el flujo de suscripciones
5. ⏳ Crear panel visual en el frontend para instaladores

---

**Documentación relacionada:**
- [CREATE_FIRST_ADMIN.md](CREATE_FIRST_ADMIN.md) - Crear usuario admin
- [DISPOSITIVOS_GPS_COMPATIBLES.md](DISPOSITIVOS_GPS_COMPATIBLES.md) - Guía de dispositivos GPS

---

**Última actualización:** 30 de Diciembre 2025
