# 🚀 EJECUTAR MIGRACIONES EN RAILWAY - Solución al Error

**Problema:** `DATABASE_URL` usa hostname interno que no funciona desde tu máquina local.

**Solución:** Ejecutar las migraciones **dentro de Railway**, no localmente.

---

## ✅ MÉTODO 1: Railway Dashboard (MÁS FÁCIL)

### Paso 1: Abrir Railway Dashboard
1. Ve a: https://railway.app
2. Login con tu cuenta
3. Seleccionar proyecto: **invigorating-mercy**
4. Click en el servicio: **backend** o **Prologix-tracking-GPS**

### Paso 2: Abrir Shell
1. En la página del servicio, busca la pestaña **"Shell"** en la parte superior
2. Click en **"Shell"**
3. Espera a que se conecte (aparecerá un prompt `$` o `#`)

### Paso 3: Ejecutar Migraciones
Copia y pega este comando en el shell:

```bash
npm run migrate:prod
```

**O directamente:**

```bash
npm run migration:run
```

### Paso 4: Verificar Salida
Deberías ver:

```
🚀 TypeORM Migration Runner - Production
🔄 Ejecutando migraciones de TypeORM...

Migration AddTraccarSupport1735512000000 has been executed successfully.
Migration CreateGpsPositions1735513000000 has been executed successfully.

✅ Migraciones completadas exitosamente
```

---

## ✅ MÉTODO 2: Railway CLI con Service Link

### Paso 1: Link al servicio específico
```bash
cd backend
railway service
```

Selecciona el servicio **backend** o **Prologix-tracking-GPS**

### Paso 2: Ejecutar migraciones EN Railway (no localmente)
```bash
railway run --service backend bash -c "npm run migration:run"
```

**O más simple:**

```bash
railway run bash -c "cd /app && npm run migration:run"
```

---

## 🐛 ALTERNATIVA: Usar DATABASE_URL Externa

Si prefieres ejecutar localmente, necesitas la URL externa de PostgreSQL:

### Paso 1: Obtener DATABASE_URL externa

**En Railway Dashboard:**
1. Proyecto → PostgreSQL service
2. Pestaña **"Connect"**
3. Copiar **"Public Networking URL"** o **"Database URL"**

Debería verse así:
```
postgresql://postgres:PASSWORD@HOST:PORT/railway
```

### Paso 2: Exportar variable temporal

**En PowerShell:**
```powershell
$env:DATABASE_URL="postgresql://postgres:PASSWORD@HOST:PORT/railway"
cd backend
npm run migration:run
```

---

## 📝 RECOMENDACIÓN: Usar Railway Dashboard

El método más simple y directo es:

1. **https://railway.app**
2. **Tu proyecto → backend → Shell**
3. **`npm run migrate:prod`**

Esto ejecuta las migraciones dentro del contenedor de Railway donde `DATABASE_URL` apunta correctamente al PostgreSQL interno.

---

## ✅ VERIFICACIÓN POST-MIGRACIÓN

Después de ejecutar, verifica con estos comandos **en el Railway Shell**:

### 1. Ver tablas
```bash
node -e "const {Client}=require('pg');const c=new Client({connectionString:process.env.DATABASE_URL});c.connect().then(()=>c.query('SELECT tablename FROM pg_tables WHERE schemaname=\'public\' ORDER BY tablename')).then(r=>{console.log('Tablas:');r.rows.forEach(x=>console.log('✓',x.tablename));c.end()});"
```

### 2. Ver nuevos campos en users
```bash
node -e "const {Client}=require('pg');const c=new Client({connectionString:process.env.DATABASE_URL});c.connect().then(()=>c.query('SELECT column_name FROM information_schema.columns WHERE table_name=\'users\' AND column_name IN (\'gpsProvider\',\'traccarUserId\')')).then(r=>{console.log('Campos:');r.rows.forEach(x=>console.log('✓',x.column_name));c.end()});"
```

---

## 🎯 EJECUTA AHORA

**Método recomendado:**

1. Ve a: **https://railway.app**
2. Abre: **Tu proyecto → backend → Shell**
3. Ejecuta: **`npm run migrate:prod`**

¡Listo! 🚀
