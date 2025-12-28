# 🚀 DEPLOY AHORA - Pasos Exactos

**Proyecto:** Prologix GPS
**Tu Stack:** NestJS + PostgreSQL + React Native (Expo)

---

## ✅ PASO 1: VERIFICAR LOCAL (5 min)

### Backend ✅ (ya verificado)
```bash
cd backend
npm run build   # ✅ Compiló sin errores
```

### Frontend (verificar ahora)
```bash
cd frontend
npm install --legacy-peer-deps
npx expo start
```

**Nota:** Si ves warnings de `EBADENGINE`, está bien. Son solo advertencias de versión de Node.

Presiona `a` para Android o `i` para iOS.
- Login con: `franlys@prologix.com` / `password123`
- ¿Funciona? ✅ Continúa

---

## 🔹 PASO 2: SUBIR A GITHUB (10 min)

```bash
# En la raíz del proyecto
git init
git add .
git commit -m "MVP Prologix GPS - Ready for deployment"
```

### Crear repo en GitHub:
1. Ve a https://github.com/new
2. Nombre: `prologix-gps-tracking`
3. **NO marques** "Initialize with README"
4. Click "Create repository"

### Subir código:
```bash
git remote add origin https://github.com/TU_USUARIO/prologix-gps-tracking.git
git branch -M main
git push -u origin main
```

✅ **Verificación:** Ve a GitHub y confirma que ves tu código.

---

## 🔹 PASO 3: DEPLOY BACKEND A RAILWAY (15 min)

### 3.1 Crear cuenta Railway

1. Ve a https://railway.app
2. **"Login with GitHub"**
3. Autoriza Railway

### 3.2 Nuevo Proyecto

1. **"New Project"**
2. **"Deploy from GitHub repo"**
3. Selecciona `prologix-gps-tracking`
4. Railway empezará a deployar automáticamente

### 3.3 Agregar PostgreSQL

1. En tu proyecto Railway → Click **"+ New"**
2. **"Database"** → **"Add PostgreSQL"**
3. Espera que termine de provisionar (1-2 min)

### 3.4 Configurar Variables de Entorno

1. Click en tu servicio backend (no la base de datos)
2. Pestaña **"Variables"**
3. Click **"+ New Variable"**

Agrega estas UNA POR UNA:

```env
PORT=3000
```

```env
NODE_ENV=production
```

```env
DB_HOST=${{Postgres.PGHOST}}
```

```env
DB_PORT=${{Postgres.PGPORT}}
```

```env
DB_USERNAME=${{Postgres.PGUSER}}
```

```env
DB_PASSWORD=${{Postgres.PGPASSWORD}}
```

```env
DB_NAME=${{Postgres.PGDATABASE}}
```

```env
JWT_SECRET=prologix_prod_jwt_super_secret_2025_CHANGE_ME
```

```env
JWT_EXPIRES_IN=7d
```

```env
GPS_TRACE_API_URL=https://api.gps-trace.com
```

```env
GPS_TRACE_PARTNER_TOKEN=0aND8tB2hzHzsOWsdcoiDuYCcdd3Wg1VaQbfBWex7TwvfZ7Ufpv0Di10tiqx4dJT
```

```env
CORS_ORIGIN=*
```

### 3.5 Configurar Build

1. En tu servicio backend → **"Settings"**
2. **Root Directory:** `backend`
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `npm run start:prod`

### 3.6 Deploy

Railway re-deployará automáticamente.

**Espera 3-5 minutos.** Revisa los logs:

1. Click en tu servicio
2. Pestaña **"Deployments"**
3. Click en el deployment activo
4. Pestaña **"View Logs"**

✅ **Debes ver:**
```
🚀 Prologix Tracking GPS Backend running on port 3000
📡 GPS-Trace Service initialized
```

### 3.7 Obtener URL Pública

1. En tu servicio backend → **"Settings"**
2. Sección **"Networking"**
3. Click **"Generate Domain"**
4. Railway te dará algo como: `prologix-backend-production.up.railway.app`

**📋 COPIA ESTA URL** - la necesitarás para el frontend.

### 3.8 Probar Backend

Abre en tu navegador:
```
https://tu-backend-url.up.railway.app
```

Deberías ver algo (puede ser un error 404, está bien, significa que funciona).

Prueba con Postman o curl:

```bash
curl -X POST https://tu-backend-url.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"franlys@prologix.com","password":"password123"}'
```

✅ **Si devuelve un token → PERFECTO!**

---

## 🔹 PASO 4: CONFIGURAR FRONTEND (5 min)

### 4.1 Actualizar URL del Backend

Edita estos archivos:

**Archivo:** `frontend/.env.production`

```env
EXPO_PUBLIC_API_URL=https://TU-BACKEND-URL.up.railway.app
```

**Archivo:** `frontend/eas.json`

Busca todas las líneas que digan:
```json
"EXPO_PUBLIC_API_URL": "https://your-backend.up.railway.app"
```

Y cámbialas a:
```json
"EXPO_PUBLIC_API_URL": "https://TU-BACKEND-URL.up.railway.app"
```

### 4.2 Commit cambios

```bash
git add .
git commit -m "Update backend URL for production"
git push
```

---

## 🔹 PASO 5: GENERAR APK (20 min)

### 5.1 Instalar EAS CLI

```bash
npm install -g eas-cli
```

### 5.2 Login en Expo

```bash
eas login
```

Si no tienes cuenta:
```bash
eas register
```

### 5.3 Configurar Proyecto

```bash
cd frontend
eas build:configure
```

Preguntará:
- **Project ID:** Presiona ENTER (auto-genera)
- **Android package:** `com.prologix.gps` (ya configurado)

### 5.4 Generar APK

```bash
eas build --platform android --profile preview
```

Preguntará:
- **Generate a new keystore?** → YES

⏳ **Esto toma 15-20 minutos.** Espera.

### 5.5 Descargar APK

Cuando termine, verás:
```
✔ Build finished

https://expo.dev/accounts/TU_USUARIO/projects/prologix-gps/builds/...
```

1. Abre esa URL en tu navegador
2. Click **"Download"**
3. Descarga el `.apk`

### 5.6 Instalar APK

**En tu teléfono Android:**

1. Transfiere el APK a tu teléfono (USB, email, Drive, etc.)
2. Abre el archivo APK en tu teléfono
3. Si dice "App no verificada" → **"Instalar de todos modos"**
4. Habilita "Fuentes desconocidas" si te lo pide

✅ **¡LA APP SE INSTALARÁ!**

---

## 🔹 PASO 6: PROBAR EN PRODUCCIÓN

Abre la app en tu teléfono:

1. **Login:**
   - Email: `franlys@prologix.com`
   - Password: `password123`

2. **¿Login exitoso?** ✅

3. **¿Ves lista de dispositivos?** ✅

4. **Click en un dispositivo → ¿Mapa carga?** ✅

5. **¿Marker se actualiza solo?** (Espera 10 segundos) ✅

---

## 🎉 ¡PRODUCCIÓN COMPLETA!

**Si todo funciona:**

✅ Backend en Railway (PostgreSQL incluido)
✅ APK instalable en Android
✅ Login funciona desde internet
✅ GPS tracking en tiempo real
✅ Listo para usuarios reales

---

## 🐛 SI ALGO FALLA - DEBUG RÁPIDO

### Error: "Network Error" en la app

**Solución:**
1. Verifica que pusiste la URL correcta en `.env.production`
2. Asegúrate que la URL NO tiene `/` al final
3. Prueba la URL del backend en navegador primero

### Error: 401 Unauthorized

**Solución:**
1. Borra la app del teléfono
2. Re-instala el APK
3. Intenta login nuevamente

### Backend no responde

**Solución:**
1. Ve a Railway → Deployments → View Logs
2. Busca errores en rojo
3. Verifica que PostgreSQL está conectado

### APK no instala

**Solución:**
1. Settings → Security → **"Allow installation from unknown sources"**
2. Re-descarga el APK (puede estar corrupto)

---

## 📞 SIGUIENTE PASO

**Envíame:**
1. ✅ URL del backend en Railway
2. ✅ Screenshot de la app funcionando
3. ✅ Confirmación de que login funciona

**Y validamos que TODO esté perfecto antes de lanzamiento oficial! 🚀**
