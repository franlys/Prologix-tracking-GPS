# ⚡ COMANDOS RÁPIDOS DE DEPLOYMENT

Copia y pega estos comandos directamente.

---

## 🔹 PASO 1: Verificar Local

```bash
# Backend (debe compilar sin errores)
cd backend
npm run build

# Frontend (debe abrir Expo)
cd ../frontend
npm install --legacy-peer-deps
npx expo start
```

---

## 🔹 PASO 2: Subir a GitHub

```bash
# En la raíz del proyecto (Prologix-tracking-GPS)
cd ..
git init
git add .
git commit -m "MVP Prologix GPS - Ready for deployment"

# Ir a https://github.com/new y crear repo: prologix-gps-tracking
# Luego ejecutar (reemplaza TU_USUARIO):

git remote add origin https://github.com/TU_USUARIO/prologix-gps-tracking.git
git branch -M main
git push -u origin main
```

---

## 🔹 PASO 3: Railway (Manual - UI)

1. https://railway.app → Login with GitHub
2. New Project → Deploy from GitHub
3. Selecciona `prologix-gps-tracking`
4. + New → Database → PostgreSQL
5. Click en backend → Settings:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
6. Click en backend → Variables → Agregar:

```
PORT=3000
NODE_ENV=production
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_NAME=${{Postgres.PGDATABASE}}
JWT_SECRET=prologix_prod_jwt_2025_CHANGE_THIS_NOW
JWT_EXPIRES_IN=7d
GPS_TRACE_API_URL=https://api.gps-trace.com
GPS_TRACE_PARTNER_TOKEN=0aND8tB2hzHzsOWsdcoiDuYCcdd3Wg1VaQbfBWex7TwvfZ7Ufpv0Di10tiqx4dJT
CORS_ORIGIN=*
```

7. Settings → Networking → Generate Domain
8. **COPIA LA URL** (ejemplo: `prologix-backend.up.railway.app`)

---

## 🔹 PASO 4: Actualizar Frontend URL

Edita `frontend/.env.production`:

```env
EXPO_PUBLIC_API_URL=https://TU-BACKEND-URL.up.railway.app
```

Edita `frontend/eas.json` (3 lugares donde dice `https://your-backend.up.railway.app`):

```json
"EXPO_PUBLIC_API_URL": "https://TU-BACKEND-URL.up.railway.app"
```

Commit:

```bash
git add .
git commit -m "Update production backend URL"
git push
```

---

## 🔹 PASO 5: Generar APK

```bash
# Instalar EAS CLI (solo una vez)
npm install -g eas-cli

# Login (crea cuenta si no tienes)
eas login

# Configurar y generar APK
cd frontend
eas build:configure
eas build --platform android --profile preview
```

⏳ **Espera 15-20 minutos**

Cuando termine, abre la URL que te dan y descarga el APK.

---

## 🔹 PASO 6: Probar en Producción

### Probar Backend (desde terminal):

```bash
curl -X POST https://TU-BACKEND-URL.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"franlys@prologix.com","password":"password123"}'
```

✅ Si devuelve `{"accessToken":"..."}` → **FUNCIONA!**

### Probar APK (en teléfono):

1. Transfiere APK al teléfono
2. Instala (habilita "Fuentes desconocidas" si pide)
3. Login: `franlys@prologix.com` / `password123`

✅ Si login funciona → **PRODUCCIÓN COMPLETA!**

---

## 📋 CHECKLIST FINAL

- [ ] Backend compiló sin errores
- [ ] Frontend abre en Expo local
- [ ] Código en GitHub
- [ ] Backend deployado en Railway
- [ ] PostgreSQL agregado y conectado
- [ ] Variables de entorno configuradas
- [ ] Domain generado en Railway
- [ ] URL actualizada en frontend
- [ ] APK generado con EAS
- [ ] APK instalado en teléfono
- [ ] Login funciona desde app
- [ ] Mapa carga dispositivos

---

**✅ TODO LISTO → Listo para usuarios! 🚀**
