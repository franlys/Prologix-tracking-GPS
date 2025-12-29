# 📱 Guía Completa de Deployment y Administración - Prologix GPS

**Fecha:** 28 de Diciembre 2025
**Versión:** 2.0.0
**Estado:** Listo para Producción

---

## 📋 Tabla de Contenidos

1. [Sistema de Roles (Admin vs Clientes)](#sistema-de-roles)
2. [Migración de Clientes Existentes](#migraci%C3%B3n-de-clientes)
3. [Publicación en App Store](#publicaci%C3%B3n-app-store)
4. [Publicación en Play Store](#publicaci%C3%B3n-play-store)
5. [Configuración de Pagos Externos](#pagos-externos)
6. [Comandos de Deployment](#comandos-deployment)

---

## 🔐 Sistema de Roles (Admin vs Clientes)

### Estructura Actual

La tabla `users` en PostgreSQL tiene el campo `role`:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50),
  role VARCHAR(50) DEFAULT 'user', -- 'admin' | 'user'
  gps_trace_user_id VARCHAR(255),
  subscription_plan VARCHAR(50) DEFAULT 'FREE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tipos de Usuarios

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| **user** | Cliente normal | Dashboard, Mapa, Dispositivos, Planes |
| **admin** | Instalador/Admin | Panel Admin (/users), Vincular GPS |

### Cómo Crear Usuarios Admin

#### Opción 1: Manualmente en la Base de Datos

1. **Acceder a PostgreSQL en Railway:**

```bash
# Conectar a Railway DB
railway connect
```

2. **Crear usuario admin:**

```sql
-- Crear nuevo admin
INSERT INTO users (email, password, name, role, subscription_plan)
VALUES (
  'admin@prologix.com',
  '$2a$10$...', -- Hash bcrypt de la contraseña
  'Admin Prologix',
  'admin',
  'EMPRESARIAL'
);
```

3. **Actualizar usuario existente a admin:**

```sql
UPDATE users
SET role = 'admin', subscription_plan = 'EMPRESARIAL'
WHERE email = 'tu-email@prologix.com';
```

#### Opción 2: Crear Endpoint en Backend

**Archivo:** `backend/src/modules/admin/admin.controller.ts`

```typescript
@Post('create-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin') // Solo admin puede crear otros admins
async createAdmin(@Body() createAdminDto: CreateAdminDto) {
  // Validar que el email no exista
  const existingUser = await this.usersService.findByEmail(createAdminDto.email);
  if (existingUser) {
    throw new BadRequestException('El usuario ya existe');
  }

  // Hashear contraseña
  const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

  // Crear admin
  const admin = await this.usersService.create({
    ...createAdminDto,
    password: hashedPassword,
    role: 'admin',
    subscriptionPlan: 'EMPRESARIAL',
  });

  return { message: 'Admin creado exitosamente', userId: admin.id };
}
```

### Flujo de Trabajo Admin → Cliente

1. **Cliente se registra** en la app (role = 'user', plan = 'FREE')
2. **Cliente contacta al instalador** (WhatsApp, teléfono, etc.)
3. **Instalador instala GPS físico** en el vehículo
4. **Instalador vincula GPS** desde `/users`:
   - Login como admin
   - Buscar usuario por email/nombre
   - Click "Vincular GPS"
   - Ingresar ID de GPS-Trace
   - Guardar
5. **Cliente recarga app** y ve sus dispositivos

---

## 🔄 Migración de Clientes Existentes

### Escenario: Tienes clientes con GPS instalados

Si ya tienes clientes usando GPS-Trace y quieres migrarlos a la app:

### Opción 1: Migración Individual

**Proceso por cada cliente:**

1. **Cliente crea cuenta** en la app
2. **Admin vincula GPS** desde panel admin
3. **Cliente recarga** y ve sus dispositivos

### Opción 2: Migración Masiva (SQL)

Si tienes una lista de clientes con sus GPS-Trace IDs:

**Paso 1: Preparar CSV**

```csv
email,name,phone,gps_trace_id,subscription_plan
juan@email.com,Juan Pérez,+1809555-1234,12345,BÁSICO
maria@email.com,María López,+1809555-5678,67890,PRO
```

**Paso 2: Script de Migración**

```sql
-- Crear usuarios en masa
INSERT INTO users (email, name, phone_number, gps_trace_user_id, subscription_plan, password)
VALUES
  ('juan@email.com', 'Juan Pérez', '+1809555-1234', '12345', 'BÁSICO', '$2a$10$defaultpasswordhash'),
  ('maria@email.com', 'María López', '+1809555-5678', '67890', 'PRO', '$2a$10$defaultpasswordhash');
```

**Paso 3: Notificar Clientes**

Envía email/WhatsApp a cada cliente con:
- URL de la app
- Su email registrado
- Contraseña temporal
- Instrucciones para cambiar contraseña

### Opción 3: Script Node.js

**Archivo:** `backend/scripts/migrate-clients.ts`

```typescript
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as csv from 'csv-parser';

const prisma = new PrismaClient();

async function migrateClients() {
  const defaultPassword = await bcrypt.hash('Prologix2025', 10);

  const results = [];

  fs.createReadStream('clients.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      for (const client of results) {
        try {
          await prisma.user.create({
            data: {
              email: client.email,
              name: client.name,
              phoneNumber: client.phone,
              gpsTraceUserId: client.gps_trace_id,
              subscriptionPlan: client.subscription_plan,
              password: defaultPassword,
            },
          });
          console.log(`✅ Migrado: ${client.email}`);
        } catch (error) {
          console.error(`❌ Error en ${client.email}:`, error.message);
        }
      }

      console.log('🎉 Migración completada!');
      await prisma.$disconnect();
    });
}

migrateClients();
```

**Ejecutar:**

```bash
ts-node backend/scripts/migrate-clients.ts
```

---

## 📱 Publicación en App Store (iOS)

### Requisitos Previos

- **Mac con Xcode** 14+
- **Apple Developer Account** ($99/año)
- **App Store Connect** configurado

### Paso 1: Configurar Apple Developer

1. **Crear App ID:**
   - https://developer.apple.com/account/resources/identifiers
   - Identifier: `com.prologix.gps`
   - Name: `Prologix GPS`
   - Capabilities: Location, Push Notifications

2. **Crear Provisioning Profile:**
   - Distribution Profile
   - Asociar con App ID
   - Descargar certificado

### Paso 2: Configurar App Store Connect

1. **Crear nueva app:**
   - https://appstoreconnect.apple.com
   - Name: `Prologix GPS`
   - Bundle ID: `com.prologix.gps`
   - SKU: `PROLOGIX-GPS-001`
   - Primary Language: Spanish (Spain)

2. **Completar información:**
   - **Category:** Navigation
   - **Description:**
     ```
     Prologix GPS es la solución profesional para rastreo GPS en tiempo real.
     Monitorea tus vehículos desde cualquier lugar con nuestra app intuitiva.

     Características:
     • Rastreo GPS en tiempo real
     • Historial de rutas completo
     • Notificaciones inteligentes
     • Geofences (zonas seguras)
     • Reportes detallados
     • Múltiples dispositivos
     ```
   - **Keywords:** GPS, rastreo, tracking, vehículos, ubicación
   - **Screenshots:** 6.5" (iPhone 14 Pro Max) y 12.9" (iPad Pro)
   - **Privacy Policy URL:** https://prologix.com/privacy
   - **Support URL:** https://prologix.com/support

### Paso 3: Actualizar eas.json

Ya está configurado en `frontend/eas.json`:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "tu-apple-id@email.com",
        "ascAppId": "ID_DE_APP_STORE_CONNECT",
        "appleTeamId": "TU_TEAM_ID"
      }
    }
  }
}
```

**Obtener IDs:**

- **App Store Connect ID:** En App Store Connect → App Information → General Information → Apple ID
- **Team ID:** developer.apple.com/account → Membership → Team ID

### Paso 4: Build y Submit

```bash
cd frontend

# Instalar EAS CLI
npm install -g eas-cli

# Login a Expo
eas login

# Build para producción
eas build --platform ios --profile production

# Esperar build (10-30 minutos)
# Recibirás email cuando termine

# Submit a App Store
eas submit --platform ios --profile production
```

### Paso 5: Revisión de Apple

1. **En App Store Connect:**
   - Add Build (seleccionar el build subido)
   - Completar información de versión
   - Submit for Review

2. **Información Adicional:**
   - **Export Compliance:** No (no usa encriptación)
   - **Advertising Identifier:** No
   - **Content Rights:** Sí
   - **Age Rating:** 4+

3. **Esperar Revisión:**
   - Normalmente 1-3 días
   - Apple te notificará por email

### Paso 6: Release

Una vez aprobada:
- **Manual Release:** Tú eliges cuándo publicar
- **Automatic Release:** Se publica automáticamente

---

## 🤖 Publicación en Play Store (Android)

### Requisitos Previos

- **Google Play Console Account** ($25 una vez)
- **Service Account** para automatización

### Paso 1: Configurar Play Console

1. **Crear aplicación:**
   - https://play.google.com/console
   - Create app
   - Name: `Prologix GPS`
   - Default language: Spanish (Spain)
   - App or Game: App
   - Free or Paid: Free

2. **Completar Store Listing:**
   - **Short Description:**
     ```
     Rastreo GPS profesional en tiempo real para tus vehículos
     ```
   - **Full Description:**
     ```
     Prologix GPS es la solución completa para rastreo GPS en tiempo real.

     CARACTERÍSTICAS PRINCIPALES:
     ✓ Rastreo en tiempo real 24/7
     ✓ Historial completo de rutas
     ✓ Notificaciones por WhatsApp y Email
     ✓ Geofences (zonas seguras)
     ✓ Reportes detallados
     ✓ Soporte para múltiples dispositivos

     PLANES FLEXIBLES:
     • Plan FREE: 1 dispositivo de prueba
     • Plan BÁSICO: Hasta 3 dispositivos
     • Plan PRO: Hasta 10 dispositivos
     • Plan EMPRESARIAL: Ilimitado

     Ideal para:
     • Flotas de vehículos
     • Empresas de transporte
     • Propietarios de vehículos
     • Familias
     ```
   - **App Icon:** 512x512 PNG
   - **Feature Graphic:** 1024x500 PNG
   - **Screenshots:** Mínimo 2 (Phone y 7-inch Tablet)
   - **Phone:** 16:9 ratio (1080x1920)
   - **Tablet:** 1600x2560

3. **Categoría y Contacto:**
   - **Category:** Maps & Navigation
   - **Email:** support@prologix.com
   - **Website:** https://prologix.com
   - **Privacy Policy:** https://prologix.com/privacy

### Paso 2: Configurar Service Account

1. **Google Cloud Console:**
   - https://console.cloud.google.com
   - Create Service Account
   - Role: Service Account User
   - Create Key (JSON)
   - Descargar como `google-service-account.json`

2. **Guardar JSON:**
```bash
# Mover a frontend
mv google-service-account.json frontend/
```

3. **Agregar a .gitignore:**
```
google-service-account.json
```

### Paso 3: Build y Submit

```bash
cd frontend

# Build para producción
eas build --platform android --profile production

# Esperar build (5-15 minutos)

# Submit a Play Store
eas submit --platform android --profile production
```

### Paso 4: Crear Release

1. **En Play Console:**
   - Production → Create new release
   - Upload AAB (desde EAS build)
   - Release name: `1.0.0 - Lanzamiento Inicial`
   - Release notes:
     ```
     🎉 ¡Primera versión de Prologix GPS!

     ✓ Rastreo GPS en tiempo real
     ✓ Historial de rutas
     ✓ Notificaciones inteligentes
     ✓ Geofences
     ✓ 4 planes de suscripción
     ```

2. **Revisión de Contenido:**
   - Target audience: 18+
   - Content rating questionnaire
   - Privacy declarations

3. **Review and Rollout:**
   - Countries: Dominican Republic, United States
   - Review → Start rollout to Production

### Paso 5: Esperar Aprobación

- **Tiempo:** 1-7 días
- **Notificación:** Por email

---

## 💳 Configuración de Pagos Externos (Evitar Comisiones)

### Problema

- **Apple App Store:** Cobra 30% de comisión en compras in-app
- **Google Play Store:** Cobra 15-30% de comisión

### Solución: Página Web Externa

No procesar pagos dentro de la app. Redireccionar a sitio web.

### Arquitectura

```
App (Gratis)
    ↓
Usuario ve planes
    ↓
Click "Actualizar Plan"
    ↓
Abre navegador web (externo)
    ↓
Sitio web de Prologix
    ↓
Compra con Stripe (0% comisión)
    ↓
Webhook actualiza DB
    ↓
Usuario recarga app → Plan actualizado
```

### Paso 1: Crear Página de Planes (Web)

**Crear:** `frontend-web/pages/plans.tsx` (Next.js o similar)

```typescript
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';

export default function PlansPage() {
  const router = useRouter();
  const { userId } = router.query;

  const handleUpgrade = async (plan: string) => {
    // Crear Stripe Checkout Session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, plan }),
    });

    const { sessionId } = await response.json();

    // Redireccionar a Stripe
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
    await stripe.redirectToCheckout({ sessionId });
  };

  return (
    <div>
      <h1>Planes Prologix GPS</h1>
      <PlanCard
        name="BÁSICO"
        price="$19.99/mes"
        onClick={() => handleUpgrade('BÁSICO')}
      />
      {/* ... más planes */}
    </div>
  );
}
```

### Paso 2: Modificar App para Redireccionar

**Archivo:** `frontend/app/(tabs)/subscription.tsx`

```typescript
import * as Linking from 'expo-linking';

const handleUpgrade = async (plan: string) => {
  const userId = await getUserId(); // Del token JWT
  const url = `https://prologix.com/plans?userId=${userId}&plan=${plan}`;

  // Abrir navegador externo
  await Linking.openURL(url);
};
```

### Paso 3: Backend Stripe Webhook

**Ya existe en:** `backend/src/modules/subscriptions/webhooks.controller.ts`

```typescript
@Post('stripe')
async handleStripeWebhook(@Req() req: Request) {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Actualizar plan del usuario
    await this.usersService.update(session.metadata.userId, {
      subscriptionPlan: session.metadata.plan,
      stripeCustomerId: session.customer,
    });
  }
}
```

### Paso 4: Cumplir con Políticas de Tiendas

**Para Apple:**

En `subscription.tsx`, agregar texto:

```tsx
<Text style={styles.disclaimer}>
  💡 Los planes se compran en nuestro sitio web.
  Al hacer clic, se abrirá tu navegador.
</Text>
```

**Para Google:**

Similar, pero Google es menos estricto.

### Ventajas

✅ 0% comisión (vs 15-30%)
✅ Control total sobre precios
✅ Acceso a datos de clientes
✅ Flexibilidad en promociones

### Desventajas

⚠️ Usuario sale de la app
⚠️ Requiere sitio web adicional
⚠️ Sincronización manual

---

## 🚀 Comandos de Deployment

### Web (Vercel)

```bash
# Ya deployado automáticamente
# URL: https://prologix-tracking-gps-frontend.vercel.app
```

### Backend (Railway)

```bash
# Ya deployado
# URL: https://prologix-tracking-gps-production.up.railway.app
```

### Build Local para Desarrollo

```bash
cd frontend

# iOS (requiere Mac)
eas build --platform ios --profile development --local

# Android
eas build --platform android --profile development --local

# Instalar en dispositivo
eas build:run --platform android
```

### Build en Cloud (EAS)

```bash
# Producción iOS
eas build --platform ios --profile production

# Producción Android
eas build --platform android --profile production

# Ambos al mismo tiempo
eas build --platform all --profile production
```

---

## 📊 Resumen de Costos

| Servicio | Costo | Frecuencia |
|----------|-------|------------|
| Apple Developer | $99 | Anual |
| Google Play Console | $25 | Una vez |
| Railway (Backend) | ~$10-20 | Mensual |
| Vercel (Web) | $0 (Free tier) | Gratis |
| EAS Builds | Gratis (unlimited) | Gratis |
| PostgreSQL (Railway) | Incluido | - |
| Stripe | 2.9% + $0.30 por transacción | Por venta |

**Total Inicial:** $124
**Total Mensual:** $10-20

---

## ✅ Checklist de Deployment

### Antes de Publicar

- [ ] Probar login/registro en web
- [ ] Probar panel admin
- [ ] Probar vinculación de GPS
- [ ] Verificar notificaciones funcionan
- [ ] Crear al menos 1 admin en DB
- [ ] Preparar screenshots (iOS y Android)
- [ ] Escribir descripción de tiendas
- [ ] Configurar Privacy Policy
- [ ] Configurar Support URL
- [ ] Probar flujo de pagos externo

### Durante Publicación

- [ ] Build iOS con EAS
- [ ] Submit iOS a App Store
- [ ] Build Android con EAS
- [ ] Submit Android a Play Store
- [ ] Configurar Service Account (Android)
- [ ] Completar Store Listings
- [ ] Upload screenshots y assets

### Después de Publicar

- [ ] Monitorear reviews
- [ ] Responder preguntas de usuarios
- [ ] Actualizar documentación
- [ ] Planear v1.1.0

---

## 🆘 Soporte

**Email:** support@prologix.com
**WhatsApp:** +1 (809) XXX-XXXX
**Documentación:** https://docs.prologix.com

---

**Última actualización:** 28 de Diciembre 2025
**Versión de la App:** 2.0.0
**Estado:** ✅ Listo para Producción
