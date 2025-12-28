# 🐘 Setup PostgreSQL - Prologix GPS

## ✅ PASO 1: Abrir SQL Shell (psql)

Desde el menú de inicio de Windows que tienes abierto, haz click en:

**postgresql_18.exe** → **Open**

Se abrirá una ventana de terminal (cmd) negra.

## ✅ PASO 2: Conectar a PostgreSQL

La terminal te hará varias preguntas. **Presiona ENTER en todas** (usa los valores por defecto):

```
Server [localhost]: ← ENTER
Database [postgres]: ← ENTER
Port [5432]: ← ENTER
Username [postgres]: ← ENTER
Password for user postgres: ← ESCRIBE: postgres (y ENTER)
```

**Importante**: Cuando escribas la contraseña NO se verá nada en pantalla. Es normal, solo escribe `postgres` y presiona ENTER.

Si la contraseña es correcta, verás:

```
postgres=#
```

Esto significa que estás conectado ✅

## ✅ PASO 3: Crear la base de datos

Ahora copia y pega este comando:

```sql
CREATE DATABASE prologix_gps;
```

Deberías ver:

```
CREATE DATABASE
```

## ✅ PASO 4: Verificar que se creó

Ejecuta:

```sql
\l
```

Busca en la lista `prologix_gps`. Si la ves, ¡perfecto! ✅

## ✅ PASO 5: Salir

Escribe:

```sql
\q
```

Y presiona ENTER. Se cerrará la terminal.

## ✅ PASO 6: Verificar que el servicio está corriendo

Abre **PowerShell** y ejecuta:

```powershell
Get-Service -Name postgresql*
```

Deberías ver algo como:

```
Status   Name               DisplayName
------   ----               -----------
Running  postgresql-x64-18  PostgreSQL Server 18
```

Si dice **Running**, estás listo ✅

Si dice **Stopped**, inícialo con:

```powershell
Start-Service -Name postgresql-x64-18
```

## ✅ LISTO - Ahora reinicia el backend

Ve a la terminal donde tienes el backend y:

1. Presiona `Ctrl+C` para detenerlo (si aún está corriendo)
2. Ejecuta:

```bash
npm run start:dev
```

Deberías ver:

```
[Nest] xxxxx  - LOG [NestFactory] Starting Nest application...
📡 GPS-Trace Service initialized with API: https://api.gps-trace.com
[Nest] xxxxx  - LOG [TypeOrmModule] TypeOrmModule dependencies initialized
🚀 Prologix Tracking GPS Backend running on port 3000
```

**SIN errores de "Unable to connect to the database"** ✅

---

## 🐛 Troubleshooting

### Si dice "password authentication failed"

La contraseña no es `postgres`. Intenta:

1. Buscar en Windows: "SQL Shell"
2. Cuando pida password, prueba dejarlo vacío (solo ENTER)
3. O prueba con: `admin`, `root`, o la que recuerdes haber puesto

### Si no puedes conectar

Verifica que el servicio esté corriendo:

```powershell
Get-Service -Name postgresql-x64-18
```

Si está detenido, inícialo:

```powershell
Start-Service -Name postgresql-x64-18
```

---

**Siguiente**: Una vez tengas la base de datos creada, el backend se conectará automáticamente.
