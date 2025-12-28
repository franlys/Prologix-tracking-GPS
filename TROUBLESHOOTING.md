# 🔧 TROUBLESHOOTING - Prologix GPS

**Soluciones rápidas a problemas comunes.**

---

## 🐛 PROBLEMA 1: Error al instalar dependencias del frontend

### Error:
```
npm error ERESOLVE could not resolve
npm error Could not resolve dependency:
npm error peer react@"^19.2.3" from react-dom@19.2.3
```

### Solución: ✅
```bash
cd frontend
npm install --legacy-peer-deps
```

**Por qué funciona:** Este es un conflicto de versiones entre React 19.1.0 y react-dom 19.2.3. El flag `--legacy-peer-deps` le dice a npm que ignore estos conflictos de versiones entre dependencias peer.

---

## 🐛 PROBLEMA 2: Warnings de EBADENGINE

### Warning:
```
npm warn EBADENGINE Unsupported engine
npm warn EBADENGINE required: { node: '>=20.19.4' }
npm warn EBADENGINE current: { node: 'v18.20.8' }
```

### Solución: ✅ **IGNORAR**

**Por qué está bien:** Son solo advertencias, NO errores. Expo y React Native funcionan perfectamente en Node v18. Los warnings indican que las dependencias **recomiendan** Node v20+, pero no lo **requieren**.

**Opcional:** Si quieres eliminar los warnings, actualiza Node a v20+:
```bash
# Descargar desde: https://nodejs.org/
# O usar nvm:
nvm install 20
nvm use 20
```

---

## 🐛 PROBLEMA 3: Backend no conecta a PostgreSQL

### Error:
```
Unable to connect to the database
ECONNREFUSED localhost:5432
```

### Soluciones:

#### Opción 1: PostgreSQL no está corriendo
```powershell
# Verificar servicio
Get-Service -Name postgresql*

# Si está detenido, iniciarlo
Start-Service -Name postgresql-x64-14
```

#### Opción 2: Puerto incorrecto
Verifica que el puerto en `.env` coincide con PostgreSQL:
```env
DB_PORT=5434  # O 5432, dependiendo de tu instalación
```

#### Opción 3: Base de datos no existe
```bash
createdb -U postgres -p 5434 prologix_gps
```

---

## 🐛 PROBLEMA 4: Git no está inicializado

### Error:
```
fatal: not a git repository
```

### Solución:
```bash
# En la raíz del proyecto
git init
git add .
git commit -m "Initial commit"
```

---

## 🐛 PROBLEMA 5: Railway no detecta el backend

### Problema:
Railway deploya desde la raíz pero necesita deployar desde `/backend`.

### Solución:
1. En Railway → Settings → **Root Directory** → `backend`
2. O usar `railway.json` (ya creado en el proyecto)

---

## 🐛 PROBLEMA 6: Frontend no conecta al backend en producción

### Error en la app:
```
Network Error
timeout of 10000ms exceeded
```

### Soluciones:

#### Opción 1: URL incorrecta
Verifica `frontend/.env.production`:
```env
EXPO_PUBLIC_API_URL=https://tu-backend-url.up.railway.app
```

**NO debe tener `/` al final.**

#### Opción 2: Backend no está corriendo
Verifica en Railway → Deployments → Logs que el backend levantó:
```
🚀 Prologix Tracking GPS Backend running on port 3000
```

#### Opción 3: CORS bloqueado
Verifica en Railway variables:
```env
CORS_ORIGIN=*
```

---

## 🐛 PROBLEMA 7: APK no instala en Android

### Error:
```
App not installed
Parse error
```

### Soluciones:

#### Opción 1: Habilitar fuentes desconocidas
1. Settings → Security → **Install unknown apps**
2. Encuentra la app que usas para instalar (Chrome, Files, etc.)
3. **Allow from this source**

#### Opción 2: APK corrupto
1. Re-descarga el APK desde Expo dashboard
2. Verifica que se descargó completo (tamaño ~50MB)

#### Opción 3: Espacio insuficiente
Libera espacio en el teléfono (al menos 200MB).

---

## 🐛 PROBLEMA 8: Login falla con 401

### Error en app:
```
Login Failed
Unauthorized
```

### Soluciones:

#### Opción 1: Credenciales incorrectas
Verifica:
- Email: `franlys@prologix.com`
- Password: `password123`

#### Opción 2: Backend no tiene el usuario
Crea el usuario en Railway:
```bash
curl -X POST https://tu-backend.up.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "franlys@prologix.com",
    "password": "password123",
    "name": "Franlys"
  }'
```

#### Opción 3: JWT secret diferente
Asegúrate que el `JWT_SECRET` en Railway es el mismo que usaste localmente, o simplemente haz login nuevamente con el nuevo token.

---

## 🐛 PROBLEMA 9: Mapa no carga dispositivos

### Error:
```
Error fetching devices
404 Not Found
```

### Soluciones:

#### Opción 1: No hay dispositivos GPS
Revisa en Railway logs si GPS-Trace está conectado:
```
📡 GPS-Trace Service initialized
```

#### Opción 2: Usuario no tiene gpsTraceUserId
Verifica en la base de datos que el usuario tiene `gpsTraceUserId` configurado.

---

## 🐛 PROBLEMA 10: EAS Build falla

### Error:
```
Build failed
Command failed: gradle assembleRelease
```

### Soluciones:

#### Opción 1: Reintentar
```bash
eas build --platform android --profile preview --clear-cache
```

#### Opción 2: Verificar configuración
Revisa `frontend/eas.json` y `frontend/app.config.js`.

#### Opción 3: Logs de Expo
Ve al link del build en Expo dashboard y revisa los logs completos.

---

## 📞 SI NADA FUNCIONA

**Envía esta información:**

1. **Error exacto** (screenshot o texto completo)
2. **Comando que ejecutaste**
3. **Logs completos** (Railway o Expo)
4. **Versión de Node:** `node --version`
5. **Sistema operativo**

---

## ✅ VERIFICACIÓN RÁPIDA (Checklist)

Antes de reportar un error, verifica:

- [ ] Backend local funciona (`npm run start:dev`)
- [ ] Frontend local funciona (`npx expo start`)
- [ ] PostgreSQL está corriendo
- [ ] Variables de entorno configuradas
- [ ] Git repository inicializado
- [ ] `.gitignore` excluye archivos sensibles
- [ ] Railway tiene PostgreSQL agregado
- [ ] Expo account creado

---

**Última actualización:** 27 de Diciembre, 2025
