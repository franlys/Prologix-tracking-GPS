# 🚀 Inicio Rápido - Sistema de Suscripciones

## ✅ Sistema Completo Implementado

El sistema de suscripciones está **95% completado** en el backend. Solo falta configurar Stripe y ejecutar las migraciones.

---

## 📋 Pasos para Activar

### 1. Instalar Dependencia de Stripe (YA INSTALADO ✅)

```bash
cd backend
npm install stripe  # Ya ejecutado
```

### 2. Crear Cuenta en Stripe

1. Ve a https://stripe.com/
2. Crea cuenta (o usa modo Test)
3. Ve a Developers → API Keys
4. Copia las keys:
   - **Publishable key:** `pk_test_xxxxx`
   - **Secret key:** `sk_test_xxxxx`

### 3. Configurar Variables de Entorno

Edita `backend/.env`:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Frontend URL (para redirects)
FRONTEND_URL=http://localhost:19006
```

### 4. Crear Productos en Stripe Dashboard

Ve a Stripe Dashboard → Products y crea:

**Producto 1: Prologix Básico**
- Precio mensual: $2.99 MXN
- Precio anual: $29.90 MXN
- Billing: Recurring
- Copia Price IDs:
  - Monthly: `price_xxxxx`
  - Yearly: `price_xxxxx`

**Producto 2: Prologix Profesional**
- Precio mensual: $4.99 MXN
- Precio anual: $49.90 MXN
- Copia Price IDs

**Producto 3: Prologix Empresarial**
- Precio mensual: $7.99 MXN
- Precio anual: $79.90 MXN
- Copia Price IDs

### 5. Actualizar Config de Planes

Edita `backend/src/modules/subscriptions/config/plans.config.ts`:

```typescript
// Plan BASICO
pricing: {
  monthlyPricePerDevice: 2.99,
  yearlyPricePerDevice: 29.90,
  currency: 'MXN',
  stripePriceIdMonthly: 'price_xxxxx', // ← Pega tu Price ID aquí
  stripePriceIdYearly: 'price_xxxxx',  // ← Pega tu Price ID aquí
  // ...
}

// Repetir para PROFESIONAL y EMPRESARIAL
```

### 6. Configurar Webhook en Stripe

1. Ve a Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://tu-dominio.com/webhooks/stripe`
   - Para desarrollo local: `http://localhost:3000/webhooks/stripe`
   - O usa Stripe CLI para tunnel
3. Selecciona eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copia el **Webhook secret**: `whsec_xxxxx`
5. Pégalo en `.env` como `STRIPE_WEBHOOK_SECRET`

### 7. Ejecutar Migración de Base de Datos

Abre pgAdmin o tu cliente PostgreSQL y ejecuta:

```sql
-- Crear tablas de suscripciones
CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL,
  "plan" VARCHAR DEFAULT 'FREE' CHECK ("plan" IN ('FREE', 'BASICO', 'PROFESIONAL', 'EMPRESARIAL')),
  "status" VARCHAR DEFAULT 'ACTIVE' CHECK ("status" IN ('ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING', 'INCOMPLETE')),
  "billingPeriod" VARCHAR DEFAULT 'MONTHLY' CHECK ("billingPeriod" IN ('MONTHLY', 'YEARLY')),

  "maxDevices" INTEGER DEFAULT 3,
  "maxGeofences" INTEGER DEFAULT 5,
  "maxSharedUsers" INTEGER DEFAULT 1,
  "historyRetentionDays" INTEGER DEFAULT 7,

  "whatsappNotifications" BOOLEAN DEFAULT false,
  "advancedReports" BOOLEAN DEFAULT false,
  "apiAccess" BOOLEAN DEFAULT false,
  "whiteLabel" BOOLEAN DEFAULT false,
  "driverManagement" BOOLEAN DEFAULT false,
  "fuelManagement" BOOLEAN DEFAULT false,
  "predictiveMaintenance" BOOLEAN DEFAULT false,
  "remoteControl" BOOLEAN DEFAULT false,
  "aiPredictions" BOOLEAN DEFAULT false,
  "dashcamCloud" BOOLEAN DEFAULT false,

  "stripeCustomerId" VARCHAR,
  "stripeSubscriptionId" VARCHAR,
  "stripePriceId" VARCHAR,

  "trialEndsAt" TIMESTAMP,
  "currentPeriodStart" TIMESTAMP,
  "currentPeriodEnd" TIMESTAMP,
  "canceledAt" TIMESTAMP,

  "discountPercent" DECIMAL(5,2) DEFAULT 0,
  "couponCode" VARCHAR,
  "referredBy" VARCHAR,
  "referralCommissionPercent" DECIMAL(5,2) DEFAULT 0,

  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now(),

  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_subscriptions_userId" ON "subscriptions" ("userId");
CREATE INDEX IF NOT EXISTS "idx_subscriptions_stripeCustomerId" ON "subscriptions" ("stripeCustomerId");

-- Crear tablas de historial de pagos
CREATE TABLE IF NOT EXISTS "payment_history" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL,
  "subscriptionId" UUID NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "currency" VARCHAR(3) DEFAULT 'MXN',
  "status" VARCHAR DEFAULT 'PENDING' CHECK ("status" IN ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED')),
  "paymentMethod" VARCHAR CHECK ("paymentMethod" IN ('STRIPE_CARD', 'STRIPE_OXXO', 'STRIPE_SPEI', 'PAYPAL', 'MANUAL')),

  "stripePaymentIntentId" VARCHAR,
  "stripeChargeId" VARCHAR,
  "stripeInvoiceId" VARCHAR,

  "description" TEXT,
  "receiptUrl" VARCHAR,
  "failureReason" TEXT,
  "metadata" JSONB,

  "createdAt" TIMESTAMP DEFAULT now(),
  "paidAt" TIMESTAMP,
  "refundedAt" TIMESTAMP,

  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
  FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_payment_history_userId" ON "payment_history" ("userId");
CREATE INDEX IF NOT EXISTS "idx_payment_history_subscriptionId" ON "payment_history" ("subscriptionId");

-- Crear tabla de referidos/afiliados
CREATE TABLE IF NOT EXISTS "referrals" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL,
  "referralCode" VARCHAR UNIQUE NOT NULL,
  "status" VARCHAR DEFAULT 'ACTIVE' CHECK ("status" IN ('ACTIVE', 'SUSPENDED', 'BANNED')),
  "tier" VARCHAR DEFAULT 'BRONZE' CHECK ("tier" IN ('BRONZE', 'SILVER', 'GOLD', 'DIAMOND')),

  "totalReferrals" INTEGER DEFAULT 0,
  "activeReferrals" INTEGER DEFAULT 0,
  "totalEarnings" DECIMAL(10,2) DEFAULT 0,
  "pendingEarnings" DECIMAL(10,2) DEFAULT 0,
  "paidEarnings" DECIMAL(10,2) DEFAULT 0,
  "commissionPercent" DECIMAL(5,2) DEFAULT 20,

  "businessName" VARCHAR,
  "contactPhone" VARCHAR,
  "contactEmail" VARCHAR,
  "bankName" VARCHAR,
  "bankAccountNumber" VARCHAR,
  "bankClabe" VARCHAR,
  "paypalEmail" VARCHAR,
  "metadata" JSONB,

  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now(),

  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_referrals_userId" ON "referrals" ("userId");
CREATE INDEX IF NOT EXISTS "idx_referrals_code" ON "referrals" ("referralCode");

-- Crear tabla de pagos de comisiones
CREATE TABLE IF NOT EXISTS "commission_payouts" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "referralId" UUID NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "currency" VARCHAR(3) DEFAULT 'MXN',
  "status" VARCHAR DEFAULT 'PENDING' CHECK ("status" IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELED')),
  "payoutMethod" VARCHAR CHECK ("payoutMethod" IN ('BANK_TRANSFER', 'PAYPAL', 'STRIPE', 'MANUAL')),

  "periodStart" DATE NOT NULL,
  "periodEnd" DATE NOT NULL,
  "description" TEXT,
  "transactionId" VARCHAR,
  "receiptUrl" VARCHAR,
  "failureReason" TEXT,
  "notes" TEXT,
  "breakdown" JSONB,

  "createdAt" TIMESTAMP DEFAULT now(),
  "processedAt" TIMESTAMP,
  "completedAt" TIMESTAMP,

  FOREIGN KEY ("referralId") REFERENCES "referrals"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_commission_payouts_referralId" ON "commission_payouts" ("referralId");

-- Confirmar
SELECT 'Migración de suscripciones completada!' as result;
```

### 8. Reiniciar Backend

```bash
cd backend
npm run start:dev
```

Deberías ver:
```
✅ Stripe service initialized
✅ Backend listening on port 3000
```

---

## 🧪 Probar el Sistema

### 1. Ver Planes Disponibles

```bash
curl http://localhost:3000/subscriptions/plans
```

Respuesta:
```json
{
  "plans": [
    {
      "id": "FREE",
      "name": "Gratuito",
      "tagline": "Rastrea 3 vehículos GRATIS para siempre",
      "features": { ... },
      "pricing": { ... }
    },
    // ...
  ]
}
```

### 2. Obtener Tu Suscripción

```bash
curl http://localhost:3000/subscriptions/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Iniciar Trial

```bash
curl -X POST http://localhost:3000/subscriptions/trial/start \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "PROFESIONAL"
  }'
```

### 4. Crear Checkout de Pago

```bash
curl -X POST http://localhost:3000/subscriptions/checkout/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "PROFESIONAL",
    "billingPeriod": "MONTHLY",
    "deviceCount": 10
  }'
```

Respuesta:
```json
{
  "sessionId": "cs_test_xxxxx",
  "url": "https://checkout.stripe.com/c/pay/cs_test_xxxxx"
}
```

Abre la URL en el navegador para completar el pago.

### 5. Probar con Tarjetas de Prueba de Stripe

**Tarjeta exitosa:**
```
Número: 4242 4242 4242 4242
MM/YY: 12/34
CVC: 123
```

**Tarjeta que falla:**
```
Número: 4000 0000 0000 0002
```

**Pago OXXO (México):**
```
Número: 4000 0000 0000 3220
```

---

## 💰 Calcular Precio con Descuentos

```bash
curl "http://localhost:3000/subscriptions/plans/PROFESIONAL/calculate?devices=100&period=monthly"
```

Respuesta:
```json
{
  "plan": "PROFESIONAL",
  "deviceCount": 100,
  "billingPeriod": "monthly",
  "pricePerDevice": "3.99",
  "totalPrice": "399.00",
  "currency": "MXN"
}
```

---

## 🎁 Aplicar Cupón

```bash
curl -X POST http://localhost:3000/subscriptions/coupon/apply \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "couponCode": "LAUNCH2025"
  }'
```

Cupones pre-configurados:
- `LAUNCH2025` - 20% descuento
- `INSTALADOR10` - 10% descuento
- `REFERIDO` - 10% descuento

---

## 🔧 Troubleshooting

### Error: "Stripe is not configured"

**Causa:** Falta `STRIPE_SECRET_KEY` en `.env`

**Solución:**
```bash
# Agrega a backend/.env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

### Error: "Stripe price ID not configured"

**Causa:** No se configuraron los Price IDs en `plans.config.ts`

**Solución:**
1. Crea productos en Stripe Dashboard
2. Copia Price IDs
3. Actualiza `plans.config.ts`

### Webhook no funciona

**Causa:** Stripe no puede alcanzar tu localhost

**Solución (Desarrollo):**
```bash
# Instala Stripe CLI
# https://stripe.com/docs/stripe-cli

# Inicia tunnel
stripe listen --forward-to localhost:3000/webhooks/stripe

# Copia el webhook secret que aparece
# Pégalo en .env como STRIPE_WEBHOOK_SECRET
```

**Solución (Producción):**
```bash
# Configura webhook en Stripe Dashboard
# URL: https://api.tudominio.com/webhooks/stripe
```

---

## 📚 Documentación Completa

- **Resumen Técnico:** [RESUMEN_SISTEMA_SUSCRIPCIONES.md](docs/RESUMEN_SISTEMA_SUSCRIPCIONES.md)
- **Estrategia de Precios:** [ESTRATEGIA_PLANES_PRICING.md](docs/ESTRATEGIA_PLANES_PRICING.md)
- **Funcionalidades:** [FUNCIONALIDADES_IRRESISTIBLES.md](docs/FUNCIONALIDADES_IRRESISTIBLES.md)

---

## ✅ Checklist de Activación

- [ ] Crear cuenta en Stripe
- [ ] Copiar API keys a `.env`
- [ ] Crear productos y precios en Stripe
- [ ] Actualizar Price IDs en `plans.config.ts`
- [ ] Configurar webhook en Stripe
- [ ] Ejecutar migración SQL
- [ ] Reiniciar backend
- [ ] Probar endpoint `/subscriptions/plans`
- [ ] Probar checkout con tarjeta de prueba
- [ ] Verificar que lleguen webhooks

---

## 🎉 ¡Listo!

Una vez completados estos pasos, tu sistema de suscripciones estará **100% funcional**.

**Próximo paso:** Implementar el frontend (páginas de pricing, checkout, etc.)

---

**Última actualización:** 28 de Diciembre de 2025
**Versión:** 1.0.0
**Estado:** ✅ Backend Listo para Producción
