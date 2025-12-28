# 🚀 GUÍA DE DEPLOYMENT - Prologix GPS

**Proyecto:** Prologix Tracking GPS
**Stack:** NestJS + PostgreSQL + React Native (Expo)
**Fecha:** 27 de Diciembre, 2025

---

## 📋 ARQUITECTURA DE DEPLOYMENT

```
┌─────────────────────────────────────────────┐
│  FRONTEND (App Móvil)                       │
│  React Native + Expo                        │
│  Deploy: Expo EAS Build → Play Store / App │
└──────────────┬──────────────────────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────────────────────┐
│  BACKEND (API REST)                         │
│  NestJS + TypeScript                        │
│  Deploy: Railway                            │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  DATABASE                                   │
│  PostgreSQL 14+                             │
│  Deploy: Railway PostgreSQL Plugin          │
└─────────────────────────────────────────────┘
```

---

## ✅ PASO 1: VERIFICACIÓN LOCAL (OBLIGATORIO)

### Backend

```bash
cd backend
npm install
npm run build          # ✅ Debe compilar sin errores
npm run start:prod     # ✅ Debe levantar en puerto 3000
```

**Pruebas:**
- http://localhost:3000/auth/me (con token válido)
- http://localhost:3000/devices (con token válido)

### Frontend

```bash
cd frontend
npm install
npx expo start
```

**Pruebas:**
- Presiona `i` para iOS o `a` para Android
- Login con: franlys@prologix.com / password123
- Verificar que carga lista de dispositivos
- Verificar que mapa muestra ubicación

---

## 🔹 PASO 2: CONFIGURAR GIT REPOSITORY

### Si NO tienes Git inicializado:

```bash
# En la raíz del proyecto
git init
git add .
git commit -m "Initial commit - Prologix GPS MVP"
```

### Crear .gitignore

**Archivo:** `.gitignore`

```gitignore
# Backend
backend/node_modules/
backend/dist/
backend/.env

# Frontend
frontend/node_modules/
frontend/.expo/
frontend/dist/

# General
.DS_Store
*.log
.env
.env.local
.env.production
```

### Subir a GitHub

```bash
# Crea un repo en GitHub primero (https://github.com/new)
git remote add origin https://github.com/TU_USUARIO/prologix-gps.git
git branch -M main
git push -u origin main
```

---

## 🔹 PASO 3: DEPLOY BACKEND A RAILWAY

### 3.1 Crear cuenta en Railway

1. Ve a https://railway.app
2. Conecta tu cuenta de GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Selecciona tu repositorio `prologix-gps`

### 3.2 Configurar el Backend

**IMPORTANTE:** Railway necesita saber qué carpeta deployar.

#### Opción A: Root Directory (si el backend está en `/backend`)

En Railway:
- Settings → **Root Directory** → `backend`
- Build Command: `npm run build`
- Start Command: `npm run start:prod`

#### Opción B: Agregar railway.json en la raíz

**Archivo:** `railway.json` (en la raíz del proyecto)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && npm run start:prod",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 3.3 Agregar Base de Datos PostgreSQL

1. En tu proyecto Railway → **New** → **Database** → **Add PostgreSQL**
2. Railway creará automáticamente las variables:
   - `DATABASE_URL`
   - `PGDATABASE`
   - `PGHOST`
   - `PGPASSWORD`
   - `PGPORT`
   - `PGUSER`

### 3.4 Configurar Variables de Entorno

En Railway → Tu backend service → **Variables**

Agrega estas variables:

```env
# Server
PORT=3000
NODE_ENV=production

# Database (Railway las crea automáticamente, pero puedes referenciarlas así)
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_NAME=${{Postgres.PGDATABASE}}

# JWT
JWT_SECRET=prologix_production_jwt_secret_CHANGE_THIS_NOW_2025_secure_random_string
JWT_EXPIRES_IN=7d

# GPS-Trace (usa tu token real)
GPS_TRACE_API_URL=https://api.gps-trace.com
GPS_TRACE_PARTNER_TOKEN=0aND8tB2hzHzsOWsdcoiDuYCcdd3Wg1VaQbfBWex7TwvfZ7Ufpv0Di10tiqx4dJT

# CORS (tu app móvil puede llamar desde cualquier origen)
CORS_ORIGIN=*
```

**⚠️ IMPORTANTE:**

- **JWT_SECRET:** Genera uno nuevo seguro con:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- **GPS_TRACE_PARTNER_TOKEN:** Si el token actual es de prueba, contacta a GPS-Trace para obtener uno de producción.

### 3.5 Deploy

Railway detectará automáticamente:
- `package.json` en `/backend`
- Ejecutará `npm install`
- Ejecutará `npm run build`
- Ejecutará `npm run start:prod`

**Logs:** Revisa los logs en Railway para confirmar:
```
🚀 Prologix Tracking GPS Backend running on port 3000
📡 GPS-Trace Service initialized
```

### 3.6 Obtener URL del Backend

Railway te dará una URL pública como:
```
https://prologix-backend-production.up.railway.app
```

**Guarda esta URL**, la necesitarás para el frontend.

### 3.7 Pruebas en Producción

Prueba con Postman o curl:

```bash
# Health check (si tienes endpoint)
curl https://tu-backend.up.railway.app/

# Login
curl -X POST https://tu-backend.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"franlys@prologix.com","password":"password123"}'

# Debería devolver:
# {"accessToken":"eyJhbGc...", "user":{...}}
```

---

## 🔹 PASO 4: CONFIGURAR FRONTEND PARA PRODUCCIÓN

### 4.1 Crear archivo de configuración

**Archivo:** `frontend/app.config.js`

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
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.prologix.gps"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.prologix.gps",
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000"
    }
  }
};
```

### 4.2 Actualizar API Client

**Archivo:** `frontend/services/api.ts`

Actualizar para usar variable de entorno:

```typescript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Leer desde app.config.js
const BASE_URL = Constants.expoConfig?.extra?.apiUrl ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ... resto del código igual
```

### 4.3 Crear archivos de entorno

**Archivo:** `frontend/.env.production`

```env
EXPO_PUBLIC_API_URL=https://tu-backend.up.railway.app
```

**Archivo:** `frontend/.env.development`

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

---

## 🔹 PASO 5: PUBLICAR APP MÓVIL

### Opción A: APK Directo (Android - Más Rápido)

```bash
cd frontend

# Instalar EAS CLI
npm install -g eas-cli

# Login en Expo
eas login

# Configurar proyecto
eas build:configure

# Build APK para Android
eas build --platform android --profile preview

# Esto generará un APK que puedes descargar e instalar directamente
```

El APK se puede descargar desde el dashboard de Expo y compartir directamente.

### Opción B: Build de Producción (Play Store / App Store)

```bash
# Android (AAB para Play Store)
eas build --platform android --profile production

# iOS (para App Store)
eas build --platform ios --profile production
```

### Opción C: Expo Go (Solo para Testing)

**NO recomendado para producción**, pero útil para demos rápidas:

```bash
npx expo start
```

Comparte el QR code y ábrelo con la app Expo Go.

**⚠️ Limitación:** Expo Go NO soporta `react-native-maps` en producción. Solo usa esto para desarrollo.

---

## 🔹 PASO 6: CREAR USUARIO DE PRODUCCIÓN

Una vez el backend esté en Railway, crea un usuario real:

```bash
# Opción 1: Via API
curl -X POST https://tu-backend.up.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tu-email@prologix.com",
    "password": "password-seguro",
    "name": "Tu Nombre"
  }'

# Opción 2: Conectarte a la BD de Railway y ejecutar SQL
```

Para conectarte a PostgreSQL en Railway:
1. Railway → PostgreSQL → **Connect**
2. Copia el comando `psql` que te dan
3. Ejecuta en tu terminal

---

## 🔹 PASO 7: CHECKLIST FINAL

### Backend en Producción ✅

- [ ] Backend deployado en Railway
- [ ] PostgreSQL funcionando
- [ ] Variables de entorno configuradas
- [ ] `POST /auth/login` responde correctamente
- [ ] `GET /auth/me` con token funciona
- [ ] `GET /devices` con token funciona
- [ ] CORS configurado para permitir app móvil

### Frontend en Producción ✅

- [ ] `app.config.js` configurado
- [ ] Variable `EXPO_PUBLIC_API_URL` apunta a Railway
- [ ] APK generado (o build en Expo)
- [ ] Login funciona desde la app
- [ ] Lista de dispositivos carga
- [ ] Mapa muestra ubicación en tiempo real
- [ ] Auto-refresh cada 10s funciona

---

## 🐛 TROUBLESHOOTING

### Backend no levanta en Railway

**Error:** `Cannot connect to database`

**Solución:**
- Verifica que PostgreSQL está agregado al proyecto
- Verifica variables DB_HOST, DB_PORT, etc.
- Revisa logs en Railway

**Error:** `Module not found`

**Solución:**
- Verifica que `Root Directory` esté en `backend`
- O que `railway.json` tenga el path correcto

### Frontend no conecta al Backend

**Error:** `Network Error` o `timeout`

**Solución:**
- Verifica que `EXPO_PUBLIC_API_URL` esté correcta
- Prueba la URL del backend en navegador primero
- Revisa CORS en el backend (debe permitir `*` o tu origen)

**Error:** `401 Unauthorized`

**Solución:**
- El JWT_SECRET debe ser el mismo en desarrollo y producción
- O regenera el token haciendo login nuevamente

### App no instala en Android

**Error:** `Parse error`

**Solución:**
- Descarga el APK directamente desde Expo
- Habilita "Instalar apps de fuentes desconocidas"
- Verifica que el APK no esté corrupto

---

## 📞 SOPORTE

**Owner:** Franlys González Tejeda
**Email:** franlys@prologix.com

---

## 🎉 ¡LISTO PARA PRODUCCIÓN!

Una vez completados todos los pasos, tendrás:

✅ Backend en Railway con PostgreSQL
✅ App móvil instalable (APK)
✅ GPS tracking en tiempo real funcionando
✅ Sistema de autenticación seguro
✅ Listo para usuarios reales

**Próximos pasos:** Monitoreo, analytics, monetización (Stripe), notificaciones push.
