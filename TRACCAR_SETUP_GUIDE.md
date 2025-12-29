# 🚀 GUÍA DE CONFIGURACIÓN DE TRACCAR
## Prologix GPS - Integración con Traccar

**Última actualización:** 29 de Diciembre, 2025
**Versión del sistema:** Backend con soporte dual (GPS-Trace + Traccar)

---

## 📋 TABLA DE CONTENIDOS

1. [Requisitos Previos](#requisitos)
2. [Instalación de Traccar](#instalacion)
3. [Configuración del Sistema](#configuracion)
4. [Configuración de Puertos GPS](#puertos)
5. [Variables de Entorno](#variables)
6. [Migración de Base de Datos](#migracion)
7. [Pruebas de Conexión](#pruebas)
8. [Configuración de GPS Físicos](#gps-fisicos)
9. [Troubleshooting](#troubleshooting)

---

## 1. REQUISITOS PREVIOS {#requisitos}

### Servidor VPS

**Especificaciones mínimas:**
- **CPU**: 2 vCPU
- **RAM**: 4 GB
- **Disco**: 50 GB SSD
- **OS**: Ubuntu 22.04 LTS (recomendado)
- **Ancho de banda**: Ilimitado

**Proveedores recomendados:**
- [Hetzner](https://www.hetzner.com/) - Mejor relación calidad-precio (~$20/mes)
- [DigitalOcean](https://www.digitalocean.com/) - Fácil de usar (~$24/mes)
- [Vultr](https://www.vultr.com/) - Buen rendimiento (~$24/mes)

### Software Necesario

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Java (requerido por Traccar)
sudo apt install default-jre -y

# Verificar instalación
java -version
# Debe mostrar: openjdk version "11.x.x" o superior
```

---

## 2. INSTALACIÓN DE TRACCAR {#instalacion}

### Paso 1: Descargar Traccar

```bash
# Navegar a /opt
cd /opt

# Descargar Traccar (última versión estable)
sudo wget https://www.traccar.org/download/traccar-linux-64.zip

# Descomprimir
sudo unzip traccar-linux-64.zip

# Verificar archivos
ls -la
# Debe mostrar: traccar.run, traccar.jar, wrapper, etc.
```

### Paso 2: Instalar como Servicio

```bash
# Ejecutar instalador
sudo ./traccar.run

# El instalador creará:
# - Servicio systemd: /etc/systemd/system/traccar.service
# - Configuración: /opt/traccar/conf/traccar.xml
# - Logs: /opt/traccar/logs/
# - Base de datos: /opt/traccar/data/
```

### Paso 3: Iniciar Servicio

```bash
# Iniciar Traccar
sudo systemctl start traccar

# Verificar estado
sudo systemctl status traccar

# Output esperado:
# ● traccar.service - Traccar
#    Loaded: loaded
#    Active: active (running)

# Habilitar inicio automático
sudo systemctl enable traccar
```

### Paso 4: Verificar Instalación

```bash
# Ver logs en tiempo real
sudo tail -f /opt/traccar/logs/tracker-server.log

# Debe mostrar:
# [main] INFO  o.t.Main - Starting server...
# [main] INFO  o.t.WebServer - Web server port: 8082
```

### Paso 5: Acceder a la Interfaz Web

1. Abrir navegador: `http://IP_DEL_SERVIDOR:8082`
2. Credenciales por defecto:
   - **Usuario**: `admin`
   - **Contraseña**: `admin`
3. **IMPORTANTE**: Cambiar contraseña inmediatamente

---

## 3. CONFIGURACIÓN DEL SISTEMA {#configuracion}

### Configuración de Base de Datos (PostgreSQL)

Por defecto, Traccar usa H2 (embedded). Para producción, se recomienda PostgreSQL:

```bash
# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Crear base de datos
sudo -u postgres psql
```

```sql
-- En el prompt de PostgreSQL:
CREATE DATABASE traccar;
CREATE USER traccar WITH PASSWORD 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE traccar TO traccar;
\q
```

### Actualizar Configuración de Traccar

```bash
# Editar configuración
sudo nano /opt/traccar/conf/traccar.xml
```

**Agregar antes de `</properties>`:**

```xml
<!-- Base de datos PostgreSQL -->
<entry key='database.driver'>org.postgresql.Driver</entry>
<entry key='database.url'>jdbc:postgresql://localhost:5432/traccar</entry>
<entry key='database.user'>traccar</entry>
<entry key='database.password'>STRONG_PASSWORD_HERE</entry>

<!-- Configuración de geocoding (opcional) -->
<entry key='geocoder.enable'>true</entry>
<entry key='geocoder.type'>nominatim</entry>

<!-- Configuración de logging -->
<entry key='logger.level'>info</entry>
<entry key='logger.file'>/opt/traccar/logs/tracker-server.log</entry>
```

**Reiniciar Traccar:**

```bash
sudo systemctl restart traccar
sudo systemctl status traccar
```

---

## 4. CONFIGURACIÓN DE PUERTOS GPS {#puertos}

### Puertos Principales

| Marca GPS | Protocolo | Puerto | Configuración |
|-----------|-----------|--------|---------------|
| **Concox** | concox | 5000 | Habilitado por defecto |
| **Teltonika** | teltonika | 5027 | Habilitado por defecto |
| **Queclink** | queclink | 5023 | Habilitado por defecto |
| **TK103** | tk103 | 5001 | Habilitado por defecto |

### Verificar Puertos Activos

```bash
# Ver todos los puertos activos en Traccar
sudo netstat -tulpn | grep java

# Output esperado:
# tcp6  0  0 :::5000  :::*  LISTEN  1234/java
# tcp6  0  0 :::5027  :::*  LISTEN  1234/java
# tcp6  0  0 :::5023  :::*  LISTEN  1234/java
# tcp6  0  0 :::8082  :::*  LISTEN  1234/java
```

### Configurar Firewall (UFW)

```bash
# Instalar UFW si no está instalado
sudo apt install ufw -y

# Abrir puerto API REST
sudo ufw allow 8082/tcp comment 'Traccar Web UI & API'

# Abrir puertos GPS
sudo ufw allow 5000/tcp comment 'Concox GPS'
sudo ufw allow 5027/tcp comment 'Teltonika GPS'
sudo ufw allow 5023/tcp comment 'Queclink GPS'
sudo ufw allow 5001/tcp comment 'TK103 GPS'

# Permitir SSH (importante!)
sudo ufw allow 22/tcp

# Activar firewall
sudo ufw enable

# Verificar estado
sudo ufw status verbose
```

### Agregar Protocolos Adicionales

Si necesitas más protocolos, edita `/opt/traccar/conf/traccar.xml`:

```xml
<!-- Ejemplo: GT06 Protocol -->
<entry key='gt06.port'>5023</entry>

<!-- Ejemplo: H02 Protocol -->
<entry key='h02.port'>5013</entry>
```

**Lista completa de protocolos**: https://www.traccar.org/protocols/

---

## 5. VARIABLES DE ENTORNO {#variables}

### Backend Prologix

Agregar a `.env` en el backend:

```env
# ==================== TRACCAR CONFIGURATION ====================

# URL del servidor Traccar (cambiar IP_DEL_SERVIDOR)
TRACCAR_API_URL=http://IP_DEL_SERVIDOR:8082

# Credenciales de API (crear usuario dedicado)
TRACCAR_API_USER=prologix-service
TRACCAR_API_PASSWORD=STRONG_SECURE_PASSWORD_HERE

# ==================== GPS-TRACE (Legacy) ====================
# Mantener por ahora para compatibilidad
GPS_TRACE_PARTNER_TOKEN=xxxxx
GPS_TRACE_API_URL=https://api.gps-trace.com/v1
```

### Crear Usuario API en Traccar

```bash
# Opción 1: Vía interfaz web
1. Login en http://IP_SERVIDOR:8082
2. Menu → Configuración → Usuarios → Agregar
3. Crear usuario:
   - Nombre: "Prologix Service"
   - Email: "api@prologix.local"
   - Password: STRONG_PASSWORD
   - Rol: Usuario normal (no admin)

# Opción 2: Vía API
curl -X POST http://IP_SERVIDOR:8082/api/users \
  -u admin:admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Prologix Service",
    "email": "api@prologix.local",
    "password": "STRONG_PASSWORD",
    "administrator": false,
    "readonly": false
  }'
```

---

## 6. MIGRACIÓN DE BASE DE DATOS {#migracion}

### Ejecutar Migración

```bash
# En el directorio del backend
cd backend

# Generar migración (ya creada)
# npm run typeorm:cli migration:generate ./src/migrations/AddTraccarSupport

# Ejecutar migración
npm run typeorm:cli migration:run

# Output esperado:
# ✅ Migration AddTraccarSupport1735512000000 has been executed successfully
```

### Verificar Migración

```bash
# Conectar a PostgreSQL
psql -U postgres -d prologix_gps

# Verificar columnas nuevas
\d users

# Debe mostrar:
# gpsProvider      | users_gpsprovider_enum | default 'GPS_TRACE'
# traccarUserId    | character varying      |
```

### Rollback (si es necesario)

```bash
# Revertir última migración
npm run typeorm:cli migration:revert
```

---

## 7. PRUEBAS DE CONEXIÓN {#pruebas}

### Test 1: Verificar Traccar Server

```bash
# Prueba básica de conectividad
curl http://localhost:8082/api/server

# Output esperado:
# {"id":1,"version":"5.x","attributes":{}}
```

### Test 2: Verificar Autenticación

```bash
# Test con credenciales
curl -u admin:admin http://localhost:8082/api/devices

# Output esperado (si no hay devices):
# []

# Output esperado (con devices):
# [{"id":1,"name":"Vehicle 1","uniqueId":"123456789012345",...}]
```

### Test 3: Desde Backend Prologix

```bash
# En el backend
cd backend

# Crear script de prueba temporal
cat > test-traccar.ts << 'EOF'
import { TraccarService } from './src/integrations/traccar/traccar.service';

async function test() {
  const traccar = new TraccarService();

  console.log('Testing Traccar connection...');
  const isConnected = await traccar.testConnection();

  if (isConnected) {
    console.log('✅ Traccar connection successful!');

    const serverInfo = await traccar.getServerInfo();
    console.log('Server version:', serverInfo.version);

    const devices = await traccar.getDevices();
    console.log(`Found ${devices.length} devices`);
  } else {
    console.log('❌ Traccar connection failed');
  }
}

test();
EOF

# Ejecutar prueba
npx ts-node test-traccar.ts

# Eliminar script
rm test-traccar.ts
```

### Test 4: Endpoint desde Frontend

```bash
# Test desde navegador o Postman
# 1. Login en Prologix
POST http://localhost:3000/auth/login
{
  "email": "tu-email@example.com",
  "password": "tu-password"
}

# 2. Copiar el accessToken

# 3. Get devices
GET http://localhost:3000/devices
Authorization: Bearer ACCESS_TOKEN_AQUI

# Debe funcionar incluso si el usuario aún usa GPS-Trace
```

---

## 8. CONFIGURACIÓN DE GPS FÍSICOS {#gps-fisicos}

### Concox GT06N

**Vía SMS:**

```sms
# Configurar servidor y puerto
SERVER,1,IP_TRACCAR,5000,0#

# Configurar APN (ajustar según operador)
APN,internet.com.do#

# Configurar intervalo de reporte (60 segundos)
TIMER,60#

# Verificar configuración
PARAM#
```

**Respuesta esperada:**
```
SERVER OK
APN OK
TIMER OK
```

### Teltonika FMB920

**Vía Configurator Tool:**

1. Descargar: https://teltonika-gps.com/configurator/
2. Conectar GPS vía USB
3. Configurar:
   - **Server**: `IP_TRACCAR:5027`
   - **Protocol**: TCP
   - **APN**: `internet.com.do` (Claro/Altice)
   - **Records**: Send on: Event & Time
   - **Time interval**: 60 seg

### Queclink GV300

**Vía AT Commands:**

```
# Conectar vía USB/Serial
# Baudrate: 115200

# Configurar servidor
AT+GTBSI=gv300,1,,IP_TRACCAR,5023,,,,,,0000$

# Configurar APN
AT+GTCFG=gv300,,,,,,,,,internet.com.do,,,,0000$

# Configurar reporting interval
AT+GTSRI=gv300,1,0,0,60,0,0000$

# Reiniciar
AT+GTRTO=gv300,3,,,,,0000$
```

### Verificar Conexión

```bash
# Monitorear logs de Traccar
sudo tail -f /opt/traccar/logs/tracker-server.log

# Cuando el GPS se conecte, verás:
# [pool-1-thread-1] INFO o.t.p.ConcoxProtocolDecoder - Device connected: 123456789012345
# [pool-1-thread-1] INFO o.t.p.ConcoxProtocolDecoder - Position decoded: lat=18.48, lon=-69.93
```

---

## 9. TROUBLESHOOTING {#troubleshooting}

### Problema 1: Traccar no inicia

**Síntoma:**
```bash
sudo systemctl status traccar
# Active: failed
```

**Solución:**
```bash
# Ver logs detallados
sudo journalctl -u traccar -n 100 --no-pager

# Causas comunes:
# 1. Puerto 8082 ya en uso
sudo netstat -tulpn | grep 8082
sudo kill -9 PID_DEL_PROCESO

# 2. Permisos incorrectos
sudo chown -R traccar:traccar /opt/traccar

# 3. Java no instalado
java -version
sudo apt install default-jre -y

# Reiniciar
sudo systemctl restart traccar
```

### Problema 2: GPS no se conecta

**Síntoma:** GPS envía datos pero no aparece en Traccar

**Solución:**
```bash
# 1. Verificar puerto abierto
sudo ufw status | grep 5000

# 2. Verificar protocolo correcto
# Revisar logs:
sudo tail -f /opt/traccar/logs/tracker-server.log

# 3. Test manual con netcat
nc -l -p 5000
# Encender GPS, debe aparecer data hexadecimal

# 4. Verificar IMEI en Traccar
# El IMEI del GPS debe estar registrado en Traccar
```

### Problema 3: Backend no conecta a Traccar

**Síntoma:**
```
Cannot connect to Traccar server
Connection refused
```

**Solución:**
```bash
# 1. Verificar URL correcta en .env
echo $TRACCAR_API_URL

# 2. Test de conectividad
curl http://IP_TRACCAR:8082/api/server

# 3. Verificar firewall permite tráfico saliente
# En servidor Traccar:
sudo ufw allow from IP_BACKEND to any port 8082

# 4. Verificar credenciales
curl -u TRACCAR_API_USER:TRACCAR_API_PASSWORD \
  http://IP_TRACCAR:8082/api/devices
```

### Problema 4: Posiciones no se actualizan

**Síntoma:** GPS conectado pero posición desactualizada

**Solución:**
```bash
# 1. Verificar intervalo de reporte del GPS
# Debe ser ≤ 60 segundos para tracking activo

# 2. Verificar señal GPS
# En logs de Traccar:
# satellites: 0 → GPS sin señal
# satellites: 4+ → GPS con señal

# 3. Forzar update desde GPS
# Enviar SMS: STATUS# (varía según modelo)

# 4. Verificar en API
curl -u admin:admin \
  http://IP_TRACCAR:8082/api/positions?deviceId=1
```

### Problema 5: Alta latencia

**Síntoma:** Posiciones demoran en aparecer

**Solución:**
```bash
# 1. Verificar carga del servidor
top
# CPU debe estar < 80%

# 2. Optimizar PostgreSQL
sudo nano /etc/postgresql/*/main/postgresql.conf

# Ajustar:
# shared_buffers = 1GB
# work_mem = 50MB
# maintenance_work_mem = 256MB

# Reiniciar PostgreSQL
sudo systemctl restart postgresql

# 3. Agregar índices
psql -U traccar -d traccar

CREATE INDEX idx_positions_deviceid_devicetime
ON tc_positions(deviceid, devicetime DESC);

# 4. Limpiar datos antiguos
# En Traccar web UI:
# Configuración → Server → Default data retention: 30 days
```

---

## 📚 RECURSOS ADICIONALES

### Documentación Oficial
- **Traccar Documentation**: https://www.traccar.org/documentation/
- **API Reference**: https://www.traccar.org/api-reference/
- **Supported Devices**: https://www.traccar.org/devices/
- **Forum**: https://www.traccar.org/forums/

### Comunidad
- **GitHub**: https://github.com/traccar/traccar
- **Telegram**: https://t.me/traccar
- **Discord**: https://discord.gg/traccar

### Guías Específicas
- [Installing Traccar on Ubuntu](https://www.traccar.org/install-ubuntu/)
- [PostgreSQL Configuration](https://www.traccar.org/postgresql/)
- [SMS Commands](https://www.traccar.org/sms-commands/)

---

## ✅ CHECKLIST DE CONFIGURACIÓN

- [ ] VPS provisionado y accesible
- [ ] Java instalado (version 11+)
- [ ] Traccar instalado y corriendo
- [ ] Contraseña admin cambiada
- [ ] PostgreSQL configurado
- [ ] Firewall configurado (puertos 8082, 5000, 5027, 5023)
- [ ] Usuario API creado en Traccar
- [ ] Variables de entorno configuradas en backend
- [ ] Migración de base de datos ejecutada
- [ ] Test de conexión exitoso
- [ ] Al menos 1 GPS configurado y conectado
- [ ] Posiciones visibles en interfaz web
- [ ] Backend Prologix puede consumir API

---

## 🎯 PRÓXIMOS PASOS

Una vez completada esta configuración:

1. **Migrar tu primer usuario**: Ver [`TRACCAR_MIGRATION_ROADMAP.md`](TRACCAR_MIGRATION_ROADMAP.md#fase-4)
2. **Configurar WebSockets**: Para tiempo real
3. **Implementar sincronización de posiciones**: Guardar en DB propia
4. **Configurar alertas**: Geofencing, velocidad, etc.
5. **Escalar infraestructura**: Según crecimiento

---

**¿Problemas?** Revisa la sección de [Troubleshooting](#troubleshooting) o contacta en el foro de Traccar.

**Preparado por**: Claude Sonnet 4.5
**Última actualización**: 29 de Diciembre, 2025
**Versión**: 1.0
