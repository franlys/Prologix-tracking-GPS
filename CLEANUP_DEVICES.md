# Cómo limpiar dispositivos de prueba

## Opción 1: Desde Railway Dashboard (Recomendado)

1. Ve a [railway.app](https://railway.app)
2. Abre tu proyecto Prologix GPS
3. Click en el servicio de PostgreSQL
4. Click en **"Data"** o **"Query"**
5. Ejecuta estos comandos SQL en orden:

```sql
-- Ver dispositivos actuales
SELECT id, name, imei, "userId", "createdAt"
FROM devices
ORDER BY "createdAt" DESC;

-- Eliminar posiciones GPS (libera mucho espacio)
DELETE FROM gps_positions;

-- Eliminar notificaciones
DELETE FROM notifications WHERE "deviceId" IS NOT NULL;

-- Eliminar alertas
DELETE FROM alerts;

-- Eliminar dispositivos
DELETE FROM devices;

-- Verificar que se eliminó todo
SELECT COUNT(*) FROM devices;
SELECT COUNT(*) FROM gps_positions;
```

## Opción 2: Solo eliminar dispositivos de prueba (conservar reales)

Si ya tienes dispositivos reales y solo quieres eliminar los de prueba:

```sql
-- Ver todos los dispositivos
SELECT id, name, imei FROM devices;

-- Eliminar solo dispositivos con nombres de prueba
DELETE FROM gps_positions
WHERE "deviceId" IN (
  SELECT id FROM devices
  WHERE name LIKE '%Test%'
     OR name LIKE '%Prueba%'
     OR name LIKE '%Demo%'
);

DELETE FROM notifications
WHERE "deviceId" IN (
  SELECT id FROM devices
  WHERE name LIKE '%Test%'
     OR name LIKE '%Prueba%'
     OR name LIKE '%Demo%'
);

DELETE FROM devices
WHERE name LIKE '%Test%'
   OR name LIKE '%Prueba%'
   OR name LIKE '%Demo%';
```

## Opción 3: Desde tu app (cuando agregues tus dispositivos reales)

Simplemente no agregues dispositivos de prueba. Cuando compres los GPS reales:

1. Regístralos en GPS-Trace con tu cuenta
2. Agrégalos a la app usando el IMEI real
3. Los dispositivos viejos de prueba quedarán huérfanos y no aparecerán

## ¿Cuándo limpiar?

- **Ahora**: Si quieres empezar con una base de datos limpia
- **Después**: Cuando tengas los GPS reales y quieras eliminar los de prueba
- **Nunca**: Si prefieres dejarlos ahí (no molestan, solo ocupan espacio)

## Scripts creados

He creado tres archivos para ayudarte:

1. `cleanup-test-devices.sql` - SQL directo para ejecutar en Railway
2. `cleanup-devices.js` - Script Node.js completo (requiere DATABASE_URL)
3. `cleanup-devices-simple.js` - Script Node.js simple para BD local

**Recomendación**: Usa la Opción 1 (Railway Dashboard) - es la más segura y directa.
