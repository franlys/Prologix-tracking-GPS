-- ========================================
-- MIGRACIÓN: Sistema de Suscripciones
-- Fecha: 28 de Diciembre 2025
-- Descripción: Agrega tablas para gestión de suscripciones, pagos y referidos
-- ========================================

-- 1. TABLA: subscriptions
-- Almacena las suscripciones de los usuarios
CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL,
  "plan" VARCHAR DEFAULT 'FREE' CHECK ("plan" IN ('FREE', 'BASICO', 'PROFESIONAL', 'EMPRESARIAL')),
  "status" VARCHAR DEFAULT 'ACTIVE' CHECK ("status" IN ('ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING', 'INCOMPLETE')),
  "billingPeriod" VARCHAR DEFAULT 'MONTHLY' CHECK ("billingPeriod" IN ('MONTHLY', 'YEARLY')),

  -- Límites por plan
  "maxDevices" INTEGER DEFAULT 3,
  "maxGeofences" INTEGER DEFAULT 5,
  "maxSharedUsers" INTEGER DEFAULT 1,
  "historyRetentionDays" INTEGER DEFAULT 7,

  -- Características habilitadas
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

  -- Stripe integration
  "stripeCustomerId" VARCHAR,
  "stripeSubscriptionId" VARCHAR,
  "stripePriceId" VARCHAR,

  -- Fechas
  "trialEndsAt" TIMESTAMP,
  "currentPeriodStart" TIMESTAMP,
  "currentPeriodEnd" TIMESTAMP,
  "canceledAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now(),

  -- Descuentos y referidos
  "discountPercent" DECIMAL(5,2) DEFAULT 0,
  "couponCode" VARCHAR,
  "referredBy" VARCHAR,
  "referralCommissionPercent" DECIMAL(5,2) DEFAULT 0,

  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Índices para subscriptions
CREATE INDEX IF NOT EXISTS "idx_subscriptions_userId" ON "subscriptions" ("userId");
CREATE INDEX IF NOT EXISTS "idx_subscriptions_stripeCustomerId" ON "subscriptions" ("stripeCustomerId");
CREATE INDEX IF NOT EXISTS "idx_subscriptions_status" ON "subscriptions" ("status");

-- 2. TABLA: payment_history
-- Historial de todos los pagos
CREATE TABLE IF NOT EXISTS "payment_history" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL,
  "subscriptionId" UUID NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "currency" VARCHAR(3) DEFAULT 'MXN',
  "status" VARCHAR DEFAULT 'PENDING' CHECK ("status" IN ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED')),
  "paymentMethod" VARCHAR CHECK ("paymentMethod" IN ('STRIPE_CARD', 'STRIPE_OXXO', 'STRIPE_SPEI', 'PAYPAL', 'MANUAL')),

  -- Stripe info
  "stripePaymentIntentId" VARCHAR,
  "stripeChargeId" VARCHAR,
  "stripeInvoiceId" VARCHAR,

  -- Detalles
  "description" TEXT,
  "receiptUrl" VARCHAR,
  "failureReason" TEXT,
  "metadata" JSONB,

  -- Fechas
  "createdAt" TIMESTAMP DEFAULT now(),
  "paidAt" TIMESTAMP,
  "refundedAt" TIMESTAMP,

  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
  FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE
);

-- Índices para payment_history
CREATE INDEX IF NOT EXISTS "idx_payment_history_userId" ON "payment_history" ("userId");
CREATE INDEX IF NOT EXISTS "idx_payment_history_subscriptionId" ON "payment_history" ("subscriptionId");
CREATE INDEX IF NOT EXISTS "idx_payment_history_status" ON "payment_history" ("status");
CREATE INDEX IF NOT EXISTS "idx_payment_history_createdAt" ON "payment_history" ("createdAt");

-- 3. TABLA: referrals
-- Programa de afiliados/instaladores
CREATE TABLE IF NOT EXISTS "referrals" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL,
  "referralCode" VARCHAR UNIQUE NOT NULL,
  "status" VARCHAR DEFAULT 'ACTIVE' CHECK ("status" IN ('ACTIVE', 'SUSPENDED', 'BANNED')),
  "tier" VARCHAR DEFAULT 'BRONZE' CHECK ("tier" IN ('BRONZE', 'SILVER', 'GOLD', 'DIAMOND')),

  -- Estadísticas
  "totalReferrals" INTEGER DEFAULT 0,
  "activeReferrals" INTEGER DEFAULT 0,
  "totalEarnings" DECIMAL(10,2) DEFAULT 0,
  "pendingEarnings" DECIMAL(10,2) DEFAULT 0,
  "paidEarnings" DECIMAL(10,2) DEFAULT 0,
  "commissionPercent" DECIMAL(5,2) DEFAULT 20,

  -- Info del instalador
  "businessName" VARCHAR,
  "contactPhone" VARCHAR,
  "contactEmail" VARCHAR,

  -- Info de pago
  "bankName" VARCHAR,
  "bankAccountNumber" VARCHAR,
  "bankClabe" VARCHAR,
  "paypalEmail" VARCHAR,
  "metadata" JSONB,

  -- Fechas
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now(),

  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Índices para referrals
CREATE INDEX IF NOT EXISTS "idx_referrals_userId" ON "referrals" ("userId");
CREATE INDEX IF NOT EXISTS "idx_referrals_code" ON "referrals" ("referralCode");
CREATE INDEX IF NOT EXISTS "idx_referrals_status" ON "referrals" ("status");

-- 4. TABLA: commission_payouts
-- Pagos de comisiones a instaladores
CREATE TABLE IF NOT EXISTS "commission_payouts" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "referralId" UUID NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "currency" VARCHAR(3) DEFAULT 'MXN',
  "status" VARCHAR DEFAULT 'PENDING' CHECK ("status" IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELED')),
  "payoutMethod" VARCHAR CHECK ("payoutMethod" IN ('BANK_TRANSFER', 'PAYPAL', 'STRIPE', 'MANUAL')),

  -- Período
  "periodStart" DATE NOT NULL,
  "periodEnd" DATE NOT NULL,

  -- Detalles
  "description" TEXT,
  "transactionId" VARCHAR,
  "receiptUrl" VARCHAR,
  "failureReason" TEXT,
  "notes" TEXT,
  "breakdown" JSONB,

  -- Fechas
  "createdAt" TIMESTAMP DEFAULT now(),
  "processedAt" TIMESTAMP,
  "completedAt" TIMESTAMP,

  FOREIGN KEY ("referralId") REFERENCES "referrals"("id") ON DELETE CASCADE
);

-- Índices para commission_payouts
CREATE INDEX IF NOT EXISTS "idx_commission_payouts_referralId" ON "commission_payouts" ("referralId");
CREATE INDEX IF NOT EXISTS "idx_commission_payouts_status" ON "commission_payouts" ("status");
CREATE INDEX IF NOT EXISTS "idx_commission_payouts_createdAt" ON "commission_payouts" ("createdAt");

-- ========================================
-- VERIFICACIÓN
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '✅ Migración de suscripciones completada exitosamente!';
  RAISE NOTICE '📊 Tablas creadas:';
  RAISE NOTICE '   - subscriptions';
  RAISE NOTICE '   - payment_history';
  RAISE NOTICE '   - referrals';
  RAISE NOTICE '   - commission_payouts';
END $$;

-- Mostrar resumen
SELECT 'Migración completada!' as resultado,
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'subscriptions') as subscriptions_existe,
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'payment_history') as payment_history_existe,
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'referrals') as referrals_existe,
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'commission_payouts') as commission_payouts_existe;
