# 🚀 Deployment a Railway - Prologix GPS

## ✅ Pre-requisitos Completados
- [x] Migración de BD ejecutada localmente
- [x] Backend probado y funcionando
- [x] Endpoints de suscripciones verificados
- [x] Stripe configurado
- [x] Evolution API y Email ya configurados

---

## 📋 PASO 1: Preparar Railway Project

### 1.1 Crear Nuevo Proyecto en Railway
```bash
# Opción A: Usar Railway CLI (si ya lo tienes)
railway login
railway init
railway link

# Opción B: Usar Dashboard Web
# 1. Ve a https://railway.app/
# 2. New Project → Deploy from GitHub repo
# 3. Selecciona: Prologix-tracking-GPS
# 4. Root Directory: /backend
```

### 1.2 Agregar PostgreSQL Database
```bash
# En Railway Dashboard:
# 1. Clic en "+ New"
# 2. Database → PostgreSQL
# 3. Espera que se provisione (1-2 min)
```

Railway automáticamente creará estas variables:
- `DATABASE_URL`
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

---

## 📋 PASO 2: Configurar Variables de Entorno

Ve a tu servicio backend → **Variables** y agrega:

```bash
# Server
NODE_ENV=production
PORT=3000

# JWT (IMPORTANTE: Cambia el secret)
JWT_SECRET=TU_SUPER_SECRET_ALEATORIO_AQUI_2025
JWT_EXPIRES_IN=7d

# GPS-Trace
GPS_TRACE_API_URL=https://api.gps-trace.com
GPS_TRACE_PARTNER_TOKEN=0aND8tB2hzHzsOWsdcoiDuYCcdd3Wg1VaQbfBWex7TwvfZ7Ufpv0Di10tiqx4dJT

# Stripe (usa tus propias claves de Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_TUS_CLAVES_AQUI
STRIPE_PUBLISHABLE_KEY=pk_test_TUS_CLAVES_AQUI
STRIPE_WEBHOOK_SECRET=whsec_CONFIGURAR_DESPUES

# WhatsApp (Evolution API) - YA TIENES ESTO
EVOLUTION_API_URL=https://evolution-api-production-0fa7.up.railway.app
EVOLUTION_API_KEY=429683C4C977415CAAFCCE10F7D57E11

# Email (Gmail) - YA TIENES ESTO
EMAIL_SERVICE=gmail
EMAIL_USER=prologixcompany@gmail.com
EMAIL_PASS=ojct wawx wwig mbzv
EMAIL_FROM=ProLogix Envíos <prologixcompany@gmail.com>

# Notificaciones
NOTIFICATIONS_ENABLED=true
SENDGRID_FROM_EMAIL=noreply@prologix.com
SENDGRID_FROM_NAME=Prologix GPS Tracking

# Frontend URL (actualizarás esto después)
FRONTEND_URL=https://tu-app.vercel.app
```

---

## 📋 PASO 3: Ejecutar Migración en Railway PostgreSQL

### Opción A: Usar Railway PostgreSQL Query Tab
1. Ve a PostgreSQL service → **Data**
2. Clic en **Query**
3. Pega el contenido de `backend/migrations/001-add-subscriptions.sql`
4. Ejecuta

### Opción B: Conectar desde tu máquina local
```bash
# Railway te da una DATABASE_URL tipo:
# postgresql://postgres:PASS@HOST:PORT/railway

# Copia el archivo SQL a Railway
psql $DATABASE_URL -f backend/migrations/001-add-subscriptions.sql

# O usa este script Node.js que creamos:
node backend/run-migration.js
```

**Verificación:**
```sql
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('subscriptions', 'payment_history', 'referrals', 'commission_payouts');
```

Deberías ver las 4 tablas.

---

## 📋 PASO 4: Deploy Backend

Railway detectará cambios automáticamente cuando:
1. Hagas push a GitHub
2. O uses `railway up` desde CLI

```bash
# Si usas CLI:
cd backend
railway up

# Si usas GitHub:
git add .
git commit -m "Add subscription system"
git push origin main
```

**Tiempo estimado:** 3-5 minutos

Railway te dará una URL como:
```
https://prologix-gps-backend-production.up.railway.app
```

---

## 📋 PASO 5: Verificar Deployment

### 5.1 Test Endpoint Público
```bash
curl https://TU-BACKEND-URL.up.railway.app/subscriptions/plans
```

Debería devolver JSON con los 4 planes.

### 5.2 Test Endpoint con Auth (necesitarás un token JWT)
```bash
# Primero registra un usuario de prueba
curl -X POST https://TU-BACKEND-URL.up.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@prologix.com",
    "password": "demo123",
    "name": "Usuario Demo"
  }'

# Login para obtener token
curl -X POST https://TU-BACKEND-URL.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@prologix.com",
    "password": "demo123"
  }'

# Copia el access_token de la respuesta

# Test endpoint autenticado
curl https://TU-BACKEND-URL.up.railway.app/subscriptions/me \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

---

## 📋 PASO 6: Configurar Stripe Webhook (Opcional para ahora)

Esto puede hacerse después, cuando esté en producción real:

1. Ve a Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://TU-BACKEND-URL.up.railway.app/webhooks/stripe`
3. Selecciona eventos:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copia el webhook secret
5. Actualiza variable en Railway: `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## 🎯 Checklist de Deployment

- [ ] Proyecto Railway creado
- [ ] PostgreSQL agregado
- [ ] Variables de entorno configuradas
- [ ] Migración ejecutada en Railway DB
- [ ] Backend desplegado
- [ ] URL de Railway obtenida
- [ ] Endpoint `/subscriptions/plans` funciona
- [ ] Usuario demo creado y login funciona
- [ ] `FRONTEND_URL` actualizada con URL real

---

## 🔄 Siguiente Paso: Frontend

### Para App Móvil (React Native + Expo)
Actualiza `frontend/app.config.js`:
```javascript
export default {
  expo: {
    // ... configuración existente
    extra: {
      apiUrl: "https://TU-BACKEND-URL.up.railway.app",
      eas: {
        projectId: "TU_PROJECT_ID"
      }
    }
  }
}
```

### Para Web (si aplica)
Desplegar en Vercel:
```bash
cd frontend
vercel --prod
```

---

## 🆘 Troubleshooting

### Error: "Cannot connect to database"
- Verifica que PostgreSQL esté running en Railway
- Checa que las variables PGHOST, PGPORT, etc. estén correctas
- Railway debe auto-generar `DATABASE_URL`

### Error: "Port already in use"
- Railway usa `PORT=3000` por defecto, asegúrate que tu app lo respete
- En `src/main.ts` debes usar: `await app.listen(process.env.PORT || 3000)`

### Error: Build fails
- Verifica que `package.json` tenga script `build`
- Checa logs en Railway Dashboard → Deployments

### Error: Migration fails
- Asegúrate de que las tablas no existan ya
- Si existen, puedes hacer DROP TABLE primero (cuidado en producción!)

---

## 📊 Monitoreo

Railway Dashboard te muestra:
- **Metrics**: CPU, Memory, Network
- **Logs**: En tiempo real
- **Deployments**: Historial de deploys

---

**Última actualización:** 28 de Diciembre 2025
**Próximo paso:** Ejecuta PASO 1 y avísame cuando tengas la URL de Railway
