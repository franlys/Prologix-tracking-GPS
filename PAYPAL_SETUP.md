# Configuración de PayPal - Resumen del Progreso

## ✅ Completado

1. **Cuenta PayPal Business** - Creada y configurada
2. **Credenciales de API** - Obtenidas (Client ID y Secret)
3. **Variables de entorno locales** - Configuradas en `backend/.env`
4. **SDK de PayPal** - Instalado (`@paypal/paypal-server-sdk`)
5. **PayPalService** - Creado en `backend/src/modules/subscriptions/services/paypal.service.ts`
6. **Fix de suscripciones** - Actualizado SubscriptionGuard para usar planes correctos
7. **Error 403 resuelto** - Los usuarios con plan PROFESIONAL ya pueden acceder al historial

## 🔄 Pendiente

### 1. Agregar PayPal a Railway (Importante)

Ve a [railway.app](https://railway.app) → Tu proyecto → Variables → Agregar:

```bash
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=AUTVRI_rgz9ZseWJNdM6YVHv3XcMMmT3f4PwUjyX-RhZuV_jPV8rN8kTeDClQbhCPGZTOw7lFkr0xGb1
PAYPAL_CLIENT_SECRET=EFOnPvuhfLf9Cnbgsnn2xH-pHajlY5OT8_PYjRHFa7QQ5AfBuyz38CFiZ8YB73Ed7KcUMZ73RfSf4D3z
```

**Para producción** (cuando estés listo):
- Cambia `PAYPAL_MODE` a `live`
- Usa `PAYPAL_CLIENT_ID_LIVE` y `PAYPAL_CLIENT_SECRET_LIVE`

### 2. Registrar PayPalService en el módulo

Editar `backend/src/modules/subscriptions/subscriptions.module.ts`:

```typescript
import { PayPalService } from './services/paypal.service';

@Module({
  providers: [
    SubscriptionsService,
    StripeService,
    PayPalService, // ← Agregar esta línea
  ],
  exports: [SubscriptionsService, PayPalService],
})
```

### 3. Crear planes en PayPal Dashboard

Opción A: **Manual** (Recomendado para empezar)
1. Ve a [PayPal Developer Dashboard](https://developer.paypal.com)
2. Products → Subscriptions → Create Plan
3. Crea 3 planes:
   - **BASICO**: $99 MXN/mes
   - **PROFESIONAL**: $149 MXN/mes
   - **EMPRESARIAL**: $199 MXN/mes
4. Guarda los Plan IDs

Opción B: **Automático** (usando la API)
- Ejecutar script que cree los planes usando `PayPalService.createSubscriptionPlan()`

### 4. Actualizar configuración de planes

Editar `backend/src/modules/subscriptions/config/plans.config.ts`:

```typescript
export const PLANS = {
  [SubscriptionPlan.BASICO]: {
    // ... configuración existente
    pricing: {
      // ... precios existentes
      paypalPlanIdMonthly: 'P-XXX123',  // Plan ID de PayPal
      paypalPlanIdYearly: 'P-XXX456',   // Plan ID de PayPal
    },
  },
  // Repetir para PROFESIONAL y EMPRESARIAL
};
```

### 5. Actualizar SubscriptionsController

Agregar endpoints para PayPal:

```typescript
@Post('checkout/paypal')
async createPayPalCheckout(
  @Request() req,
  @Body() body: { plan: SubscriptionPlan; billingPeriod: BillingPeriod },
) {
  const planConfig = PLANS[body.plan];
  const paypalPlanId = body.billingPeriod === 'MONTHLY'
    ? planConfig.pricing.paypalPlanIdMonthly
    : planConfig.pricing.paypalPlanIdYearly;

  const result = await this.paypalService.createSubscription({
    planId: paypalPlanId,
    returnUrl: `${process.env.FRONTEND_URL}/subscription/success`,
    cancelUrl: `${process.env.FRONTEND_URL}/subscription/cancel`,
    userId: req.user.userId,
  });

  return result; // { subscriptionId, approvalUrl }
}
```

### 6. Configurar Webhooks de PayPal

1. Ve a PayPal Developer → Webhooks
2. Crea un webhook: `https://prologix-tracking-gps-production.up.railway.app/webhooks/paypal`
3. Selecciona eventos:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `BILLING.SUBSCRIPTION.PAYMENT.FAILED`
   - `PAYMENT.SALE.COMPLETED`
4. Copia el Webhook ID y agrégalo a Railway:
   ```
   PAYPAL_WEBHOOK_ID=<webhook-id>
   ```

5. Crear controlador de webhooks:
```typescript
@Post('webhooks/paypal')
async handlePayPalWebhook(@Req() req, @Headers() headers) {
  const verified = await this.paypalService.verifyWebhookSignature(
    req.body,
    headers,
  );

  if (!verified) {
    throw new ForbiddenException('Invalid webhook signature');
  }

  const event = req.body;

  switch (event.event_type) {
    case 'BILLING.SUBSCRIPTION.ACTIVATED':
      // Activar suscripción del usuario
      break;
    case 'BILLING.SUBSCRIPTION.CANCELLED':
      // Cancelar suscripción del usuario
      break;
    // ... otros eventos
  }

  return { received: true };
}
```

### 7. Integrar en el Frontend (React Native)

Instalar SDK:
```bash
cd frontend
npm install react-native-paypal
```

Actualizar pantallas de suscripción para usar PayPal en lugar de Stripe.

### 8. Testing

1. Crear suscripción de prueba con cuenta sandbox
2. Verificar que webhooks funcionen
3. Probar flujo completo: Registro → Seleccionar plan → Pagar → Activación

## 📋 Checklist Final

- [ ] Variables de PayPal en Railway
- [ ] PayPalService registrado en módulo
- [ ] Planes creados en PayPal
- [ ] Plan IDs agregados a configuración
- [ ] Endpoints de checkout creados
- [ ] Webhooks configurados
- [ ] Frontend actualizado
- [ ] Testing completo

## 🚀 Próximos Pasos Inmediatos

1. **Agrega las variables de PayPal en Railway** (5 minutos)
2. **Registra PayPalService en el módulo** (1 minuto)
3. **Haz commit y push de los cambios**
4. **Prueba que la app funcione sin errores 403**
5. **Luego continúa con planes y checkout**

## Credenciales Actuales

**Sandbox:**
- Client ID: `AUTVRI_rgz9ZseWJNdM6YVHv3XcMMmT3f4PwUjyX-RhZuV_jPV8rN8kTeDClQbhCPGZTOw7lFkr0xGb1`
- Secret: `EFOnPvuhfLf9Cnbgsnn2xH-pHajlY5OT8_PYjRHFa7QQ5AfBuyz38CFiZ8YB73Ed7KcUMZ73RfSf4D3z`

**Live:**
- Client ID: (configurado en .env)
- Secret: (configurado en .env)

**Cuenta de prueba para Google Play:**
- Email: googleplay.test@prologix.com
- Password: GooglePlay2026!
- Plan: PROFESIONAL (trial activo)
