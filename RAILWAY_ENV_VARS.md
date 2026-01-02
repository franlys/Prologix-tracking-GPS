# Variables de Entorno para Railway - Phases 2-5

## Variables que DEBES agregar en Railway Dashboard

### Opción 1: Traccar Demo Server (RÁPIDO - Para Testing)

Agrega estas variables en **Railway → Backend Service → Variables**:

```env
TRACCAR_API_URL=https://demo.traccar.org
TRACCAR_API_USER=demo
TRACCAR_API_PASSWORD=demo
```

**Ventajas:**
- ✅ Gratis
- ✅ Funciona inmediatamente
- ✅ No requiere instalación

**Desventajas:**
- ⚠️ Datos compartidos públicamente
- ⚠️ Solo para testing/desarrollo
- ⚠️ No apto para producción

---

### Opción 2: Traccar en DigitalOcean (PRODUCCIÓN)

**Costo:** $6/mes

**Paso 1: Crear Droplet en DigitalOcean**

1. Ir a https://digitalocean.com
2. Create Droplet:
   - Image: Ubuntu 22.04 LTS
   - Plan: Basic $6/month (1GB RAM)
   - Location: New York (cercano a RD)
3. Anotar IP del droplet

**Paso 2: Instalar Traccar**

```bash
# SSH al droplet
ssh root@tu-droplet-ip

# Instalar Traccar
wget https://github.com/traccar/traccar/releases/download/v5.10/traccar-linux-64-5.10.zip
apt-get update
apt-get install -y unzip default-jre
unzip traccar-linux-64-5.10.zip
./traccar.run

# Configurar firewall
ufw allow 8082/tcp    # Web interface
ufw allow 5023/tcp    # GT06 protocol (más común)
ufw allow 5013/tcp    # H02 protocol
ufw allow 5002/tcp    # TK103 protocol
ufw enable

# Iniciar servicio
systemctl start traccar
systemctl enable traccar

# Verificar que está corriendo
systemctl status traccar
```

**Paso 3: Configurar en Railway**

```env
TRACCAR_API_URL=http://tu-droplet-ip:8082
TRACCAR_API_USER=admin
TRACCAR_API_PASSWORD=admin
```

**⚠️ IMPORTANTE:** Cambiar password default de Traccar:
1. Ir a `http://tu-droplet-ip:8082`
2. Login: admin / admin
3. Settings → Users → admin → Change password

---

## Variables Existentes que ya tienes

Estas ya están configuradas, NO las modifiques:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=...
GPS_TRACE_API_URL=...
GPS_TRACE_PARTNER_TOKEN=...
STRIPE_SECRET_KEY=...
```

---

## Redis URL

Esta se agrega AUTOMÁTICAMENTE cuando agregas Redis addon:

```env
REDIS_URL=${{Redis.REDIS_URL}}
```

Railway la configura solo, no necesitas hacer nada.

---

## Resumen de Acciones

### Ahora (Opción Rápida - 5 minutos):
1. ✅ Agregar Redis addon en Railway
2. ✅ Copiar y pegar variables de Traccar Demo:
   ```
   TRACCAR_API_URL=https://demo.traccar.org
   TRACCAR_API_USER=demo
   TRACCAR_API_PASSWORD=demo
   ```
3. ✅ Railway auto-redeploy

### Después (Opción Producción - 1 hora):
1. 🔄 Crear DigitalOcean droplet
2. 🔄 Instalar Traccar
3. 🔄 Actualizar variables en Railway con IP del droplet
4. 🔄 Railway auto-redeploy

---

**Recomendación:** Empieza con Traccar Demo para probar que todo funciona, luego migra a DigitalOcean.
