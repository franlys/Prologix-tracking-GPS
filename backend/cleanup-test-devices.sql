-- Script para limpiar dispositivos de prueba y datos relacionados
-- Ejecutar en la base de datos de producción Railway

-- Ver primero qué dispositivos existen
SELECT id, name, imei, "userId", "createdAt"
FROM devices
ORDER BY "createdAt" DESC;

-- Eliminar posiciones GPS de dispositivos de prueba
-- (Esto liberará mucho espacio)
DELETE FROM gps_positions
WHERE "deviceId" IN (
  SELECT id FROM devices
  WHERE name LIKE '%Test%'
     OR name LIKE '%Prueba%'
     OR name LIKE '%Demo%'
);

-- Eliminar notificaciones de dispositivos de prueba
DELETE FROM notifications
WHERE "deviceId" IN (
  SELECT id FROM devices
  WHERE name LIKE '%Test%'
     OR name LIKE '%Prueba%'
     OR name LIKE '%Demo%'
);

-- Eliminar alertas de dispositivos de prueba
DELETE FROM alerts
WHERE "deviceId" IN (
  SELECT id FROM devices
  WHERE name LIKE '%Test%'
     OR name LIKE '%Prueba%'
     OR name LIKE '%Demo%'
);

-- Eliminar los dispositivos de prueba
DELETE FROM devices
WHERE name LIKE '%Test%'
   OR name LIKE '%Prueba%'
   OR name LIKE '%Demo%';

-- Verificar que se eliminaron correctamente
SELECT COUNT(*) as remaining_devices FROM devices;
SELECT COUNT(*) as remaining_positions FROM gps_positions;

-- Si quieres eliminar TODOS los dispositivos (usar con precaución):
-- DELETE FROM gps_positions;
-- DELETE FROM notifications WHERE "deviceId" IS NOT NULL;
-- DELETE FROM alerts;
-- DELETE FROM devices;
