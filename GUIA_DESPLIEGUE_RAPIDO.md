# 🚀 Guía de Despliegue Rápido - Presentación

## 🎯 Objetivo
Tener la app lista para que tu socio la descargue en su teléfono en 2-3 horas.

---

## ✅ PASO 1: Migración de Base de Datos (5 min)

### Opción A: pgAdmin (Recomendado)
1. Abre pgAdmin
2. Conéctate a PostgreSQL
3. Selecciona base de datos `prologix_gps`
4. Abre Query Tool (clic derecho → Query Tool)
5. Abre archivo: `backend/migrations/001-add-subscriptions.sql`
6. Ejecuta (F5 o botón ▶️)
7. Verifica resultado: `Migración completada!`

### Opción B: Terminal
```powershell
# Desde la raíz del proyecto
cd backend
psql -U postgres -d prologix_gps -f migrations/001-add-subscriptions.sql
```

**Verificación:**
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%subscription%';
```
Deberías ver: subscriptions, payment_history, referrals, commission_payouts

---

## ✅ PASO 2: Publicar Backend en Railway (1 hora)

### 2.1 Crear Cuenta en Railway
1. Ve a: https://railway.app/
2. Sign up con GitHub (gratis)
3. Confirma email

### 2.2 Crear Nuevo Proyecto
1. Haz clic: **New Project**
2. Selecciona: **Deploy from GitHub repo**
3. Autoriza Railway a acceder a GitHub
4. Selecciona repo: `Prologix-tracking-GPS`
5. Selecciona carpeta: `backend`

### 2.3 Configurar PostgreSQL
1. En el proyecto, haz clic: **+ New**
2. Selecciona: **Database → PostgreSQL**
3. Espera que se provisione (1-2 min)
4. Copia las variables de entorno (automáticas)

### 2.4 Configurar Variables de Entorno
En Railway, ve a tu servicio backend → **Variables**:

```bash
# Server
NODE_ENV=production
PORT=3000

# Database (Railway las crea automáticamente, verifica que existan)
DATABASE_URL=postgresql://...
PGHOST=...
PGPORT=...
PGUSER=...
PGPASSWORD=...
PGDATABASE=...

# JWT
JWT_SECRET=prologix_gps_jwt_secret_CAMBIA_ESTO_EN_PRODUCCION
JWT_EXPIRES_IN=7d

# GPS-Trace
GPS_TRACE_API_URL=https://api.gps-trace.com
GPS_TRACE_PARTNER_TOKEN=0aND8tB2hzHzsOWsdcoiDuYCcdd3Wg1VaQbfBWex7TwvfZ7Ufpv0Di10tiqx4dJT

# Stripe
STRIPE_SECRET_KEY=sk_test_51SjOfNEYEgG3aMssMkI4Pj9O9AbnGffYcgJHKmvYej5qoA428pMo8s8q1thhYwYUuJ6l6bkER9VKHI4qfpZ788yn00crUmAOGc
STRIPE_PUBLISHABLE_KEY=pk_test_51SjOfNEYEgG3aMssKHY22GlN7yTZ2eRpv86uek2kGfZPEsQz0s6XscgZTyYVl0tP8wmsLc0eAV3pegzMfP4BLRKE001DDmg2QB
STRIPE_WEBHOOK_SECRET=whsec_CONFIGURAR_DESPUES

# Frontend URL (obtendrás la URL después del deploy del frontend)
FRONTEND_URL=https://tu-app-expo.com

# Notificaciones
NOTIFICATIONS_ENABLED=false
```

### 2.5 Ejecutar Migración en Railway
1. Ve a la pestaña **Data** de PostgreSQL
2. Haz clic en **Query**
3. Pega el contenido de `backend/migrations/001-add-subscriptions.sql`
4. Ejecuta

### 2.6 Deploy
1. Railway detectará cambios automáticamente
2. Espera 3-5 minutos
3. Obtendrás una URL: `https://tu-backend.up.railway.app`

**Verificación:**
```bash
curl https://tu-backend.up.railway.app/
# Debería responder: Cannot GET /

curl https://tu-backend.up.railway.app/subscriptions/plans
# Debería devolver JSON con los planes
```

---

## ✅ PASO 3: Configurar Frontend para Producción (30 min)

### 3.1 Actualizar API URL
Edita `frontend/app.config.js` (o créalo si no existe):

```javascript
export default {
  expo: {
    name: "Prologix GPS",
    slug: "prologix-gps",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.prologix.gps"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.prologix.gps"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      apiUrl: "https://tu-backend.up.railway.app", // ← URL de Railway aquí
      eas: {
        projectId: "TU_PROJECT_ID" // Lo obtendrás en el siguiente paso
      }
    }
  }
};
```

### 3.2 Actualizar Llamadas a la API
En todos los archivos que hacen fetch, usa:

```typescript
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

// Ejemplo:
fetch(`${API_URL}/auth/login`, { ... })
```

---

## ✅ PASO 4: Build y Distribución (1 hora)

### 4.1 Instalar EAS CLI
```bash
npm install -g eas-cli
```

### 4.2 Login en Expo
```bash
cd frontend
eas login
# Usa tu cuenta de Expo (crea una si no tienes)
```

### 4.3 Configurar EAS
```bash
eas build:configure
```

Esto creará `eas.json`:
```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### 4.4 Crear Build de Preview
```bash
# Para Android (APK descargable)
eas build --platform android --profile preview

# Para iOS (requiere cuenta de desarrollador de Apple)
eas build --platform ios --profile preview
```

**Tiempo estimado:** 10-15 minutos

**Resultado:** Obtendrás una URL de descarga:
```
https://expo.dev/artifacts/xxxxxxxx
```

---

## ✅ PASO 5: Compartir con tu Socio

### Opción A: APK Directo (Android) - MÁS RÁPIDO
1. Descarga el APK de Expo
2. Envía el archivo por WhatsApp/Email
3. Tu socio lo instala (permitiendo "Fuentes desconocidas")

### Opción B: Expo Go (iOS y Android) - MÁS FÁCIL
```bash
cd frontend
eas update
```

Tu socio:
1. Descarga **Expo Go** desde App Store/Play Store
2. Escanea el QR que te da EAS
3. La app se ejecuta en Expo Go

### Opción C: TestFlight (iOS) - MÁS PROFESIONAL
1. Crea build: `eas build --platform ios --profile preview`
2. Sube a TestFlight (automático con EAS)
3. Invita a tu socio por email
4. Él descarga TestFlight → descarga la app

---

## 📱 Link de Descarga Final

Después de hacer el build, obtendrás:

```
🎉 Build exitoso!

Android APK: https://expo.dev/artifacts/xxxxxxxx
iOS IPA: https://expo.dev/artifacts/yyyyyyyy

O escanea este QR:
█████████████████
█████████████████
█████████████████
```

**Envía este link a tu socio:**
```
Hola, aquí está Prologix GPS para probar:

Android: [Link al APK]
iOS: [Instala TestFlight, luego abre este link]

Usuario demo:
Email: demo@prologix.com
Password: demo123
```

---

## 🧪 Testing Rápido

Antes de mostrarle a tu socio, verifica:

### Backend
```bash
# Ver planes
curl https://tu-backend.up.railway.app/subscriptions/plans

# Login
curl -X POST https://tu-backend.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@prologix.com","password":"demo123"}'
```

### Frontend
1. Abre la app
2. Inicia sesión
3. Ve al mapa → debería mostrar dispositivos
4. Prueba navegación → todos los tabs funcionan

---

## 🎯 Checklist Pre-Presentación

- [ ] Migración ejecutada en BD
- [ ] Backend desplegado en Railway
- [ ] Backend responde a `/subscriptions/plans`
- [ ] Frontend configurado con URL de Railway
- [ ] Build de Android/iOS generado
- [ ] Link de descarga funcionando
- [ ] Usuario demo creado y probado
- [ ] Dispositivos GPS demo visibles
- [ ] Navegación entre pantallas funciona
- [ ] Logo y nombre de la app correctos

---

## 💡 Tips para la Presentación

1. **Crea un usuario demo:**
   ```sql
   INSERT INTO users (email, password, name, role)
   VALUES ('demo@prologix.com', '$2b$10$...', 'Usuario Demo', 'USER');
   ```

2. **Ten datos demo:**
   - Al menos 3 dispositivos GPS
   - Rutas recientes
   - Estadísticas visibles

3. **Prepara el pitch:**
   - "Esto es lo que tenemos funcionando ahora"
   - "Aquí están los planes de suscripción"
   - "Así se ve en el teléfono"
   - "Esto es lo que falta por hacer"

4. **Ten listo el roadmap:**
   - Muestra `ROADMAP_COMPLETO.md`
   - Explica las fases
   - Proyecciones de ingresos

---

## 🆘 Solución de Problemas

### Error: "Cannot connect to server"
- Verifica URL en `app.config.js`
- Verifica que Railway esté corriendo

### Error en build de iOS
- Necesitas cuenta de Apple Developer ($99/año)
- Por ahora usa Android o Expo Go

### APK no instala en Android
- Habilita "Fuentes desconocidas" en Configuración
- O usa Expo Go como alternativa

---

## ⏱️ Timeline Estimado

```
09:00 - Ejecutar migración BD (5 min)
09:05 - Setup Railway (15 min)
09:20 - Deploy backend (10 min)
09:30 - Configurar frontend (20 min)
09:50 - Build con EAS (15 min)
10:05 - Testing (10 min)
10:15 - ✅ LISTO PARA PRESENTAR
```

**Total: ~1 hora 15 minutos**

---

**Última actualización:** 28 de Diciembre 2025
**Próximo paso:** Ejecuta la migración y avísame para continuar con Railway
